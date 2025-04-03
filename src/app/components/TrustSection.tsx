'use client';

export default function TrustSection() {
  return (
    <section
      style={{
        padding: '4rem 1rem',
        backgroundImage: 'linear-gradient(to bottom, rgba(10, 17, 40, 0.75), #0a1128)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '1rem',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '700px',
          width: '100%',
          color: '#f1f5f9',
          textAlign: 'center',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>You’re In Good Hands</h2>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
          WebTriage.pro delivers steady, expert support for sites in distress. From broken pages to full rebuilds,
          our team works quickly and precisely to get you back online — and keep you there.
          We’ve helped dozens of websites recover from downtime, bugs, and performance issues.
        </p>
      </div>
    </section>
  );
}
