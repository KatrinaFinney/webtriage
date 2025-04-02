'use client';

import styles from '../styles/CallToAction.module.css';

export default function CallToAction() {
  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <h2>Not sure what you need?</h2>
        <p>
          Whether it’s a bug, a breakdown, or just that “something’s off” feeling — We’ll take a look and give you a no-pressure diagnosis.
        </p>
        <a href="/triage-intake" className={styles.button}>Request a Site Triage</a>
      </div>
    </section>
  );
}
