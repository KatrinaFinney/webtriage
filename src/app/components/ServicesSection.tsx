'use client';

import styles from '../styles/ServicesSection.module.css';

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <h2 className={styles.title}>Care Options</h2>
      <div className={styles.grid}>
        <div>
          <h3>Continuous Care</h3>
          <p>
            Proactive, long-term support to keep your site calm, healthy, and performing. Like having your own on-call digital medic.
          </p>
          <button className={styles.button}>Start Care</button>
        </div>
        <div>
          <h3>Emergency Fix</h3>
          <p>
            One-off issue that needs immediate care? We diagnose, treat, and discharge your site — fast.
          </p>
          <button className={styles.button}>Request a Fix</button>
        </div>
        <div>
          <h3>Full Recovery Plan</h3>
          <p>
            UX, speed, and reliability upgrades for websites that need more than a bandage — they need a transformation.
          </p>
          <button className={styles.button}>Start Recovery</button>
        </div>
      </div>
    </section>
  );
}
