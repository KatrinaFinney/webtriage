'use client';

import { useState } from 'react';
import styles from '../styles/CallToAction.module.css';
import Modal from './Modal';
import IntakeForm from './IntakeForm';
import { motion } from 'framer-motion';

export default function CallToAction() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <motion.section
        className={styles.ctaWrapper}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <div className={styles.ctaContainer}>
          <h2 className={styles.title}>Stressed about your site?</h2>
          <p className={styles.subtitle}>
            We’re your calm, fast support team — ready to triage and treat whatever’s broken.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => setShowForm(true)}
          >
            Stabilize My Website
          </button>
          <div className={styles.secondaryPrompt}>
            Not sure what you need?{' '}
            <a href="#" onClick={() => setShowForm(true)} className={styles.secondaryLink}>
              Request a site triage
            </a>
          </div>
        </div>
      </motion.section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </>
  );
}
