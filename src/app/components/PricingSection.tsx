'use client';

import styles from '../styles/PricingSection.module.css';

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <h2 className={styles.title}>Your Website Support Plan</h2>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.heading}>Emergency Fix</h3>
          <p className={styles.price}>$149</p>
          <ul className={styles.list}>
            <li>One-time repair for urgent issues</li>
            <li>Broken buttons, layout bugs, weird behavior</li>
            <li>Fast response + full resolution</li>
          </ul>
          <button className={styles.button}>Triage My Issue</button>
        </div>

        <div className={styles.highlight}>
          <h3 className={styles.heading}>Continuous Care</h3>
          <p className={styles.price}>$499/mo</p>
          <ul className={styles.list}>
            <li>Ongoing bug fixes, performance tuning</li>
            <li>Monthly audits + priority email support</li>
            <li>Perfect for active websites & founders</li>
          </ul>
          <button className={styles.button}>Start Continuous Care</button>
        </div>

        <div>
          <h3 className={styles.heading}>Full Recovery Plan</h3>
          <p className={styles.price}>$999+</p>
          <ul className={styles.list}>
            <li>Complete front-end overhaul</li>
            <li>Speed, UX, and accessibility improvements</li>
            <li>Scoped & personalized transformation</li>
          </ul>
          <button className={styles.button}>Start Recovery</button>
        </div>
      </div>
    </section>
  );
}
