'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styles from '../styles/ServiceDetailModal.module.css';
import Button from './Button';
import { serviceDetails, ServiceDetail } from '@/lib/serviceDetails';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartIntake: (service: string) => void;
  serviceKey: string | null;
}

const nurseTagline =
  "🩺 We focus on your website’s health, so you can focus on what matters.";

export default function ServiceDetailModal({
  isOpen,
  onClose,
  onStartIntake,
  serviceKey,
}: ServiceDetailModalProps) {
  if (!serviceKey) return null;
  const svc: ServiceDetail = serviceDetails[serviceKey];
  if (!svc) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.heroContent}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            {/* Close button */}
            <button className={styles.closeButton} onClick={onClose}>
              &times;
            </button>

            <h2 className={styles.title}>{svc.title}</h2>
            <p className={styles.nurseTagline}>{nurseTagline}</p>

            <p className={styles.description}>{svc.description}</p>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🩺 What’s Included</h3>
              <ul className={styles.list}>
                {svc.features.map((feat) => (
                  <li key={feat}>{feat}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Treatment Plan</h3>
              <ul className={styles.list}>
                {svc.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💡 Benefits You’ll See</h3>
              <ul className={styles.list}>
                {svc.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <Button
                onClick={() => {
                  onClose();
                  onStartIntake(svc.title);
                }}
              >
                {svc.ctaLabel}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
