// WebP kare dizisi fallback'i — YALNIZCA WebCodecs yoksa (iOS < 16.4) devreye girer.
// 12fps, 720p: film karesi f → webp index floor(f/2)+1 (f_0001.webp .. f_0775.webp).

import { LAST_FRAME, GATE_FRAMES, capForGap, BASE_CAP_FPS, objectPositionAt } from './timeline';
import type { EngineStats } from './scrubEngine';

const FB_FPS_DIV = 2;      // 24fps → 12fps
const WINDOW = 8;          // tutulan bitmap penceresi (webp indexinde)
const MAX_IN_FLIGHT = 6;
const GATE_IMAGES = Math.ceil(GATE_FRAMES / FB_FPS_DIV);

const fbIndex = (frame: number) => Math.floor(Math.max(0, Math.min(LAST_FRAME, frame)) / FB_FPS_DIV) + 1;
const FB_LAST = fbIndex(LAST_FRAME);

export class FallbackEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private baseUrl: string;
  private cache = new Map<number, ImageBitmap>();
  private inFlight = new Set<number>();
  private loaded = new Set<number>();
  private playhead = 0;
  private target = 0;
  private drawn = -1; // webp index
  private lastTick = 0;
  private destroyed = false;
  private gateOpen = false;
  private failures = 0;

  stats: EngineStats = {
    state: 'boot', stalls: 0, maxGapMs: 0, boost: 1, gap: 0, cacheSize: 0,
    inFlight: 0, netPct: 0, drawnFrame: -1, targetFrame: 0, mode: 'fallback',
    reqCenters: '-', reqLast: '-', flushes: 0, jumps: 0, resets: 0, accel: '-',
  };

  onGate: (progress01: number, open: boolean) => void = () => {};
  onFrame: (frame: number) => void = () => {};
  onFatal: (err: Error) => void = () => {};

  constructor(baseUrl = '/fallback') {
    this.baseUrl = baseUrl;
  }

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { desynchronized: true, alpha: false });
  }

  async start(): Promise<void> {
    this.stats.state = 'loading';
    console.info('[film] 4a(fb) fallback: WebP dizisi başlıyor', { base: this.baseUrl, gateImages: GATE_IMAGES });
    for (let i = 1; i <= GATE_IMAGES; i++) this.request(i);
    this.stats.state = 'ready';
  }

  private url(i: number): string {
    return `${this.baseUrl}/f_${String(i).padStart(4, '0')}.webp`;
  }

  private request(i: number) {
    if (i < 1 || i > FB_LAST || this.cache.has(i) || this.inFlight.has(i)) return;
    if (this.inFlight.size >= MAX_IN_FLIGHT) return;
    this.inFlight.add(i);
    fetch(this.url(i))
      .then(async (r) => {
        if (!r.ok) throw new Error(`fallback frame ${i}: ${r.status}`); // spec §4
        const bmp = await createImageBitmap(await r.blob());
        this.inFlight.delete(i);
        const center = fbIndex(this.playhead);
        if (Math.abs(i - center) <= WINDOW || Math.abs(i - fbIndex(this.target)) <= WINDOW || i <= GATE_IMAGES) {
          this.cache.set(i, bmp);
          this.loaded.add(i);
        } else {
          this.loaded.add(i);
          bmp.close();
        }
        this.evict();
        this.updateGate();
      })
      .catch((err) => {
        this.inFlight.delete(i);
        this.failures++;
        console.warn(`[film] fallback kare ${i} alınamadı (${this.failures}/10):`, err instanceof Error ? err.message : err);
        if (this.failures > 10) this.onFatal(err instanceof Error ? err : new Error(String(err)));
      });
  }

  private evict() {
    const center = fbIndex(this.playhead);
    const tgt = fbIndex(this.target);
    for (const [i, bmp] of this.cache) {
      if (Math.abs(i - center) > WINDOW && Math.abs(i - tgt) > WINDOW) {
        bmp.close();
        this.cache.delete(i);
      }
    }
  }

  private updateGate() {
    if (this.gateOpen) return;
    let avail = 0;
    for (let i = 1; i <= GATE_IMAGES; i++) if (this.loaded.has(i)) avail++;
    const open = avail >= GATE_IMAGES && this.drawn >= 0;
    if (open) this.gateOpen = true;
    this.onGate(avail / GATE_IMAGES, open);
  }

  setTarget(frame: number) {
    this.target = Math.max(0, Math.min(LAST_FRAME, frame));
    const c = fbIndex(this.target);
    for (let d = 0; d <= WINDOW; d++) {
      this.request(c + d);
      if (d > 0) this.request(c - d);
    }
  }

  tick(now: number): number {
    if (this.destroyed) return this.drawn;
    // Kapı dolana kadar arka plan pompası: MAX_IN_FLIGHT boşaldıkça sıradaki kapı karesi
    if (!this.gateOpen) {
      for (let i = 1; i <= GATE_IMAGES; i++) {
        if (!this.loaded.has(i)) this.request(i);
      }
    }
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
    const di = fbIndex(desired);

    let drawI = -1;
    for (let d = 0; d <= WINDOW; d++) {
      if (this.cache.has(di - d)) { drawI = di - d; break; }
      if (this.cache.has(di + d)) { drawI = di + d; break; }
    }
    if (drawI >= 0) {
      this.playhead = Math.abs(drawI - di) <= 1 ? desired : (drawI - 1) * FB_FPS_DIV;
      if (drawI !== this.drawn) {
        if (this.drawn < 0) console.info('[film] 4e(fb) draw: ilk WebP karesi çizildi, idx =', drawI);
        this.draw(drawI);
        this.drawn = drawI;
        this.stats.drawnFrame = (drawI - 1) * FB_FPS_DIV;
        this.onFrame(this.stats.drawnFrame);
        if (!this.gateOpen) this.updateGate();
      }
    }
    for (let d = 0; d <= WINDOW; d++) {
      this.request(di + d);
      if (d > 0) this.request(di - d);
    }
    this.stats.cacheSize = this.cache.size;
    this.stats.inFlight = this.inFlight.size;
    this.stats.targetFrame = Math.round(this.target);
    return this.stats.drawnFrame;
  }

  private draw(i: number) {
    const bmp = this.cache.get(i);
    if (!bmp || !this.ctx || !this.canvas) return;
    const cw = this.canvas.width, ch = this.canvas.height;
    const { x, y } = objectPositionAt((i - 1) * FB_FPS_DIV);
    const scale = Math.max(cw / bmp.width, ch / bmp.height);
    const sw = cw / scale, sh = ch / scale;
    const sx = (bmp.width - sw) * (x / 100);
    const sy = (bmp.height - sh) * (y / 100);
    this.ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  redraw() {
    if (this.drawn >= 0) this.draw(this.drawn);
  }

  destroy() {
    this.destroyed = true;
    for (const b of this.cache.values()) b.close();
    this.cache.clear();
  }
}
