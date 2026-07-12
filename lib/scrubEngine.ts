// WebCodecs scrub motoru (spec §1 — ana yol).
// - mp4box yalnızca moov parse + avcC description için kullanılır; sample'lar
//   RangeLoader'ın ham chunk deposundan RASTGELE ERİŞİMLE okunur. Sıralı extraction'a
//   bağlı kalınmaz — aksi halde arka plan dolgusunun "playhead-ilerisi + ağır bölge"
//   önceliği (spec §3) byte gelse bile kare üretemezdi. moov indiği an TÜM sample
//   tablosu hazır: hiçbir kare dosyanın inmesini beklemez (nbSamples kararının amacı).
// - All-intra: her sample bağımsız key chunk → tek sample decode = tek kare.
// - VideoFrame disiplini: playhead ±WINDOW dışındaki her kareye katı close() (spec §1.5).
// - Decoder hazır olmadan gelen scrub istekleri pending'de birikir → applyPending (spec §1.4).

import { createFile, DataStream, Endianness, MP4BoxBuffer } from 'mp4box';
import { RangeLoader, CHUNK_SIZE } from './rangeLoader';
import {
  GATE_FRAMES,
  HEAVY_REGIONS,
  LAST_FRAME,
  capForGap,
  BASE_CAP_FPS,
  objectPositionAt,
} from './timeline';

const WINDOW = 5;          // playhead ± tutulan kare penceresi
const SEARCH = 14;         // çizilebilir kare ararken taranan maks mesafe
const MAX_IN_FLIGHT = 8;   // decoder'a aynı anda verilen maks chunk
const TS_SCALE = 1000;     // kare index ↔ chunk timestamp eşlemesi

interface SampleInfo {
  offset: number;
  size: number;
}

export interface EngineStats {
  state: string;
  stalls: number;
  maxGapMs: number;
  boost: number;       // aktif hız tavanı / taban tavan
  gap: number;         // hedef − playhead (kare)
  cacheSize: number;
  inFlight: number;
  netPct: number;
  drawnFrame: number;
  targetFrame: number;
  mode: 'codec' | 'fallback';
  /** Decode isteklerinin gittiği pencere merkezleri (teşhis) */
  reqCenters: string;
  /** Son submit edilen decode aralığı (teşhis) */
  reqLast: string;
  /** Ateşlenen decoder.flush() sayısı — donanım pipeline'ı boşaltma kanıtı */
  flushes: number;
  /** Starve-jump sayısı: hedefe doğrudan atlama kaç kez tetiklendi */
  jumps: number;
  /** Sert kurtarma sayısı: watchdog decoder'ı kaç kez yeniden kurdu */
  resets: number;
  /** Donanım hızlandırma tercihi: auto | sw */
  accel: string;
}

export class ScrubEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private loader: RangeLoader;
  private samples: SampleInfo[] = [];
  private decoder: VideoDecoder | null = null;
  private decoderReady = false;
  private decoderErrors = 0;
  private config: VideoDecoderConfig | null = null;
  private videoW = 0;
  private videoH = 0;

  private cache = new Map<number, VideoFrame>();
  private inFlight = new Set<number>();
  private pendingCenter = -1; // decoder hazır değilken biriken istek
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;   // flush sürerken decode submit edilmez
  private centers: number[] = []; // aktif decode-istek merkezleri (keep-window bunlara göre)
  private preferSoftware = false;

  private playhead = 0;
  private target = 0;
  private drawn = -1;
  private lastTick = 0;
  private lastProgressAt = 0; // çizilen kare en son ne zaman değişti (starve-jump için)
  private lastOutputAt = 0;   // decoder en son ne zaman çıktı verdi (watchdog için)
  private recovering = false;
  private resets = 0;
  private destroyed = false;
  private gateOpen = false;
  private gateLogQuarter = -1;

  stats: EngineStats = {
    state: 'boot', stalls: 0, maxGapMs: 0, boost: 1, gap: 0, cacheSize: 0,
    inFlight: 0, netPct: 0, drawnFrame: -1, targetFrame: 0, mode: 'codec',
    reqCenters: '-', reqLast: '-', flushes: 0, jumps: 0, resets: 0, accel: 'auto',
  };

  onGate: (progress01: number, open: boolean) => void = () => {};
  onFrame: (frame: number) => void = () => {};
  onFatal: (err: Error) => void = () => {};

  constructor(url: string, opts: { preferSoftware?: boolean } = {}) {
    this.loader = new RangeLoader(url);
    this.preferSoftware = !!opts.preferSoftware;
    this.stats.accel = this.preferSoftware ? 'sw' : 'auto';
  }

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    // desynchronized: GPU upload'ı ana thread compositor kilidinden ayırır (spec §1.7)
    this.ctx = canvas.getContext('2d', { desynchronized: true, alpha: false });
  }

  static async supported(): Promise<boolean> {
    return typeof window !== 'undefined' && 'VideoDecoder' in window;
  }

  async start(): Promise<void> {
    this.stats.state = 'loading';
    this.loader.onProgress = () => this.updateGate();
    this.loader.onChunk = () => {
      if (this.decoderReady) this.applyPending();
    };
    // Yükleyici yalnızca KALICI hatada (4 deneme sonrası) onError çağırır →
    // fallback tetiklenir (sessiz blank yasağı, spec §4)
    this.loader.onError = (err) => this.fail(err);
    await this.loader.start();
    console.info('[film] 4a net: yükleyici hazır', {
      mode: this.loader.mode,
      totalMB: (this.loader.totalSize / 1048576).toFixed(1),
      chunks: this.loader.chunkCount,
    });
    await this.parseMoov();
    console.info('[film] 4b demux: moov ok', {
      codec: this.config?.codec,
      samples: this.samples.length,
      size: `${this.videoW}x${this.videoH}`,
    });
    await this.initDecoder();
    console.info('[film] 4c decoder: konfigüre edildi');
    this.stats.state = 'ready';
    this.applyPending();
    this.updateGate();
  }

  /** moov'u mp4box ile parse et; sample tablosu + codec config çıkar. */
  private async parseMoov(): Promise<void> {
    const file = createFile();
    let resolved = false;
    await new Promise<void>((resolve, reject) => {
      const to = setTimeout(() => { if (!resolved) reject(new Error('moov parse timeout')); }, 15000);
      file.onError = (e: unknown) => { clearTimeout(to); reject(new Error('mp4box: ' + String(e))); };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file.onReady = (info: any) => {
        try {
          const vt = info.videoTracks[0];
          if (!vt) throw new Error('no video track');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const trak = file.getTrackById(vt.id) as any;
          const entry = trak.mdia.minf.stbl.stsd.entries[0];
          const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
          if (!box) throw new Error('no codec description box');
          const ds = new DataStream(undefined, 0, Endianness.BIG_ENDIAN);
          box.write(ds);
          // box header'ı (8 byte) atla; yazılan uzunluk box.size'dan okunur
          const written = (box.size as number) || ds.getPosition();
          const description = new Uint8Array(ds.buffer, 8, written - 8);
          this.videoW = vt.video.width;
          this.videoH = vt.video.height;
          this.config = {
            codec: vt.codec,
            codedWidth: this.videoW,
            codedHeight: this.videoH,
            description,
            optimizeForLatency: true,
          };
          this.samples = trak.samples.map((s: any) => ({ offset: s.offset, size: s.size }));
          if (this.samples.length === 0) throw new Error('empty sample table');
          // Kapı bölgesi + ağır bölgeleri byte cinsinden yükleyiciye bildir
          const gateEnd = this.samples[Math.min(GATE_FRAMES - 1, this.samples.length - 1)];
          this.loader.setHeadBytes(gateEnd.offset + gateEnd.size);
          this.loader.setHeavyRegions(
            HEAVY_REGIONS.map(([a, b]) => {
              const sa = this.samples[Math.min(a, this.samples.length - 1)];
              const sb = this.samples[Math.min(b, this.samples.length - 1)];
              return [sa.offset, sb.offset + sb.size] as [number, number];
            }),
          );
          clearTimeout(to);
          resolved = true;
          resolve();
        } catch (err) {
          clearTimeout(to);
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      };
      // İlk chunk'ı besle (faststart → moov önde). Yetmezse gelen chunk'larla devam.
      const feed = (index: number) => {
        if (resolved) return;
        const size = Math.min(CHUNK_SIZE, this.loader.totalSize - index * CHUNK_SIZE);
        const buf = this.loader.readRange(index * CHUNK_SIZE, size).slice();
        file.appendBuffer(MP4BoxBuffer.fromArrayBuffer(buf.buffer as ArrayBuffer, index * CHUNK_SIZE));
      };
      let fed = 0;
      const tryFeed = () => {
        while (!resolved && fed < this.loader.chunkCount && this.loader.hasRange(fed * CHUNK_SIZE, 1)) {
          feed(fed); fed++;
        }
      };
      const prevOnChunk = this.loader.onChunk;
      this.loader.onChunk = (i) => { prevOnChunk(i); tryFeed(); };
      tryFeed();
    });
  }

  private async initDecoder(): Promise<void> {
    if (!this.config) throw new Error('no decoder config');
    // ?sw=1 teşhis yolu: donanım decoder'ı şüpheliyse yazılımla ayrım netleşir
    const config: VideoDecoderConfig = {
      ...this.config,
      hardwareAcceleration: this.preferSoftware ? 'prefer-software' : 'no-preference',
    };
    const support = await VideoDecoder.isConfigSupported(config);
    if (!support.supported) throw new Error('codec unsupported: ' + config.codec);
    this.decoder = new VideoDecoder({
      output: (frame) => this.onDecoded(frame),
      error: (e) => this.onDecoderError(e),
    });
    this.decoder.configure(config);
    this.decoderReady = true;
  }

  /** Keep-window: playhead, hedef VE aktif istek merkezleri.
   *  Merkez listesi olmadan yetişme sırasındaki ara-pencere kareleri
   *  decode edilir edilmez kapanır → decode-close çevrimi (donma sebebi #1). */
  private inKeep(idx: number): boolean {
    if (Math.abs(idx - Math.round(this.playhead)) <= WINDOW + 1) return true;
    if (Math.abs(idx - Math.round(this.target)) <= WINDOW + 1) return true;
    for (const c of this.centers) if (Math.abs(idx - c) <= WINDOW + 1) return true;
    return false;
  }

  private onDecoded(frame: VideoFrame) {
    this.lastOutputAt = performance.now(); // watchdog: decoder canlı
    const idx = Math.round(frame.timestamp / TS_SCALE);
    this.inFlight.delete(idx);
    if (this.inKeep(idx)) {
      const prev = this.cache.get(idx);
      if (prev) prev.close();
      this.cache.set(idx, frame);
    } else {
      frame.close(); // pencere dışı: katı disiplin (spec §1.5)
    }
    this.evict();
  }

  private onDecoderError(e: Error) {
    this.decoderErrors++;
    this.decoderReady = false;
    this.inFlight.clear();
    if (this.decoderErrors > 3 || this.destroyed) {
      this.fail(e);
      return;
    }
    // Decoder'ı yeniden kur, bekleyen istekleri uygula
    this.initDecoder()
      .then(() => this.applyPending())
      .catch((err) => this.fail(err));
  }

  private fail(err: Error) {
    if (this.stats.state === 'fatal') return;
    this.stats.state = 'fatal';
    console.error('[film] codec motoru FATAL:', err.message);
    this.loader.stop();
    this.onFatal(err);
  }

  private evict() {
    for (const [idx, frame] of this.cache) {
      if (!this.inKeep(idx)) {
        frame.close();
        this.cache.delete(idx);
      }
    }
    // Mutlak tavan: merkez pencereleri geçici çakışmasa bile VRAM sınırlı kalsın
    const HARD_CAP = 40;
    if (this.cache.size > HARD_CAP) {
      const ph = Math.round(this.playhead);
      const byDist = [...this.cache.keys()].sort((a, b) => Math.abs(b - ph) - Math.abs(a - ph));
      for (const idx of byDist.slice(0, this.cache.size - HARD_CAP)) {
        this.cache.get(idx)!.close();
        this.cache.delete(idx);
      }
    }
  }

  setTarget(frame: number) {
    this.target = Math.max(0, Math.min(LAST_FRAME, frame));
    if (!this.decoderReady) {
      this.pendingCenter = Math.round(this.target); // decoder-load yarışı: biriktir
      return;
    }
    this.requestWindow(Math.round(this.target));
  }

  private applyPending() {
    if (!this.decoderReady) return;
    const c = this.pendingCenter >= 0 ? this.pendingCenter : Math.round(this.target);
    this.pendingCenter = -1;
    this.requestWindow(c);
    this.requestWindow(Math.round(this.playhead));
  }

  /** Aktif istek merkezini kaydet (keep-window + teşhis). En fazla 3 ayrık merkez. */
  private noteCenter(c: number) {
    this.centers = [c, ...this.centers.filter((x) => Math.abs(x - c) > WINDOW)].slice(0, 3);
    this.stats.reqCenters = this.centers.join(',');
  }

  /** Merkez-dışa ±WINDOW decode isteği. All-intra: her index'e DOĞRUDAN atlanır,
   *  sıralı ilerleme yok — seek garantisi burada.
   *  budget: bu çağrının kullanabileceği maks slot (hedef-penceresi garantili payı için). */
  private requestWindow(center: number, budget = MAX_IN_FLIGHT) {
    if (!this.decoderReady || !this.decoder || this.flushing) return;
    this.noteCenter(center);
    const wasIdle = this.inFlight.size === 0;
    let subLo = -1, subHi = -1, submitted = 0;
    for (let d = 0; d <= WINDOW; d++) {
      for (const idx of d === 0 ? [center] : [center + d, center - d]) {
        if (idx < 0 || idx > LAST_FRAME) continue;
        if (this.cache.has(idx) || this.inFlight.has(idx)) continue;
        if (this.inFlight.size >= MAX_IN_FLIGHT || submitted >= budget) {
          d = WINDOW + 1; // slot/bütçe doldu: döngüden çık, alttaki ortak submit-sonu koşusu çalışsın
          break;
        }
        const s = this.samples[idx];
        if (!s) continue;
        if (!this.loader.hasRange(s.offset, s.size)) {
          if (idx === center) this.loader.bump(s.offset); // starve eden byte'ı öne al
          continue;
        }
        const data = this.loader.readRange(s.offset, s.size);
        this.decoder.decode(new EncodedVideoChunk({
          type: 'key', // all-intra: her kare I-frame
          timestamp: idx * TS_SCALE,
          data,
        }));
        this.inFlight.add(idx);
        submitted++;
        subLo = subLo < 0 ? idx : Math.min(subLo, idx);
        subHi = Math.max(subHi, idx);
      }
    }
    if (submitted) {
      if (wasIdle) this.lastOutputAt = performance.now(); // watchdog tabanı: boştan ilk submit
      this.markSubmitted(subLo, subHi);
      this.scheduleFlush(); // yalnızca gerçekten submit olduysa
    }
  }

  private markSubmitted(lo: number, hi: number) {
    this.stats.reqLast = lo === hi ? String(lo) : `${lo}-${hi}`;
  }

  /** Decoder pipeline'ını boşalt. LEADING-EDGE debounce: zamanlayıcı bir kez kurulur,
   *  yeni isteklerle SIFIRLANMAZ. (Eski davranış tick'in 16ms'lik requestWindow
   *  çağrılarıyla süresiz ertelenip donanım decoder'ında tam kilitlenme yaratıyordu:
   *  decoder çıktı için girdi bekler, biz çıktı için slot bekleriz, flush hiç gelmez.) */
  private scheduleFlush() {
    if (this.flushTimer || this.flushing) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (!this.decoder || !this.decoderReady || this.decoder.decodeQueueSize === 0) return;
      this.flushing = true; // flush sürerken decode() çağrısı InvalidStateError üretir — kapıyı kapat
      this.stats.flushes++;
      // Bazı donanım decoder'larında flush() promise'i hiç çözülmüyor → flushing
      // süresiz true kalır ve TÜM submit'ler kilitlenir. 250ms'te kapıyı zorla düşür;
      // asılı decoder'ı watchdog (aşağıda) sert kurtarmayla toparlar.
      const deadline = setTimeout(() => {
        if (this.flushing) {
          console.warn('[film] flush 250ms içinde çözülmedi — submit kapısı zorla açıldı');
          this.flushing = false;
        }
      }, 250);
      this.decoder.flush()
        .catch(() => { /* reset sırasında normal */ })
        .finally(() => {
          clearTimeout(deadline);
          this.flushing = false;
        });
    }, 50);
  }

  /** Watchdog: uçuşta chunk varken decoder OUTPUT_TIMEOUT boyunca hiç çıktı
   *  vermediyse asılıdır → sert kurtarma: decoder'ı kapat, yeniden kur,
   *  hedef penceresini DOĞRUDAN decode et. */
  private watchdog(now: number) {
    const OUTPUT_TIMEOUT = 600;
    if (this.recovering || this.inFlight.size === 0) return;
    if (this.lastOutputAt === 0 || now - this.lastOutputAt < OUTPUT_TIMEOUT) return;
    void this.recover(`inflight=${this.inFlight.size}, ${Math.round(now - this.lastOutputAt)}ms çıktısız`);
  }

  private async recover(reason: string) {
    if (this.recovering || this.destroyed || this.stats.state === 'fatal') return;
    this.recovering = true;
    this.resets++;
    this.stats.resets = this.resets;
    console.warn(`[film] decoder sert kurtarma #${this.resets}:`, reason);
    this.inFlight.clear();
    this.flushing = false;
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    this.decoderReady = false;
    try { this.decoder?.close(); } catch { /* zaten ölü */ }
    this.decoder = null;
    if (this.resets > 5) {
      this.recovering = false;
      this.fail(new Error('decoder tekrar tekrar yanıtsız (' + this.resets + ' kurtarma)'));
      return;
    }
    // Eskalasyon: BİR KEZ asılan donanım decoder'ına ikinci şans yok — sürekli yük
    // altında GPU/renderer çökmesine kadar gidebiliyor (gerçek cihazda görüldü).
    // Yazılım decoder'ı bu sınıf makinelerde kanıtlanmış sağlıklı yol.
    if (!this.preferSoftware) {
      this.preferSoftware = true;
      this.stats.accel = 'sw(auto)';
      console.warn('[film] kurtarma sonrası prefer-software\'e kalıcı geçiş');
      try { localStorage.setItem('film-sw', '1'); } catch { /* gizli mod vb. */ }
    }
    try {
      await this.initDecoder();
      this.lastOutputAt = performance.now();
      // Sert kurtarma sonrası öncelik: hedef penceresi + mevcut konum
      this.requestWindow(Math.round(this.target), 4);
      this.requestWindow(Math.round(this.playhead));
    } catch (err) {
      this.fail(err instanceof Error ? err : new Error(String(err)));
    }
    this.recovering = false;
  }

  private updateGate() {
    if (this.gateOpen) return;
    if (this.samples.length === 0) {
      this.onGate(Math.min(0.15, this.loader.doneBytes / Math.max(1, this.loader.totalSize)), false);
      return;
    }
    let avail = 0;
    for (let i = 0; i < GATE_FRAMES && i < this.samples.length; i++) {
      const s = this.samples[i];
      if (this.loader.hasRange(s.offset, s.size)) avail++;
    }
    const p = avail / GATE_FRAMES;
    const q = Math.floor(p * 4);
    if (q > this.gateLogQuarter) {
      this.gateLogQuarter = q;
      console.info(`[film] 4d gate: ${avail}/${GATE_FRAMES} kare hazır, ilk kare çizildi mi: ${this.drawn >= 0}`);
    }
    const open = avail >= GATE_FRAMES && this.drawn >= 0;
    if (open) this.gateOpen = true;
    this.onGate(p, open);
  }

  /** rAF döngüsünden çağrılır. Çizilen kareyi döndürür. */
  tick(now: number): number {
    if (this.destroyed || this.stats.state === 'fatal') return this.drawn;
    const dt = this.lastTick ? Math.min(0.1, (now - this.lastTick) / 1000) : 1 / 60;
    const gapMs = this.lastTick ? now - this.lastTick : 0;
    this.lastTick = now;
    if (this.gateOpen && gapMs > 120) this.stats.stalls++;
    if (gapMs > this.stats.maxGapMs) this.stats.maxGapMs = gapMs;

    const gap = this.target - this.playhead;
    const cap = capForGap(Math.abs(gap));
    this.stats.boost = cap / BASE_CAP_FPS;
    this.stats.gap = gap;

    const maxStep = cap * dt;
    const desired = this.playhead + Math.max(-maxStep, Math.min(maxStep, gap));
    const desiredIdx = Math.round(desired);

    // Starve güvenliği: yalnızca decode edilmiş kareye ilerle; yoksa son kare kalır (blank yasak)
    let drawIdx = this.findDrawable(desiredIdx, Math.sign(gap) || 1);

    // Starve-jump: yol üzerinde ilerleme uzun süre yoksa ve hedef penceresi decode
    // edilmişse DOĞRUDAN hedefe atla. All-intra bunu garanti eder — decoder'ın
    // "mevcut kareden sıralı yetişmesi" diye bir zorunluluk yok.
    const stuck = (drawIdx < 0 || drawIdx === this.drawn) &&
      Math.abs(gap) > 3 * WINDOW &&
      this.lastProgressAt > 0 && now - this.lastProgressAt > 400;
    if (stuck) {
      const t = Math.round(this.target);
      for (let d = 0; d <= WINDOW; d++) {
        const cand = this.cache.has(t - d) ? t - d : this.cache.has(t + d) ? t + d : -1;
        if (cand >= 0) {
          drawIdx = cand;
          this.playhead = cand;
          this.stats.jumps++;
          console.warn('[film] starve-jump:', this.drawn, '→', cand, '(yol decode\'u ilerlemedi)');
          break;
        }
      }
    }

    if (drawIdx >= 0) {
      if (!stuck) {
        if (Math.abs(drawIdx - desiredIdx) <= 1) {
          this.playhead = desired; // decode yetişiyor → tam hız
        } else {
          this.playhead = drawIdx; // starve → boost fiilen kesilir
        }
      }
      if (drawIdx !== this.drawn) {
        if (this.drawn < 0) console.info('[film] 4e draw: ilk kare çizildi, idx =', drawIdx);
        this.draw(drawIdx);
        this.drawn = drawIdx;
        this.lastProgressAt = now;
        this.stats.drawnFrame = drawIdx;
        this.onFrame(drawIdx);
        if (!this.gateOpen) this.updateGate();
      }
    }

    // Decode + ağ önceliği güncelle.
    // Uzak gap'te HEDEF penceresi ÖNCE ve garantili bütçeyle talep edilir — aksi
    // halde yol decode'u tüm slotları yer, hedef hiç decode edilmez ve starve-jump'ın
    // ön koşulu asla sağlanamaz (gerçek cihazda görülen kilit).
    if (this.decoderReady) {
      const far = Math.abs(gap) > 3 * WINDOW;
      if (far) this.requestWindow(Math.round(this.target), 3);
      this.requestWindow(desiredIdx);
      if (!far && Math.abs(this.target - desired) > WINDOW) this.requestWindow(Math.round(this.target));
    }
    this.watchdog(now);
    const s = this.samples[desiredIdx];
    if (s) this.loader.setPriorityByte(s.offset);

    this.stats.cacheSize = this.cache.size;
    this.stats.inFlight = this.inFlight.size;
    this.stats.netPct = this.loader.totalSize ? Math.round((this.loader.doneBytes / this.loader.totalSize) * 100) : 0;
    this.stats.targetFrame = Math.round(this.target);
    return this.drawn;
  }

  private findDrawable(idx: number, dir: number): number {
    for (let d = 0; d <= SEARCH; d++) {
      // Önce hareket yönünün GERİSİ (film hedefin önüne asla geçmez)
      const behind = idx - dir * d;
      if (this.cache.has(behind)) return behind;
      const ahead = idx + dir * d;
      if (d > 0 && this.cache.has(ahead)) return ahead;
    }
    return this.drawn >= 0 && this.cache.has(this.drawn) ? this.drawn : -1;
  }

  private draw(idx: number) {
    const frame = this.cache.get(idx);
    if (!frame || !this.ctx || !this.canvas) return;
    const cw = this.canvas.width, ch = this.canvas.height;
    const vw = this.videoW, vh = this.videoH;
    // object-fit: cover + segment bazlı object-position (spec §8)
    const { x, y } = objectPositionAt(idx);
    const scale = Math.max(cw / vw, ch / vh);
    const sw = cw / scale, sh = ch / scale;
    const sx = (vw - sw) * (x / 100);
    const sy = (vh - sh) * (y / 100);
    this.ctx.drawImage(frame, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  /** Yeniden boyutlandırmada son kareyi tazele. */
  redraw() {
    if (this.drawn >= 0) this.draw(this.drawn);
  }

  destroy() {
    this.destroyed = true;
    this.loader.stop();
    if (this.flushTimer) clearTimeout(this.flushTimer);
    try { this.decoder?.close(); } catch { /* zaten kapalı */ }
    for (const f of this.cache.values()) f.close();
    this.cache.clear();
  }
}
