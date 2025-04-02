'use client';

declare global {
  interface Window {
    VANTA: any;
  }
}

  import { useEffect, useRef, useState } from 'react';
  import * as THREE from 'three';
  
  export default function VantaBackground() {
    const vantaRef = useRef<HTMLDivElement>(null);
    const [vantaEffect, setVantaEffect] = useState<any>(null);
  
    useEffect(() => {
      if (!vantaEffect && typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
        script.async = true;
        script.onload = () => {
          if (window.VANTA && vantaRef.current) {
            setVantaEffect(
              window.VANTA.NET({
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
                points: 10.0,
                maxDistance: 20.0,
                spacing: 15.0,
              })
            );
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