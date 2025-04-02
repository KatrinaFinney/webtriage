'use client';

import { useState } from 'react';
import styles from '../styles/CallToAction.module.css';
import Modal from './Modal';
import IntakeForm from './IntakeForm';

export default function CallToAction() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <section className={styles.ctaWrapper}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.title}>
            Stressed about your site?
          </h2>
          <p className={styles.subtitle}>
            We’re your calm, fast support team — ready to triage and treat whatever’s broken.
          </p>

          <button className={styles.ctaButton} onClick={() => setShowForm(true)}>
            Stabilize My Website
          </button>

          <div className={styles.secondaryPrompt}>
            Not sure what you need?{' '}
            <a href="#" onClick={() => setShowForm(true)} className={styles.secondaryLink}>
              Request a site triage
            </a>
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm />
      </Modal>
    </>
  );
}
