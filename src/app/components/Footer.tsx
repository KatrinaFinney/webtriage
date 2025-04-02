'use client';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} WebTriage.pro — All rights reserved.</p>
      <p>
        <a href="mailto:support@webtriage.pro">support@webtriage.pro</a>
      </p>
    </footer>
  );
}
