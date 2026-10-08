'use client';

// ?prof=1 profil çipi (spec §5): stalls / maxGap / jump / hold / cache / ağ canlı okunur.

import { useEffect, useRef, type MutableRefObject } from 'react';
import type { EngineStats } from '@/lib/scrubEngine';

export default function ProfChip({ statsRef }: { statsRef: MutableRefObject<EngineStats | null> }) {
  const elRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current;
      if (!s || !elRef.current) return;
      elRef.current.textContent =
        `${s.mode} ${s.state}\n` +
        `decode ${s.accel} · ${s.accelReason}\n` +
        `frame  ${s.drawnFrame} → ${s.targetFrame} (gap ${s.gap.toFixed(0)})\n` +
        `gop    ${s.gop}  hold ${(s.holdMs / 1000).toFixed(1)}s\n` +
        `stalls ${s.stalls}  maxGap ${s.maxGapMs.toFixed(0)}ms\n` +
        `cache  ${s.cacheSize}  inflight ${s.inFlight}\n` +
        `req    m[${s.reqCenters}] son ${s.reqLast}\n` +
        `flush  ${s.flushes}  jump ${s.jumps}  reset ${s.resets}\n` +
        `net    ${s.netPct}%  ${s.netMB}MB  abort ${s.staleAborts}`;
    }, 250);
    return () => clearInterval(id);
  }, [statsRef]);

  return <pre ref={elRef} className="prof-chip" />;
}
