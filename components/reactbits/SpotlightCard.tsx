'use client';

// React Bits SpotlightCard (TS-CSS) — MyDiamondVIP adaptasyonu.
// Kart görünümü dayatmaz: mevcut markup'ın üzerine yalnızca düşük yoğunluklu,
// geniş ve yumuşak bir şampanya spotlight katmanı ekler. Dokunmatik cihazlarda
// ve prefers-reduced-motion'da spotlight CSS tarafında tamamen kapalıdır.

import React, { useRef } from 'react';
import './SpotlightCard.css';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(201, 155, 95, 0.10)'
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

export default SpotlightCard;
