// Vanta-Friendly Services Section with Glass Cards

import styles from '../styles/ServicesSection.module.css';

export default function ServicesSection() {
  return (
    <section className={styles.services}>
      <h2>What We Offer</h2>
      <div className={styles.grid}>
        <div>
          <h3>Calm Contracts</h3>
          <p>Ongoing site support for businesses that need steady hands.</p>
        </div>
        <div>
          <h3>One-Time Fixes</h3>
          <p>Got a weird bug, broken form, or urgent layout issue? We’ll fix it.</p>
        </div>
        <div>
          <h3>Site Uplifts</h3>
          <p>We improve speed, style, UX, or structure — your call.</p>
        </div>
      </div>
    </section>
  );
}
