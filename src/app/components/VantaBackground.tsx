'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type VantaEffectInstance = {
  destroy: () => void;
};

export default function VantaBackground({ children }: { children: React.ReactNode }) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    if (!vantaEffect && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
      script.async = true;
      script.onload = () => {
        if (window.VANTA?.GLOBE && vantaRef.current) {
          const effect = window.VANTA.GLOBE({
            el: vantaRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x4e8fff,
            backgroundColor: 0x0a1128,
            size: 1.2,
            points: 12.0,
          });
          setVantaEffect(effect);
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className={vantaEffect ? 'vanta-ready' : 'vanta-loading'}
      style={{
        width: '100vw',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
}
