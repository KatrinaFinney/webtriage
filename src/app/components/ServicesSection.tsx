'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ServicesSection.module.css';
import Modal from './Modal';
import IntakeForm from './IntakeForm';

export default function ServicesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleCard = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const services = [
    {
      title: 'Continuous Care',
      summary: 'Ongoing proactive support & monitoring.',
      description: `This monthly plan is for business owners, creatives, and founders who can’t afford site issues. It includes ongoing uptime monitoring, bug fixes, plugin updates, speed optimization, mobile responsiveness checks, and monthly audits.

It’s like having a calm, professional web medic always on call. Ideal for sites that need consistency — not chaos.`,
      button: 'Start Care',
    },
    {
      title: 'Emergency Fix',
      summary: 'One-time urgent repair for critical site issues.',
      description: `Broken layout? Checkout down? Styles gone rogue? We rapidly triage the issue, fix what’s urgent, and restore stability.

You’ll receive a diagnosis, a breakdown of what happened, and recommendations for further care. This is digital CPR for your website — fast and focused.`,
      button: 'Request a Fix',
    },
    {
      title: 'Full Recovery Plan',
      summary: 'A complete rebuild for underperforming websites.',
      description: `If your site feels outdated, slow, or clunky, this is a full-scale transformation. We’ll audit your current setup, rebuild your frontend for speed and clarity, apply accessibility best practices, and streamline the experience for your users.

This is ideal for older or DIY-built websites that now need professional care to thrive.`,
      button: 'Start Recovery',
    },
  ];

  return (
    <>
      <motion.section
        className={styles.services}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <h2 className={styles.title}>Choose Your Care Plan</h2>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => toggleCard(index)}
            >
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardSummary}>{service.summary}</p>

              {openIndex === index ? (
                <div className={styles.cardBody}>
                  <p className={styles.cardDescription}>{service.description}</p>
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent toggling the card
                      setOpenIndex(null);  // Collapse any open card
                      setShowForm(true);     // Open the modal
                    }}
                  >
                    {service.button}
                  </button>
                </div>
              ) : (
                <span className={styles.expandHint}>Learn more ↓</span>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </>
  );
}
