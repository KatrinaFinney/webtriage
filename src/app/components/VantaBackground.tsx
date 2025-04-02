'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VantaEffectInstance } from '@/types/VantaEffect';

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    if (!vantaEffect && typeof window !== 'undefined' && vantaRef.current) {
      const loadScript = () => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
        script.async = true;
        script.onload = () => {
          if (window.VANTA && typeof window.VANTA.GLOBE === 'function') {
            const effect = window.VANTA.GLOBE({
              el: vantaRef.current!,
              THREE: THREE,
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
            }) as VantaEffectInstance;

            setVantaEffect(effect);
          } else {
            console.warn('VANTA.GLOBE is not a function');
          }
        };

        document.body.appendChild(script);
      };

      if (!window.VANTA || !window.VANTA.GLOBE) {
        loadScript();
      } else {
        // Already available
        const effect = window.VANTA.GLOBE({
          el: vantaRef.current!,
          THREE: THREE,
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
        }) as VantaEffectInstance;

        setVantaEffect(effect);
      }
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      suppressHydrationWarning
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
