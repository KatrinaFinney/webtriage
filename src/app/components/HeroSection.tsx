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

export default function HeroSection() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    const loadVanta = () => {
      if (!vantaEffect && typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
        script.async = true;
        script.onload = () => {
          if (window.VANTA && vantaRef.current) {
            setVantaEffect(
              window.VANTA.GLOBE({
                el: vantaRef.current,
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
              })
            );
          }
        };
        document.body.appendChild(script);
      }
    };

    loadVanta();
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          padding: '2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '1rem',
          backdropFilter: 'blur(6px)',
          maxWidth: '90vw',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Website Troubles? Let’s Fix That.
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
          Calm, fast, precise support for websites that just need help.
        </p>
        <button
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#4e8fff',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(78,143,255,0.4)',
          }}
        >
          Start Your Fix
        </button>
      </div>
    </div>
  );
}
