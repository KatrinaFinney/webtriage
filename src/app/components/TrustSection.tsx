'use client';

import styles from '../styles/TrustSection.module.css';

export default function TrustSection() {
  return (
    <section className={styles.trust}>
      <div className={styles.container}>
        <h2 className={styles.title}>You’re In Good Hands</h2>
        <p className={styles.description}>
          WebTriage.pro delivers steady, expert support for sites in distress.
          From broken pages to full rebuilds, our team works quickly and precisely
          to get you back online — and keep you there.
          We’ve helped dozens of websites recover from downtime, bugs, and performance issues.
        </p>
      </div>
    </section>
  );
}
