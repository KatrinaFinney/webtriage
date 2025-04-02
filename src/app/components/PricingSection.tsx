'use client';

import styles from '../styles/PricingSection.module.css';

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <h2 className={styles.title}>Care Plans</h2>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.heading}>Emergency Fix</h3>
          <p className={styles.price}>$149</p>
          <ul className={styles.list}>
            <li>Diagnose + fix one issue</li>
            <li>Quick response & resolution</li>
            <li>Email-based support</li>
          </ul>
          <button className={styles.button}>Request a Fix</button>
        </div>
        <div>
          <h3 className={styles.heading}>Continuous Care</h3>
          <p className={styles.price}>$499/mo</p>
          <ul className={styles.list}>
            <li>Unlimited minor fixes</li>
            <li>Performance monitoring</li>
            <li>Priority support access</li>
          </ul>
          <button className={styles.button}>Start Continuous Care</button>
        </div>
        <div>
          <h3 className={styles.heading}>Full Recovery</h3>
          <p className={styles.price}>$999+</p>
          <ul className={styles.list}>
            <li>Custom UX & speed audit</li>
            <li>Design, structure, & SEO upgrades</li>
            <li>Scoped rebuild or transformation</li>
          </ul>
          <button className={styles.button}>Start Recovery</button>
        </div>
      </div>
    </section>
  );
}
