'use client';

import styles from '../styles/PricingSection.module.css';
import { useState } from 'react';
import Modal from './Modal';
import IntakeForm from './IntakeForm';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <motion.section
        className={styles.pricing}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <h2 className={styles.title}>Tailored Treatment Options</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Emergency Fix</h3>
            <p className={styles.price}>$149</p>
            <ul className={styles.featureList}>
              <li>1 urgent issue resolved</li>
              <li>Diagnosis + fix</li>
              <li>48hr turnaround</li>
            </ul>
            <button className={styles.button} onClick={() => setShowForm(true)}>Request a Fix</button>
          </div>

          <div className={`${styles.card} ${styles.featured}`}>
            <div className={styles.badge}>Best Value</div>
            <h3 className={styles.cardTitle}>Continuous Care</h3>
            <p className={styles.price}>$499/mo</p>
            <ul className={styles.featureList}>
              <li>Unlimited fixes</li>
              <li>Monthly audits</li>
              <li>Speed, uptime & plugin monitoring</li>
            </ul>
            <button className={styles.button} onClick={() => setShowForm(true)}>Start Care</button>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Full Recovery Plan</h3>
            <p className={styles.price}>$999+</p>
            <ul className={styles.featureList}>
              <li>Performance & design overhaul</li>
              <li>Accessibility & UX upgrade</li>
              <li>Scoped custom rebuild</li>
            </ul>
            <button className={styles.button} onClick={() => setShowForm(true)}>Start Recovery</button>
          </div>
        </div>
      </motion.section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm />
      </Modal>
    </>
  );
}
