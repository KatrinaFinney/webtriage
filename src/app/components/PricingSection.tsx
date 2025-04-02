'use client';
import styles from '../styles/PricingSection.module.css';

export default function PricingSection() {
  return (
    <section className={styles.pricing}>
      <h2 className={styles.title}>Simple, Fair Pricing</h2>
      <div className={styles.grid}>
        <div>
          <h3 className={styles.heading}>One-Time Fix</h3>
          <p className={styles.price}>$149</p>
          <ul className={styles.list}>
            <li>1 issue fixed</li>
            <li>Fast turnaround</li>
            <li>Email support</li>
          </ul>
        </div>
        <div className={styles.highlight}>
          <h3 className={styles.heading}>Calm Contract</h3>
          <p className={styles.price}>$499/mo</p>
          <ul className={styles.list}>
            <li>Ongoing fixes & support</li>
            <li>Priority response</li>
            <li>Monthly check-ins</li>
          </ul>
        </div>
        <div>
          <h3 className={styles.heading}>Site Uplift</h3>
          <p className={styles.price}>$999+</p>
          <ul className={styles.list}>
            <li>Performance + design audit</li>
            <li>Speed & UX upgrades</li>
            <li>Scoped custom work</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
