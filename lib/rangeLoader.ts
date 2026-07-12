// Öncelikli Range yükleyici.
// Dosya sabit boyutlu parçalara bölünür; zamanlayıcı her slotta en yüksek öncelikli
// parçayı indirir. Öncelik: playhead-ilerisi > ağır bölgeler > lineer sıra (spec §3).
// Her parça ham olarak saklanır — sample byte'ları buradan rastgele erişimle okunur.

export const CHUNK_SIZE = 2 * 1024 * 1024;

type ChunkState = 0 | 1 | 2; // empty | loading | done

export class RangeLoader {
  readonly url: string;
  totalSize = 0;
  chunkCount = 0;
  /** Teşhis: sunucu Range'i onurlandırdı mı? '206-range' | '200-full' */
  mode = '';
  private states: ChunkState[] = [];
  private buffers: (Uint8Array | null)[] = [];
  private doneCount = 0;
  private concurrency = 3;
  private inFlight = 0;
  private stopped = false;
  private priorityByte = 0;      // playhead'in byte karşılığı
  private heavyChunks = new Set<number>();
  private headChunks = 0;        // moov + ilk kareler bölgesi (en yüksek öncelik)
  private attempts: number[] = [];

  onProgress: (doneBytes: number, totalBytes: number) => void = () => {};
  onChunk: (index: number) => void = () => {};
  onError: (err: Error) => void = () => {};

  constructor(url: string) {
    this.url = url;
  }

  /** İlk parçayı indirir, toplam boyutu öğrenir, zamanlayıcıyı başlatır. */
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
      this.pump();
    } else {
      // Sunucu Range desteklemiyor (200) — tüm gövde tek seferde geldi.
      this.mode = '200-full';
      this.totalSize = buf.byteLength;
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
    this.attempts = new Array(this.chunkCount).fill(0);
  }

  /** Kapı bölgesi: ilk N kareyi kapsayan byte sınırı (moov parse sonrası çağrılır). */
  setHeadBytes(byteEnd: number) {
    this.headChunks = Math.min(this.chunkCount, Math.ceil(byteEnd / CHUNK_SIZE));
    this.pump();
  }

  setHeavyRegions(ranges: Array<[number, number]>) {
    this.heavyChunks.clear();
    for (const [a, b] of ranges) {
      for (let c = Math.floor(a / CHUNK_SIZE); c <= Math.floor(b / CHUNK_SIZE) && c < this.chunkCount; c++) {
        this.heavyChunks.add(c);
      }
    }
    this.pump();
  }

  setPriorityByte(offset: number) {
    this.priorityByte = offset;
  }

  /** Belirli bir byte aralığını en öne al (starve eden sample için). */
  bump(offset: number) {
    this.priorityByte = offset;
    this.pump();
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

  get doneBytes(): number {
    return this.doneCount * CHUNK_SIZE > this.totalSize && this.states[this.chunkCount - 1] === 2
      ? (this.doneCount - 1) * CHUNK_SIZE + (this.totalSize - (this.chunkCount - 1) * CHUNK_SIZE)
      : this.doneCount * CHUNK_SIZE;
  }

  get complete(): boolean {
    return this.chunkCount > 0 && this.doneCount === this.chunkCount;
  }

  stop() {
    this.stopped = true;
  }

  private storeChunk(index: number, data: Uint8Array) {
    if (this.states[index] === 2) return;
    this.buffers[index] = data;
    this.states[index] = 2;
    this.doneCount++;
    this.onChunk(index);
    this.onProgress(this.doneBytes, this.totalSize);
  }

  private pickNext(): number {
    const priChunk = Math.floor(this.priorityByte / CHUNK_SIZE);
    // 1) Kapı bölgesi (moov + ilk kareler)
    for (let c = 0; c < this.headChunks; c++) if (this.states[c] === 0) return c;
    // 2) Playhead-ilerisi: priChunk'tan ileri doğru en yakın boş parça
    for (let c = priChunk; c < this.chunkCount; c++) if (this.states[c] === 0) return c;
    // 3) Ağır bölgeler
    for (const c of this.heavyChunks) if (this.states[c] === 0) return c;
    // 4) Lineer kalanlar (playhead gerisi)
    for (let c = 0; c < this.chunkCount; c++) if (this.states[c] === 0) return c;
    return -1;
  }

  private pump() {
    if (this.stopped || this.chunkCount === 0) return;
    while (this.inFlight < this.concurrency) {
      const c = this.pickNext();
      if (c < 0) return;
      this.states[c] = 1;
      this.inFlight++;
      const from = c * CHUNK_SIZE;
      const to = Math.min(this.totalSize, from + CHUNK_SIZE) - 1;
      fetch(this.url, { headers: { Range: `bytes=${from}-${to}` } })
        .then(async (r) => {
          if (!r.ok) throw new Error(`range fetch ${c} failed: ${r.status}`);
          this.storeChunk(c, new Uint8Array(await r.arrayBuffer()));
        })
        .catch((err) => {
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
          this.inFlight--;
          this.pump();
        });
    }
  }
}
