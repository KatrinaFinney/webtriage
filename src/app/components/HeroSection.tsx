import styles from '../styles/HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>Website Troubles? Let’s Fix That.</h1>
      <p>Calm, fast, precise support for websites that just need help.</p>
      <button>Start Your Fix</button>
    </section>
  );
}
