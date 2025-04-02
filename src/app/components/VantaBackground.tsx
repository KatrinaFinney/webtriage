'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

declare global {
  interface Window {
    VANTA: any;
  }
}

type VantaEffectInstance = {
  destroy: () => void;
};

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
    script.async = true;
    script.onload = () => {
      if (window.VANTA && vantaRef.current) {
        setVantaEffect(
          window.VANTA.NET({
            el: vantaRef.current,
            THREE: THREE,
            color: 0x4e8fff,
            backgroundColor: 0x0a1128,
            points: 10.0,
            maxDistance: 22.0,
            spacing: 15.0,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
          })
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}
