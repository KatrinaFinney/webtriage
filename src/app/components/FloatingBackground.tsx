'use client';
import styles from '../styles/FloatingBackground.module.css';

export default function FloatingBackground() {
  return (
    <div className={styles.background}>
      <div className={styles.shape1}></div>
      <div className={styles.shape2}></div>
      <div className={styles.shape3}></div>
    </div>
  );
}
