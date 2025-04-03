'use client';

export default function TrustSection() {
  return (
    <section
      style={{
        padding: '3rem 1rem',
        backgroundColor: '#0d1325',
        color: '#f1f5f9',
        textAlign: 'center',
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>You’re In Good Hands</h2>
      <p
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          fontSize: '1.25rem',
          lineHeight: '1.6',
        }}
      >
        WebTriage.pro delivers steady, expert support for sites in distress. From broken pages to full rebuilds,
        our team works quickly and precisely to get you back online — and keep you there.
        We’ve helped dozens of websites recover from downtime, bugs, and performance issues.
      </p>
    </section>
  );
}
