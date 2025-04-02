import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer>
      <div className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} WebTriage.dev — All rights reserved.</p>
        <a href="#">Privacy Policy</a>
      </div>
    </footer>
  );
}
