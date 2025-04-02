'use client';

export default function HeroSection() {
  return (
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
      {/* Pulsing red glow layer */}
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

      {/* Main hero content */}
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

      {/* Keyframes for pulse animation */}
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
        `}
      </style>
    </div>
  );
}
