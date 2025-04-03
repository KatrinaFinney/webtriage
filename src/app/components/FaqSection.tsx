'use client';

export default function FAQSection() {
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
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#ff4d4d',
          }}
        >
          Frequently Asked Questions
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f87171' }}>
            How fast can you fix my site?
          </h3>
          <p style={{ lineHeight: '1.6' }}>
            Most emergency issues are resolved within 24–48 hours. We’ll assess the problem and begin triage as soon as we receive your intake form.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f87171' }}>
            Is this automated or AI-generated support?
          </h3>
          <p style={{ lineHeight: '1.6' }}>
            Nope. Every fix is handled by a real developer who knows your site’s code.
            No bots. No templates. Just thoughtful, expert attention.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f87171' }}>
            What if I don’t know what’s wrong?
          </h3>
          <p style={{ lineHeight: '1.6' }}>
            No problem. Just describe what’s happening in plain language — we’ll investigate and let you know what we find during the triage session.
          </p>
        </div>
      </div>
    </section>
  );
}
