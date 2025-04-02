'use client';

import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        &copy; {new Date().getFullYear()} WebTriage.pro &mdash; All rights reserved.
      </p>
    </footer>
  );
}
