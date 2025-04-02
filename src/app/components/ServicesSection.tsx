import styles from '../styles/ServicesSection.module.css';

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <h2>Our Services</h2>
      <div className={styles.grid}>
        <div>
          <h3>Calm Contracts</h3>
          <p>Reliable, worry-free website support on your terms.</p>
        </div>
        <div>
          <h3>One-Time Fixes</h3>
          <p>From broken buttons to layout bugs—get it handled.</p>
        </div>
        <div>
          <h3>Site Uplifts</h3>
          <p>Refresh and refine your site without a full rebuild.</p>
        </div>
      </div>
    </section>
  );
}