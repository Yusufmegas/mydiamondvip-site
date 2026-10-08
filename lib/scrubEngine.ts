// WebCodecs scrub motoru (spec §1 — ana yol).
// - mp4box yalnızca moov parse + avcC description için kullanılır; sample'lar
//   RangeLoader'ın ham chunk deposundan RASTGELE ERİŞİMLE okunur. moov indiği an
//   TÜM sample tablosu (offset/size/keyframe) hazırdır.
// - GOP-farkında decode: keyframe'ler stss'ten okunur (stss yoksa her kare key →
//   all-intra dosyalar da aynı yoldan çalışır). Bir kareyi göstermek için ait olduğu
//   GOP'un keyframe'inden itibaren TÜM GOP tek seferde decoder'a verilir; GOP'lar
//   birbirinden bağımsızdır (B-frame yok, her GOP key ile başlar) → ileri/geri
//   seek ve flush sonrası devam her zaman geçerli bir sırayla başlar.
// - Yumuşatma: gösterilen kare hedefe üstel olarak yaklaşır (SCRUB_SMOOTHING),
//   kare başına adım sınırlıdır (MAX_STEP_PER_FRAME). Kare henüz decode edilmediyse
//   ATLANMAZ: film son hazır karede bekler. Fark JUMP_THRESHOLD'u aşarsa hedefe atlanır.
// - VideoFrame disiplini: tutma penceresi dışındaki her kareye katı close() (spec §1.5).

import { createFile, DataStream, Endianness, MP4BoxBuffer } from 'mp4box';
import { RangeLoader, CHUNK_SIZE } from './rangeLoader';
import {
  GATE_FRAMES,
  HEAVY_REGIONS,
  LAST_FRAME,
  SCRUB_SMOOTHING,
  MAX_STEP_PER_FRAME,
  JUMP_THRESHOLD,
  PREFETCH_FRAMES,
  DECODE_AHEAD_FRAMES,
  objectPositionAt,
} from './timeline';

const TS_SCALE = 1000;       // kare index ↔ chunk timestamp eşlemesi
const HOLD = 1.5;            // kare hazır değilken playhead'in çizilen kareden en fazla uzaklığı
const MAX_IN_FLIGHT = 24;    // decoder'daki maks kare (boştayken tek GOP her zaman girer)
const CACHE_CAP_DESKTOP = 40; // tutulan maks VideoFrame — donanım decoder havuzunu boğmamak için
const CACHE_CAP_MOBILE = 28;

interface SampleInfo {
  offset: number;
  size: number;
  key: boolean;
}

export interface EngineStats {
  state: string;
  stalls: number;
  maxGapMs: number;
  boost: number;       // (eski) hız tavanı oranı — codec motorunda kullanılmıyor
  gap: number;         // hedef − playhead (kare)
  cacheSize: number;
  inFlight: number;
  netPct: number;
  drawnFrame: number;
  targetFrame: number;
  mode: 'codec' | 'fallback';
  /** Decode isteklerinin gittiği GOP keyframe'leri (teşhis) */
  reqCenters: string;
  /** Son submit edilen decode aralığı (teşhis) */
  reqLast: string;
  /** Ateşlenen decoder.flush() sayısı */
  flushes: number;
  /** Eşik atlaması: hedef JUMP_THRESHOLD'tan uzakken doğrudan hedefe geçiş sayısı */
  jumps: number;
  /** Sert kurtarma sayısı: watchdog decoder'ı kaç kez yeniden kurdu */
  resets: number;
  /** Donanım hızlandırma tercihi: auto | sw */
  accel: string;
  /** Kare hazır olmadığı için playhead'in beklediği toplam süre (ms) */
  holdMs: number;
  /** En büyük GOP uzunluğu (1 = all-intra) */
  gop: number;
  /** Kümülatif indirilen film MB (evict sonrası yeniden indirme dahil) */
  netMB: number;
  /** Bellekte tutulan chunk MB (anlık) */
  residentMB: number;
  /** Bellekte tutulan chunk MB (tepe) */
  peakResidentMB: number;
  /** Bekleyen chunk talebi (anlık / tepe) */
  wantedNow: number;
  wantedMax: number;
  /** Pencere değişimiyle iptal edilen bayat range isteği sayısı */
  staleAborts: number;
  /** Ağ in-flight (anlık / tepe) */
  netInFlight: number;
  netInFlightMax: number;
}

export class ScrubEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private loader: RangeLoader;
  private samples: SampleInfo[] = [];
  private keyOf: Int32Array = new Int32Array(0); // kare → ait olduğu GOP'un keyframe'i
  private gopEnd: Int32Array = new Int32Array(0); // kare → GOP'unun son karesi
  private maxGop = 1;
  private aheadFrames = DECODE_AHEAD_FRAMES; // önbellek tavanına sığacak şekilde kırpılır
  private decoder: VideoDecoder | null = null;
  private decoderReady = false;
  private decoderErrors = 0;
  private config: VideoDecoderConfig | null = null;
  private videoW = 0;
  private videoH = 0;

  private cache = new Map<number, VideoFrame>();
  private inFlight = new Set<number>();    // decoder'daki kareler
  private gopsInFlight = new Set<number>(); // decoder'daki GOP'lar (keyframe index'i)
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;   // flush sürerken decode submit edilmez
  private preferSoftware = true;

  private playhead = 0;  // yumuşatılmış konum (kesirli kare)
  private anchor = 0;    // ulaşılmak istenen tam kare: çizilen kare ya da atlama hedefi
  private target = 0;
  private dir = 1;       // son hareket yönü (prefetch / decode-ahead yönü)
  private drawn = -1;
  private lastTick = 0;
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
    holdMs: 0, gop: 1,
    netMB: 0, residentMB: 0, peakResidentMB: 0,
    wantedNow: 0, wantedMax: 0, staleAborts: 0, netInFlight: 0, netInFlightMax: 0,
  };

  onGate: (progress01: number, open: boolean) => void = () => {};
  onFrame: (frame: number) => void = () => {};
  onFatal: (err: Error) => void = () => {};

  private mobile: boolean;
  private cacheCap: number;

  private backgroundFill: boolean;

  constructor(url: string, opts: { preferHardware?: boolean; mobile?: boolean; backgroundFill?: boolean } = {}) {
    this.mobile = !!opts.mobile;
    this.backgroundFill = opts.backgroundFill ?? true;
    this.cacheCap = this.mobile ? CACHE_CAP_MOBILE : CACHE_CAP_DESKTOP;
    // Mobil: eşzamanlı range 2 + ~24MB bellek tavanı; masaüstü: 3 + ~64MB
    this.loader = new RangeLoader(url, {
      concurrency: this.mobile ? 2 : 3,
      maxBytes: (this.mobile ? 24 : 64) * 1024 * 1024,
    });
    // Varsayılan yazılım decode: GOP'lu scrub'da ~40 VideoFrame tutulur; donanım decoder'ının
    // sabit kare havuzu bu yükte çıktı vermeyi bırakıyor (flush asılı → watchdog reset).
    // ?hw=1 teşhis yolu donanımı dener.
    this.preferSoftware = !opts.preferHardware;
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
      if (this.decoderReady) this.scheduleDecode();
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
      gop: this.maxGop,
    });
    await this.initDecoder();
    console.info('[film] 4c decoder: konfigüre edildi');
    this.stats.state = 'ready';
    // Kapı açılmadan doldurma başlamasın: önce ilk kareler, sonra boşta kalan bant genişliği
    this.loader.enableFill(this.backgroundFill);
    this.scheduleDecode();
    this.updateGate();
  }

  /** moov'u mp4box ile parse et; sample tablosu + keyframe haritası + codec config çıkar. */
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.samples = trak.samples.map((s: any) => ({ offset: s.offset, size: s.size, key: !!s.is_sync }));
          if (this.samples.length === 0) throw new Error('empty sample table');
          this.samples[0].key = true; // ilk kare her zaman decode başlangıcıdır
          this.buildGopIndex();
          // Kapı bölgesi + ağır bölgeleri byte cinsinden yükleyiciye bildir
          const gateEnd = this.samples[Math.min(GATE_FRAMES - 1, this.samples.length - 1)];
          this.loader.setHeadBytes(gateEnd.offset + gateEnd.size);
          this.loader.setHeavyRegions(HEAVY_REGIONS.map(([a, b]) => this.byteRange(a, b)));
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
      this.loader.onChunk = (i) => {
        prevOnChunk(i);
        tryFeed();
        // moov ilk chunk'a sığmadıysa sıradaki chunk'ı açıkça iste (on-demand yükleyici)
        if (!resolved && fed < this.loader.chunkCount) this.loader.want(fed * CHUNK_SIZE, 1);
      };
      tryFeed();
      if (!resolved && fed < this.loader.chunkCount) this.loader.want(fed * CHUNK_SIZE, 1);
    });
  }

  private buildGopIndex() {
    const n = this.samples.length;
    this.keyOf = new Int32Array(n);
    this.gopEnd = new Int32Array(n);
    let k = 0;
    for (let i = 0; i < n; i++) {
      if (this.samples[i].key) k = i;
      this.keyOf[i] = k;
    }
    let end = n - 1;
    for (let i = n - 1; i >= 0; i--) {
      this.gopEnd[i] = end;
      if (this.samples[i].key) {
        this.maxGop = Math.max(this.maxGop, end - i + 1);
        end = i - 1;
      }
    }
    this.stats.gop = this.maxGop;
    // Tutma penceresi (arkada 1 GOP + önde aheadFrames + çizilen kare) önbellek tavanını
    // aşarsa tavan tahliyesi pencere içi kareleri atar → aynı GOP sürekli yeniden decode edilir.
    this.aheadFrames = Math.max(1, Math.min(DECODE_AHEAD_FRAMES, this.cacheCap - this.maxGop - 2));
  }

  /** Kare aralığı [a, b] → decode için gereken byte aralığı (a'nın keyframe'inden). */
  private byteRange(a: number, b: number): [number, number] {
    const last = this.samples.length - 1;
    const lo = this.samples[this.keyOf[Math.max(0, Math.min(last, a))]];
    const hi = this.samples[Math.max(0, Math.min(last, b))];
    return [lo.offset, hi.offset + hi.size];
  }

  private async initDecoder(): Promise<void> {
    if (!this.config) throw new Error('no decoder config');
    let config: VideoDecoderConfig = {
      ...this.config,
      hardwareAcceleration: this.preferSoftware ? 'prefer-software' : 'no-preference',
    };
    let support = await VideoDecoder.isConfigSupported(config);
    if (!support.supported && this.preferSoftware) {
      // Yazılım decoder'ı olmayan tarayıcı (ör. Safari/VideoToolbox): donanıma düş
      config = { ...config, hardwareAcceleration: 'no-preference' };
      support = await VideoDecoder.isConfigSupported(config);
      this.stats.accel = 'hw(sw yok)';
    }
    if (!support.supported) throw new Error('codec unsupported: ' + config.codec);
    this.decoder = new VideoDecoder({
      output: (frame) => this.onDecoded(frame),
      error: (e) => this.onDecoderError(e),
    });
    this.decoder.configure(config);
    this.decoderReady = true;
  }

  /** Tutma penceresi: anchor çevresi (hareket yönünde decode-ahead, arkada bir GOP)
   *  ve hedef GOP'u. Bu pencere dışındaki kareler decode edilir edilmez kapanır. */
  private keepRange(): [number, number] {
    const ahead = this.aheadFrames;
    const behind = this.maxGop;
    return this.dir > 0
      ? [this.anchor - behind, this.anchor + ahead]
      : [this.anchor - ahead, this.anchor + behind];
  }

  private inKeep(idx: number): boolean {
    const [lo, hi] = this.keepRange();
    if (idx >= lo && idx <= hi) return true;
    const t = Math.round(this.target);
    return idx >= this.keyOf[t] && idx <= this.gopEnd[t];
  }

  private onDecoded(frame: VideoFrame) {
    this.lastOutputAt = performance.now(); // watchdog: decoder canlı
    const idx = Math.round(frame.timestamp / TS_SCALE);
    this.inFlight.delete(idx);
    const k = this.keyOf[idx];
    if (k !== undefined && idx === this.gopEnd[idx]) this.gopsInFlight.delete(k);
    if (this.inKeep(idx) && !this.cache.has(idx)) {
      this.cache.set(idx, frame);
    } else {
      frame.close(); // pencere dışı ya da zaten var: katı disiplin (spec §1.5)
    }
    this.evict();
  }

  private onDecoderError(e: Error) {
    this.decoderErrors++;
    this.decoderReady = false;
    this.inFlight.clear();
    this.gopsInFlight.clear();
    if (this.decoderErrors > 3 || this.destroyed) {
      this.fail(e);
      return;
    }
    // Decoder'ı yeniden kur, bekleyen istekleri uygula
    this.initDecoder()
      .then(() => this.scheduleDecode())
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
      if (idx !== this.drawn && !this.inKeep(idx)) {
        frame.close();
        this.cache.delete(idx);
      }
    }
    // Mutlak tavan: donanım decoder'ının kare havuzu ve VRAM sınırlı kalsın
    if (this.cache.size > this.cacheCap) {
      const a = this.anchor;
      const byDist = [...this.cache.keys()]
        .filter((i) => i !== this.drawn)
        .sort((x, y) => Math.abs(y - a) - Math.abs(x - a));
      for (const idx of byDist.slice(0, this.cache.size - this.cacheCap)) {
        this.cache.get(idx)!.close();
        this.cache.delete(idx);
      }
    }
  }

  setTarget(frame: number) {
    this.target = Math.max(0, Math.min(LAST_FRAME, frame));
  }

  /** Decode planı: anchor'ın GOP'u → hareket yönünde DECODE_AHEAD_FRAMES →
   *  (uzak atlama bekleniyorsa) hedef GOP'u → arkadaki GOP (yön dönüşü için).
   *  Her GOP keyframe'inden itibaren TEK SEFERDE submit edilir. */
  private scheduleDecode() {
    if (!this.decoderReady || !this.decoder || this.flushing || this.samples.length === 0) return;
    const last = this.samples.length - 1;
    const order: number[] = [];
    const pushGop = (f: number) => {
      if (f < 0 || f > last) return;
      const k = this.keyOf[f];
      if (!order.includes(k)) order.push(k);
    };
    pushGop(this.anchor);
    for (let d = 1; d <= this.aheadFrames; d++) pushGop(this.anchor + this.dir * d);
    pushGop(Math.round(this.target));
    // Arkadaki komşu GOP: yön dönüşünde ilk kareler hazır olsun
    pushGop(this.dir > 0 ? this.keyOf[this.anchor] - 1 : this.gopEnd[this.anchor] + 1);
    this.stats.reqCenters = order.slice(0, 4).join(',');

    let first = true;
    for (const k of order) {
      if (this.gopsInFlight.has(k)) { first = false; continue; }
      const end = this.gopEnd[k];
      let needed = false;
      for (let i = k; i <= end; i++) {
        if (!this.cache.has(i) && this.inKeep(i)) { needed = true; break; }
      }
      if (!needed) { first = false; continue; }
      const s0 = this.samples[k], s1 = this.samples[end];
      const from = s0.offset, size = s1.offset + s1.size - s0.offset;
      if (!this.loader.hasRange(from, size)) {
        this.loader.want(from, size);
        if (first) this.loader.bump(from); // en acil GOP'un byte'ını öne al
        first = false;
        continue;
      }
      if (this.inFlight.size > 0 && this.inFlight.size + (end - k + 1) > MAX_IN_FLIGHT) break;
      this.submitGop(k, end);
      first = false;
    }
  }

  private submitGop(k: number, end: number) {
    const wasIdle = this.inFlight.size === 0;
    for (let i = k; i <= end; i++) {
      const s = this.samples[i];
      this.decoder!.decode(new EncodedVideoChunk({
        type: s.key || i === k ? 'key' : 'delta',
        timestamp: i * TS_SCALE,
        data: this.loader.readRange(s.offset, s.size),
      }));
      this.inFlight.add(i);
    }
    this.gopsInFlight.add(k);
    if (wasIdle) this.lastOutputAt = performance.now(); // watchdog tabanı: boştan ilk submit
    this.stats.reqLast = k === end ? String(k) : `${k}-${end}`;
    this.scheduleFlush();
  }

  /** Decoder pipeline'ını boşalt. LEADING-EDGE debounce: zamanlayıcı bir kez kurulur,
   *  yeni isteklerle SIFIRLANMAZ (aksi halde donanım decoder'ı son kareleri tutup
   *  çıktı için girdi bekler, biz girdi için çıktı bekleriz → kilit). Her GOP key ile
   *  başladığı için flush sonrası sıradaki submit her zaman geçerlidir. */
  private scheduleFlush() {
    if (this.flushTimer || this.flushing) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      if (!this.decoder || !this.decoderReady || this.decoder.decodeQueueSize === 0 && this.inFlight.size === 0) return;
      this.flushing = true; // flush sürerken decode() çağrısı InvalidStateError üretir — kapıyı kapat
      this.stats.flushes++;
      // Bazı donanım decoder'larında flush() promise'i hiç çözülmüyor → 250ms'te kapıyı
      // zorla düşür; asılı decoder'ı watchdog sert kurtarmayla toparlar.
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
          // Flush sonrası çıkmayan kareler kaybolmuştur → GOP'u yeniden planla
          if (this.inFlight.size && this.decoder?.decodeQueueSize === 0) {
            this.inFlight.clear();
            this.gopsInFlight.clear();
          }
          this.scheduleDecode();
        });
    }, 50);
  }

  /** Watchdog: uçuşta kare varken decoder OUTPUT_TIMEOUT boyunca hiç çıktı
   *  vermediyse asılıdır → sert kurtarma: decoder'ı kapat, yeniden kur. */
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
    this.gopsInFlight.clear();
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
    if (!this.preferSoftware) {
      this.preferSoftware = true;
      this.stats.accel = 'sw(auto)';
      console.warn('[film] kurtarma sonrası prefer-software\'e geçiş');
    }
    try {
      await this.initDecoder();
      this.lastOutputAt = performance.now();
      this.scheduleDecode();
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

  /** Atlama noktası: hedefin en fazla JUMP_THRESHOLD/2 gerisinde (hareket yönüne göre),
   *  verisi ZATEN inmiş en yakın kare; kalan mesafe yumuşatmayla sırayla oynatılır.
   *  Hiçbiri yoksa hedefin kendisi (veri gelince oradan devam). Hızlı fling'de her
   *  atlamanın indirilmemiş bir noktaya düşüp önceki indirmeyi boşa çıkarmasını önler. */
  private jumpDestination(t: number): number {
    for (let d = 0; d <= JUMP_THRESHOLD / 2; d++) {
      const f = t - this.dir * d;
      if (f < 0 || f > LAST_FRAME) continue;
      if (this.cache.has(f)) return f;
      const k = this.samples[this.keyOf[f]], s = this.samples[f];
      if (this.loader.hasRange(k.offset, s.offset + s.size - k.offset)) return f;
    }
    return t;
  }

  /** anchor'dan `to`ya doğru (to dahil) çizilebilir en ileri kare; yoksa -1. */
  private furthestCached(to: number): number {
    const step = to >= this.anchor ? 1 : -1;
    for (let i = to; i !== this.anchor; i -= step) {
      if (this.cache.has(i)) return i;
    }
    return this.cache.has(this.anchor) ? this.anchor : -1;
  }

  /** rAF döngüsünden çağrılır. Çizilen kareyi döndürür. */
  tick(now: number): number {
    if (this.destroyed || this.stats.state === 'fatal') return this.drawn;
    const dtMs = this.lastTick ? Math.min(100, now - this.lastTick) : 1000 / 60;
    const gapMs = this.lastTick ? now - this.lastTick : 0;
    this.lastTick = now;
    if (this.gateOpen && gapMs > 120) this.stats.stalls++;
    if (gapMs > this.stats.maxGapMs) this.stats.maxGapMs = gapMs;
    const f60 = dtMs / (1000 / 60); // 60Hz'e normalize kare sayısı

    // 1) Yumuşatılmış ilerleme: üstel yaklaşma + adım tavanı; uzak hedefte atlama
    const gap = this.target - this.playhead;
    if (Math.abs(gap) > 0.5) this.dir = gap > 0 ? 1 : -1;
    if (this.drawn < 0) {
      // Henüz hiç kare çizilmedi (sayfa filmin ortasında açılmış olabilir): doğrudan hedeften başla
      this.playhead = this.target;
      this.anchor = Math.round(this.target);
    } else if (Math.abs(this.target - this.anchor) > JUMP_THRESHOLD) {
      const dest = this.jumpDestination(Math.round(this.target));
      this.playhead = dest;
      this.anchor = dest;
      this.stats.jumps++;
    } else {
      const alpha = 1 - Math.pow(1 - SCRUB_SMOOTHING, f60);
      const maxStep = MAX_STEP_PER_FRAME * f60;
      const step = Math.max(-maxStep, Math.min(maxStep, gap * alpha));
      this.playhead = Math.abs(gap) < 0.02 ? this.target : this.playhead + step;
    }
    const desired = Math.max(0, Math.min(LAST_FRAME, Math.round(this.playhead)));

    // 2) Çizim: istenen kare hazırsa çiz; değilse yol üzerindeki en ileri hazır kareye
    //    kadar ilerle ve playhead'i orada tut (kare ATLANMAZ, donma da olmaz).
    const drawIdx = this.cache.has(desired) ? desired : this.furthestCached(desired);
    if (drawIdx >= 0) this.anchor = drawIdx;
    if (drawIdx !== desired) {
      const lim = this.anchor + this.dir * HOLD;
      this.playhead = this.dir > 0 ? Math.min(this.playhead, lim) : Math.max(this.playhead, lim);
      if (this.gateOpen) this.stats.holdMs += dtMs;
    }
    if (drawIdx >= 0 && drawIdx !== this.drawn) {
      if (this.drawn < 0) console.info('[film] 4e draw: ilk kare çizildi, idx =', drawIdx);
      this.draw(drawIdx);
      this.drawn = drawIdx;
      this.stats.drawnFrame = drawIdx;
      this.onFrame(drawIdx);
      if (!this.gateOpen) this.updateGate();
    }

    // 3) Decode + ağ penceresi
    this.scheduleDecode();
    this.watchdog(now);
    this.updateNetWindow();

    this.stats.gap = this.target - this.playhead;
    this.stats.cacheSize = this.cache.size;
    this.stats.inFlight = this.inFlight.size;
    this.stats.netPct = this.loader.totalSize
      ? Math.min(100, Math.round((this.loader.doneBytes / this.loader.totalSize) * 100))
      : 0;
    this.stats.targetFrame = Math.round(this.target);
    this.stats.netMB = +(this.loader.doneBytes / 1048576).toFixed(1);
    this.stats.residentMB = +(this.loader.residentBytesNow / 1048576).toFixed(1);
    this.stats.peakResidentMB = +(this.loader.peakResidentBytes / 1048576).toFixed(1);
    this.stats.wantedNow = this.loader.wantedSize;
    this.stats.wantedMax = this.loader.wantedMax;
    this.stats.staleAborts = this.loader.staleAborts;
    this.stats.netInFlight = this.loader.netInFlight;
    this.stats.netInFlightMax = this.loader.netInFlightMax;
    return this.drawn;
  }

  /** Ağ penceresi: anchor→hedef yolu (yakınsa) + hareket yönünde PREFETCH_FRAMES.
   *  Uzak hedefte yol indirilmez: anchor çevresi + hedef çevresi. */
  private updateNetWindow() {
    if (this.samples.length === 0) return;
    const a = this.anchor, t = Math.round(this.target), g = this.maxGop;
    const ahead = (f: number) => (this.dir > 0 ? [f - g, f + PREFETCH_FRAMES] : [f - PREFETCH_FRAMES, f + g]);
    const ranges: Array<[number, number]> = [];
    if (Math.abs(t - a) <= JUMP_THRESHOLD) {
      const [lo, hi] = ahead(this.dir > 0 ? Math.max(a, t) : Math.min(a, t));
      ranges.push(this.byteRange(Math.min(lo, a, t), Math.max(hi, a, t)));
    } else {
      ranges.push(this.byteRange(a - g, a + g));
      const [lo, hi] = ahead(t);
      ranges.push(this.byteRange(lo, hi));
    }
    const s = this.samples[this.keyOf[a]];
    this.loader.setWindow(ranges, s.offset, this.dir);
  }

  private draw(idx: number) {
    const frame = this.cache.get(idx);
    if (!frame || !this.ctx || !this.canvas) return;
    const cw = this.canvas.width, ch = this.canvas.height;
    // Oran güvenliği: kaynağın GERÇEK görünür boyutu (coded/display farkına karşı)
    const vw = frame.displayWidth || this.videoW;
    const vh = frame.displayHeight || this.videoH;
    // cover-crop: kaynak ve hedef oranı karşılaştırılır, merkezden (segment bazlı
    // object-position ile) kırpılır ve AYNI oranla çizilir — stretch/squash imkânsız.
    const { x, y } = objectPositionAt(idx, this.mobile);
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

  /** Bölüm inactive veya sekme gizli: ağ isteklerini askıya al. */
  suspend() {
    this.loader.suspend();
  }

  /** Bölüme dönüş: tick zaman tabanını sıfırla (sahte stall ölçümü olmasın),
   *  yüklemeyi aç ve güncel pencereyi yeniden talep et. */
  resume() {
    this.lastTick = 0;
    this.loader.resumeLoading();
    this.scheduleDecode();
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
