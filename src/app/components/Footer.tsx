'use client';

export default function Footer() {
  return (
    <footer
      style={{
        padding: '2rem',
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#cfd8dc',
        backgroundColor: 'transparent',
      }}
    >
      <p>
        Want to build something new?{' '}
        <a
          href="https://buildmywebsite.pro"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#80deea',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'color 0.2s ease, text-decoration 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#4dd0e1';
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#80deea';
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Visit buildmywebsite.pro →
        </a>
      </p>
      <p>
        &copy; {new Date().getFullYear()} WebTriage.pro &mdash; All rights reserved.
      </p>
    </footer>
  );
}
