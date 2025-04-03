'use client';

import styles from '../styles/FaqSection.module.css';

export default function FAQSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>

        <div className={styles.item}>
          <h3 className={styles.question}>How fast can you fix my site?</h3>
          <p className={styles.answer}>
            Most emergency issues are resolved within 24–48 hours. We’ll assess the problem and begin triage as soon as we receive your intake form.
          </p>
        </div>

        <div className={styles.item}>
          <h3 className={styles.question}>Is this automated or AI-generated support?</h3>
          <p className={styles.answer}>
            Nope. Every fix is handled by a real developer who knows your site’s code. No bots. No templates. Just thoughtful, expert attention.
          </p>
        </div>

        <div className={styles.item}>
          <h3 className={styles.question}>What if I don’t know what’s wrong?</h3>
          <p className={styles.answer}>
            No problem. Just describe what’s happening in plain language — we’ll investigate and let you know what we find during the triage session.
          </p>
        </div>
      </div>
    </section>
  );
}
