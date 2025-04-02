'use client';

export default function HeroSection() {
  return (
    <>
      {/* Brand top-left */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 10,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginBottom: '0.25rem',
          }}
        >
          WebTriage.pro
        </p>
        <span
          style={{
            display: 'block',
            height: '2px',
            width: '100%',
            background: 'rgba(255, 77, 77, 0.5)',
            boxShadow: '0 0 6px 2px rgba(255, 77, 77, 0.3)',
            animation: 'pulseUnderline 2.8s ease-in-out infinite',
            borderRadius: '1px',
          }}
        />
      </div>

      {/* Hero content with background pulse */}
      <div
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 0, 0, 0.15)',
            filter: 'blur(80px)',
            animation: 'pulseGlow 2.8s ease-in-out infinite',
            zIndex: 0,
          }}
        />

        {/* Hero card */}
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            padding: '2rem',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '1rem',
            backdropFilter: 'blur(6px)',
            maxWidth: '90vw',
            fontFamily: "'Space Grotesk', sans-serif",
            zIndex: 1,
            position: 'relative',
          }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Urgent Care for Broken Websites.
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            From critical bugs to silent failures — I diagnose fast, and fix even faster.
          </p>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#5a8dee',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              animation: 'pulseButton 2.5s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(90, 141, 238, 0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            Start Your Fix
          </button>
        </div>

        {/* Keyframes */}
        <style>
          {`
            @keyframes pulseGlow {
              0% {
                transform: scale(1);
                opacity: 0.7;
              }
              50% {
                transform: scale(1.15);
                opacity: 1;
              }
              100% {
                transform: scale(1);
                opacity: 0.7;
              }
            }

            @keyframes pulseUnderline {
              0% {
                transform: scaleX(1);
                opacity: 0.5;
              }
              50% {
                transform: scaleX(1.1);
                opacity: 1;
              }
              100% {
                transform: scaleX(1);
                opacity: 0.5;
              }
            }

            @keyframes pulseButton {
              0% {
                transform: scale(1);
                box-shadow: 0 0 8px rgba(90, 141, 238, 0.2);
              }
              50% {
                transform: scale(1.04);
                box-shadow: 0 0 16px rgba(90, 141, 238, 0.35);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 0 8px rgba(90, 141, 238, 0.2);
              }
            }
          `}
        </style>
      </div>
    </>
  );
}
