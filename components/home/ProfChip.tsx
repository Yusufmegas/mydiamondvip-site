'use client';

// ?prof=1 profil çipi (spec §5): stalls / maxGap / boost / cache / ağ canlı okunur.

import { useEffect, useRef, type MutableRefObject } from 'react';
import type { EngineStats } from '@/lib/scrubEngine';

export default function ProfChip({ statsRef }: { statsRef: MutableRefObject<EngineStats | null> }) {
  const elRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current;
      if (!s || !elRef.current) return;
      elRef.current.textContent =
        `${s.mode} ${s.state} ${s.accel}\n` +
        `frame  ${s.drawnFrame} → ${s.targetFrame} (gap ${s.gap.toFixed(0)})\n` +
        `boost  ${s.boost.toFixed(2)}×\n` +
        `stalls ${s.stalls}  maxGap ${s.maxGapMs.toFixed(0)}ms\n` +
        `cache  ${s.cacheSize}  inflight ${s.inFlight}\n` +
        `req    m[${s.reqCenters}] son ${s.reqLast}\n` +
        `flush  ${s.flushes}  jump ${s.jumps}  reset ${s.resets}\n` +
        `net    ${s.netPct}%`;
    }, 250);
    return () => clearInterval(id);
  }, [statsRef]);

  return <pre ref={elRef} className="prof-chip" />;
}
