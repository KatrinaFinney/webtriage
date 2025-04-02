'use client';

import styles from '../styles/CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.ctaWrapper}>
      <div className={styles.ctaContainer}>
        <h2 className={styles.title}>
          Stressed about your site?
        </h2>
        <p className={styles.subtitle}>
          We’re your calm, fast support team — ready to triage and treat whatever’s broken.
        </p>
        <button className={styles.ctaButton}>Stabilize My Website</button>
      </div>
    </section>
  );
}
