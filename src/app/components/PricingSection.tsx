'use client';

import styles from '../styles/PricingSection.module.css';

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <h2 className={styles.title}>Choose Your Care</h2>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.heading}>Emergency Fix</h3>
          <p className={styles.price}>$149</p>
          <ul className={styles.list}>
            <li>One urgent issue diagnosed and resolved — fast</li>
            <li>Common use cases: broken buttons, down pages, broken forms, mobile layout disasters</li>
            <li>Stabilize and restore functionality without the drama</li>
          </ul>
          <a href="/start-fix" className={styles.cta}>Start My Fix</a>
        </div>

        <div className={styles.highlight}>
          <h3 className={styles.heading}>Continuous Care</h3>
          <p className={styles.price}>$499/mo</p>
          <ul className={styles.list}>
            <li>Hands-on monthly support for sites that can&#39;t afford breakdowns</li>
            <li>Includes bug fixes, performance boosts, plugin & CMS patching</li>
            <li>Real-time monitoring + monthly reports to stay ahead of issues</li>
          </ul>
          <a href="/get-care" className={styles.cta}>Get Continuous Care</a>
        </div>

        <div>
          <h3 className={styles.heading}>Full Recovery</h3>
          <p className={styles.price}>$999+</p>
          <ul className={styles.list}>
            <li>Deep rehab for outdated, glitchy, or neglected websites</li>
            <li>Performance, UX, and reliability audit — with upgrades to match</li>
            <li>Perfect for relaunches, funding rounds, or customer trust rebuilds</li>
          </ul>
          <a href="/recovery-intake" className={styles.cta}>Start Recovery Plan</a>
        </div>
      </div>
    </section>
  );
}
