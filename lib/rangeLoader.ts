// Öncelikli ON-DEMAND Range yükleyici (LRU).
// Eski davranış: boş chunk kaldıkça TÜM dosya arka planda indirilir ve bütün
// 2MB buffer'lar süresiz bellekte tutulurdu. Yeni davranış:
//   - Yalnızca kapı (head) bölgesi, motorun aktif penceresi (setWindow: playhead→hedef
//     yolu + hareket yönünde prefetch) ve açık talepler (want) indirilir; film asla
//     baştan sona otomatik indirilmez.
//   - Bellek tavanı aşılınca en uzun süredir kullanılmayan uzak chunk'lar LRU ile
//     bırakılır (kapı bölgesi + playhead çevresi + bekleyen istekler korunur).
//   - Pencere değişince YALNIZCA pencere dışında kalan in-flight istekler iptal edilir —
//     playhead ile hedef arasındaki yol asla iptal edilmez (eski "yol hiç inmiyor →
//     starve-jump" sorunu).
//   - 206 Range desteği korunur; sunucu 200-full dönerse gövde TEK ArrayBuffer olarak
//     saklanır (chunk'lar zero-copy görünümdür) — bu yalnızca Range desteklemeyen
//     sunucular için işlevsel fallback'tir ve uyarı loglanır.

// 512KB: GOP'lu dosyada ~30 kare (1080p). Atlama sonrası hedef GOP'u (~200KB) küçük bir
// istekle gelir; 2MB chunk'ta aynı kare ~4× daha geç çizilirdi.
export const CHUNK_SIZE = 512 * 1024;

type ChunkState = 0 | 1 | 2; // empty | loading | done

export interface RangeLoaderOpts {
  /** Eşzamanlı range isteği tavanı (mobil 2, masaüstü 3). */
  concurrency?: number;
  /** Bellekte tutulan chunk byte tavanı (mobil ~24MB, masaüstü ~64MB). */
  maxBytes?: number;
}

export class RangeLoader {
  readonly url: string;
  totalSize = 0;
  chunkCount = 0;
  /** Teşhis: sunucu Range'i onurlandırdı mı? '206-range' | '200-full' */
  mode = '';
  private states: ChunkState[] = [];
  private buffers: (Uint8Array | null)[] = [];
  private lastUsed: number[] = [];
  private useTick = 0;
  private fetchedBytes = 0;   // kümülatif indirilen (evict sonrası yeniden indirme dahil)
  private residentBytes = 0;  // şu an bellekte tutulan
  peakResidentBytes = 0;
  private concurrency: number;
  private maxBytes: number;
  private inFlight = new Map<number, AbortController>();
  private wanted = new Set<number>(); // motorun açıkça talep ettiği chunk'lar
  private stopped = false;
  private suspended = false; // bölüm inactive / sekme gizli: head dışı istek yok
  private priorityByte = 0;
  private dir = 1; // hareket yönü: pickNext ileri tarafı tercih eder
  private heavyChunks = new Set<number>(); // yalnızca sıralama önceliği — indirme başlatmaz
  private headChunks = 0;
  private attempts: number[] = [];
  private fullBody = false; // 200-full: tek gövde görünümleri, evict edilmez
  private fillEnabled = false; // boşta arka plan doldurma (enableFill)
  private filling = new Set<number>(); // doldurma amaçlı in-flight chunk'lar — iptal edilmez
  private activeKey = '';
  /** Teşhis sayaçları */
  staleAborts = 0;
  wantedMax = 0;
  netInFlightMax = 0;

  onProgress: (doneBytes: number, totalBytes: number) => void = () => {};
  onChunk: (index: number) => void = () => {};
  onError: (err: Error) => void = () => {};

  constructor(url: string, opts: RangeLoaderOpts = {}) {
    this.url = url;
    this.concurrency = Math.max(1, opts.concurrency ?? 2);
    this.maxBytes = opts.maxBytes ?? 64 * 1024 * 1024;
  }

  /** İlk parçayı indirir, toplam boyutu öğrenir. Arka plan dolgusu YOK. */
  async start(): Promise<void> {
    const r = await fetch(this.url, { headers: { Range: `bytes=0-${CHUNK_SIZE - 1}` } });
    if (!r.ok) throw new Error(`codec fetch failed: ${r.status}`); // 404 HTML gövdesi tuzağı (spec §4)
    const buf = new Uint8Array(await r.arrayBuffer());
    if (r.status === 206) {
      this.mode = '206-range';
      const cr = r.headers.get('Content-Range');
      const m = cr && /\/(\d+)$/.exec(cr);
      if (!m) throw new Error('Content-Range missing');
      this.totalSize = parseInt(m[1], 10);
      this.initChunks();
      this.storeChunk(0, buf);
    } else {
      // Sunucu Range desteklemiyor (200) — tüm gövde tek seferde geldi. Range'siz
      // sunucuda parçalı indirme imkânsız; gövdeyi zero-copy görünümlerle sakla.
      this.mode = '200-full';
      console.warn('[film] sunucu Range desteklemiyor (200-full) — LRU devre dışı, gövde tek parça tutuluyor');
      this.totalSize = buf.byteLength;
      this.fullBody = true;
      this.initChunks();
      for (let i = 0; i < this.chunkCount; i++) {
        this.storeChunk(i, buf.subarray(i * CHUNK_SIZE, Math.min((i + 1) * CHUNK_SIZE, this.totalSize)));
      }
    }
  }

  private initChunks() {
    this.chunkCount = Math.ceil(this.totalSize / CHUNK_SIZE);
    this.states = new Array(this.chunkCount).fill(0);
    this.buffers = new Array(this.chunkCount).fill(null);
    this.lastUsed = new Array(this.chunkCount).fill(0);
    this.attempts = new Array(this.chunkCount).fill(0);
  }

  /** Kapı bölgesi: ilk N kareyi kapsayan byte sınırı — kalıcı öncelik, LRU'dan muaf. */
  setHeadBytes(byteEnd: number) {
    this.headChunks = Math.min(this.chunkCount, Math.ceil(byteEnd / CHUNK_SIZE));
    for (let c = 0; c < this.headChunks; c++) if (this.states[c] === 0) this.wanted.add(c);
    this.pump();
  }

  /** Ağır bölgeler artık otomatik indirilmez — yalnızca eşit öncelikte sıralamada öne alınır. */
  setHeavyRegions(ranges: Array<[number, number]>) {
    this.heavyChunks.clear();
    for (const [a, b] of ranges) {
      for (let c = Math.floor(a / CHUNK_SIZE); c <= Math.floor(b / CHUNK_SIZE) && c < this.chunkCount; c++) {
        this.heavyChunks.add(c);
      }
    }
  }

  /** Belirli bir byte aralığını en öne al (starve eden sample için). */
  bump(offset: number) {
    this.priorityByte = offset;
    this.want(offset, 1);
  }

  /** Motorun açık range talebi: [offset, offset+size) kapsayan chunk'ları indir.
   *  Suspend durumunda head/gate dışı talepler yok sayılır. */
  want(offset: number, size: number) {
    if (this.totalSize === 0 || this.stopped) return;
    const c0 = Math.floor(offset / CHUNK_SIZE);
    const c1 = Math.floor((offset + Math.max(1, size) - 1) / CHUNK_SIZE);
    let added = false;
    for (let c = c0; c <= c1 && c < this.chunkCount; c++) {
      if (this.suspended && c >= this.headChunks) continue;
      if (this.states[c] === 0 && !this.wanted.has(c)) {
        this.wanted.add(c);
        added = true;
      }
    }
    if (this.wanted.size > this.wantedMax) this.wantedMax = this.wanted.size;
    if (added) {
      this.abortStale();
      this.pump();
    }
  }

  /** Aktif pencere: [from, to) byte aralıkları. Aralıklardaki tüm chunk'lar indirme
   *  listesine girer (prefetch); pencere dışına düşen bekleyen talepler silinir ve
   *  in-flight istekler iptal edilir (head/gate hariç). Chunk kümesi değişmedikçe
   *  yalnızca öncelik güncellenir — kare başına Set üretimi yok. */
  setWindow(ranges: Array<[number, number]>, priorityByte: number, dir: number) {
    if (this.chunkCount === 0) return;
    this.priorityByte = priorityByte;
    this.dir = dir < 0 ? -1 : 1;
    const spans = ranges.map(([a, b]) => [
      Math.max(0, Math.floor(a / CHUNK_SIZE)),
      Math.min(this.chunkCount - 1, Math.floor((Math.max(a + 1, b) - 1) / CHUNK_SIZE)),
    ]);
    const key = spans.map(([a, b]) => a + '-' + b).join(',');
    if (key === this.activeKey) return;
    this.activeKey = key;
    const allowed = new Set<number>();
    for (const [a, b] of spans) for (let c = a; c <= b; c++) allowed.add(c);
    // Pencereye ≤ABORT_SLACK chunk uzaklıktaki in-flight istekler tamamlansın: fling
    // sırasında pencere her karede kayar; hepsini iptal etmek hiçbir chunk'ın inmemesi demek.
    // Bunlar wanted'da KALIR — aksi halde abortStale onları "istenmiyor" diye keser.
    const ABORT_SLACK = 2;
    const near = (c: number) => spans.some(([a, b]) => c >= a - ABORT_SLACK && c <= b + ABORT_SLACK);
    for (const c of [...this.wanted]) {
      if (c < this.headChunks || allowed.has(c)) continue;
      if (this.inFlight.has(c) && near(c)) continue;
      this.wanted.delete(c);
    }
    for (const [c, ctrl] of this.inFlight) {
      if (c < this.headChunks || allowed.has(c) || near(c) || this.filling.has(c)) continue;
      ctrl.abort();
      this.staleAborts++;
    }
    if (this.suspended) return;
    for (const c of allowed) if (this.states[c] === 0) this.wanted.add(c);
    if (this.wanted.size > this.wantedMax) this.wantedMax = this.wanted.size;
    this.pump();
  }

  /** Boşta arka plan doldurma: acil/pencere talebi yokken bağlantı boşta kalmasın,
   *  dosyanın geri kalanı (önce hareket yönü) indirilsin. Yalnızca dosya bellek tavanına
   *  TAMAMEN sığıyorsa açılır — aksi halde LRU tahliyesiyle sonsuz indirme döngüsü olur.
   *  Acil talepler için her zaman bir bağlantı boş bırakılır. */
  enableFill(on: boolean) {
    this.fillEnabled = on && !this.fullBody && this.totalSize > 0 && this.totalSize <= this.maxBytes;
    if (this.fillEnabled) this.pump();
  }

  get fillActive(): boolean {
    return this.fillEnabled;
  }

  /** Bölüm inactive veya sekme gizli: yeni istek başlatma, head dışı bekleyen
   *  talepleri temizle, gereksiz in-flight istekleri iptal et. */
  suspend() {
    if (this.suspended) return;
    this.suspended = true;
    this.activeKey = ''; // dönüşte pencere yeniden kurulsun
    for (const c of [...this.wanted]) {
      if (c >= this.headChunks) this.wanted.delete(c);
    }
    for (const [c, ctrl] of this.inFlight) {
      if (c >= this.headChunks) {
        ctrl.abort();
        this.staleAborts++;
      }
    }
  }

  /** Bölüme dönüş: istekler yeniden açılır (motor güncel pencereyi yeniden talep eder). */
  resumeLoading() {
    if (!this.suspended) return;
    this.suspended = false;
    this.pump();
  }

  get wantedSize(): number {
    return this.wanted.size;
  }

  get netInFlight(): number {
    return this.inFlight.size;
  }

  hasRange(offset: number, size: number): boolean {
    if (this.totalSize === 0) return false;
    const c0 = Math.floor(offset / CHUNK_SIZE);
    const c1 = Math.floor((offset + size - 1) / CHUNK_SIZE);
    for (let c = c0; c <= c1; c++) if (this.states[c] !== 2) return false;
    return true;
  }

  /** [offset, offset+size) aralığını tek Uint8Array olarak döndürür. hasRange önkoşul. */
  readRange(offset: number, size: number): Uint8Array {
    const c0 = Math.floor(offset / CHUNK_SIZE);
    const c1 = Math.floor((offset + size - 1) / CHUNK_SIZE);
    for (let c = c0; c <= c1; c++) this.touch(c);
    if (c0 === c1) {
      const buf = this.buffers[c0]!;
      const local = offset - c0 * CHUNK_SIZE;
      return buf.subarray(local, local + size);
    }
    const out = new Uint8Array(size);
    let written = 0;
    for (let c = c0; c <= c1; c++) {
      const buf = this.buffers[c]!;
      const chunkStart = c * CHUNK_SIZE;
      const from = Math.max(offset, chunkStart) - chunkStart;
      const to = Math.min(offset + size, chunkStart + buf.byteLength) - chunkStart;
      out.set(buf.subarray(from, to), written);
      written += to - from;
    }
    return out;
  }

  /** Kümülatif indirilen byte (kapı ilerlemesi + teşhis). */
  get doneBytes(): number {
    return this.fetchedBytes;
  }

  /** Bellekte şu an tutulan chunk byte'ları (teşhis). */
  get residentBytesNow(): number {
    return this.residentBytes;
  }

  get complete(): boolean {
    return this.chunkCount > 0 && this.states.every((s) => s === 2);
  }

  stop() {
    this.stopped = true;
    for (const ctrl of this.inFlight.values()) ctrl.abort();
    this.inFlight.clear();
  }

  private touch(c: number) {
    this.lastUsed[c] = ++this.useTick;
  }

  private storeChunk(index: number, data: Uint8Array) {
    if (this.states[index] === 2) return;
    this.buffers[index] = data;
    this.states[index] = 2;
    this.fetchedBytes += data.byteLength;
    this.residentBytes += data.byteLength;
    if (this.residentBytes > this.peakResidentBytes) this.peakResidentBytes = this.residentBytes;
    this.wanted.delete(index);
    this.touch(index);
    this.evict();
    this.onChunk(index);
    this.onProgress(this.fetchedBytes, this.totalSize);
  }

  /** LRU tahliye: tavan aşılınca en uzun süredir dokunulmayan uzak chunk'lar bırakılır.
   *  Kapı bölgesi, playhead çevresi ve bekleyen istekler asla tahliye edilmez. */
  private evict() {
    if (this.fullBody || this.residentBytes <= this.maxBytes) return;
    const priChunk = Math.floor(this.priorityByte / CHUNK_SIZE);
    const cand: number[] = [];
    for (let c = 0; c < this.chunkCount; c++) {
      if (this.states[c] !== 2 || !this.buffers[c]) continue;
      if (c < this.headChunks) continue;
      if (Math.abs(c - priChunk) <= 2) continue;
      if (this.wanted.has(c)) continue;
      cand.push(c);
    }
    cand.sort((a, b) => this.lastUsed[a] - this.lastUsed[b]);
    for (const c of cand) {
      if (this.residentBytes <= this.maxBytes) break;
      this.residentBytes -= this.buffers[c]!.byteLength;
      this.buffers[c] = null;
      this.states[c] = 0; // gerekirse yeniden indirilir
    }
  }

  /** Hedef değişince artık yakın olmayan in-flight istekleri iptal et. */
  private abortStale() {
    if (this.inFlight.size < this.concurrency) return;
    const priChunk = Math.floor(this.priorityByte / CHUNK_SIZE);
    for (const [c, ctrl] of this.inFlight) {
      if (c < this.headChunks) continue;
      if (this.wanted.has(c) || this.filling.has(c)) continue;
      if (Math.abs(c - priChunk) <= 2) continue;
      ctrl.abort(); // catch tarafında state 0'a döner, hata sayılmaz
      this.staleAborts++;
    }
  }

  /** Sıradaki chunk: kapı bölgesi → istek listesinde playhead'e en yakın olan;
   *  hareket yönündeki taraf avantajlı (eşitlikte ağır bölge üyesi öne alınır). */
  private pickNext(): number {
    for (let c = 0; c < this.headChunks; c++) {
      if (this.states[c] === 0) return c;
    }
    const priChunk = Math.floor(this.priorityByte / CHUNK_SIZE);
    let best = -1;
    let bestScore = Infinity;
    for (const c of this.wanted) {
      if (this.states[c] !== 0) continue;
      // hareket yönü avantajlı: ters taraftaki mesafe 2× cezalı
      const rel = (c - priChunk) * this.dir;
      const d = rel >= 0 ? rel : -rel * 2;
      const score = d - (this.heavyChunks.has(c) ? 0.5 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (best >= 0 || !this.fillEnabled || this.suspended) return best;
    // Boşta doldurma: talep yok → playhead'e en yakın inmemiş chunk (yön avantajlı),
    // acil talepler için bir bağlantı boş kalır.
    if (this.concurrency > 1 && this.filling.size >= this.concurrency - 1) return -1;
    for (let c = 0; c < this.chunkCount; c++) {
      if (this.states[c] !== 0) continue;
      const rel = (c - priChunk) * this.dir;
      const score = rel >= 0 ? rel : -rel * 2;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    if (best >= 0) this.filling.add(best);
    return best;
  }

  private pump() {
    if (this.stopped || this.chunkCount === 0) return;
    while (this.inFlight.size < this.concurrency) {
      const c = this.pickNext();
      if (c < 0) return;
      if (this.suspended && c >= this.headChunks) return; // inactive: yalnızca head/gate
      this.states[c] = 1;
      const ctrl = new AbortController();
      this.inFlight.set(c, ctrl);
      if (this.inFlight.size > this.netInFlightMax) this.netInFlightMax = this.inFlight.size;
      const from = c * CHUNK_SIZE;
      const to = Math.min(this.totalSize, from + CHUNK_SIZE) - 1;
      fetch(this.url, { headers: { Range: `bytes=${from}-${to}` }, signal: ctrl.signal })
        .then(async (r) => {
          if (!r.ok) throw new Error(`range fetch ${c} failed: ${r.status}`);
          this.storeChunk(c, new Uint8Array(await r.arrayBuffer()));
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') {
            this.states[c] = 0; // bilinçli iptal — hata sayma, istek listesinden de düş
            return;
          }
          this.attempts[c]++;
          if (this.attempts[c] >= 4) {
            // Kalıcı hata: yükleyiciyi durdur, motor fallback'e karar versin
            this.stopped = true;
            this.onError(err instanceof Error ? err : new Error(String(err)));
          } else {
            this.states[c] = 0; // yeniden denenebilir
          }
        })
        .finally(() => {
          this.inFlight.delete(c);
          this.filling.delete(c);
          if (!this.stopped) this.pump();
        });
    }
  }
}
