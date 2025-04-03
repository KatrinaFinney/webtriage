'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Modal from './Modal';
import IntakeForm from './IntakeForm';

export default function HeroSection() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // ✅ Only load Vanta if screen is >= 768px
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // On mobile, skip Vanta & keep fallback background
      return;
    }

    let vantaEffect: { destroy: () => void } | null = null;

    if (!vantaRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && typeof window !== 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js';
          script.async = true;

          script.onload = () => {
            const VANTA = (window as { VANTA?: { GLOBE: (opts: object) => { destroy: () => void } } }).VANTA;
            if (VANTA && vantaRef.current) {
              vantaEffect = VANTA.GLOBE({
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
              });
            }
          };

          document.body.appendChild(script);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(vantaRef.current);

    return () => {
      if (vantaEffect) vantaEffect.destroy();
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={vantaRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          // Fallback for mobile or if Vanta fails to load
          backgroundColor: '#0a1128',
        }}
      >
        {/* 🔥 Badge */}
        <div
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '0.5rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 77, 77, 0.5)',
            boxShadow: '0 0 10px rgba(255, 77, 77, 0.5)',
            fontSize: '0.95rem',
            fontFamily: 'Space Grotesk, sans-serif',
            color: '#ff4d4d',
            animation: 'pulseBadge 2.5s ease-in-out infinite, fadeIn 1s ease-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            opacity: 0,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ff4d4d',
              animation: 'heartbeat 1.3s infinite ease-in-out',
            }}
          ></span>
          webtriage.pro
        </div>

        {/* 🌌 Hero Content */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            padding: '3rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '1rem',
            backdropFilter: 'blur(6px)',
            maxWidth: '90vw',
          }}
        >
          <h1
            style={{
              fontSize: '3.25rem',
              marginBottom: '1rem',
              fontFamily: 'Space Grotesk, sans-serif',
              lineHeight: '1.2',
            }}
          >
            <span style={{ display: 'block' }}>Website Problems?</span>
            <span style={{ display: 'block' }}>Let’s Fix That.</span>
          </h1>
          <p
            style={{
              fontSize: '1.4rem',
              marginBottom: '2rem',
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#dbeafe',
            }}
          >
            Calm, fast, precise support for websites that just need help.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#5a8dee',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              animation: 'pulseButton 2.5s ease-in-out infinite',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 500,
            }}
          >
            Stabilize My Site
          </button>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm />
      </Modal>
    </>
  );
}
