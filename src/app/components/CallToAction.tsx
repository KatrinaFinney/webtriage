'use client';
import styles from '../styles/CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.cta}>
      <h2 className={styles.heading}>Need Website Help?</h2>
      <p className={styles.subheading}>
      Whether it&apos;s a bug, a boost, or a brand new build — we&apos;ve got you covered.
      </p>
      <button className={styles.button}>Start Your Fix</button>
    </section>
  );
}
