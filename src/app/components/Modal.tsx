'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/Modal.module.css'; // ← adjust if your CSS is elsewhere

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
}

export default function Modal({
  isOpen,
  onClose,
  selectedService,
}: ModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Build Tally URL with selected service prefilled
  const formURL = selectedService
    ? `https://tally.so/r/mOV2q8?service=${encodeURIComponent(
        selectedService
      )}`
    : 'https://tally.so/r/mOV2q8';

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, type: 'spring', stiffness: 150 }}
          >
            <button
              className={styles.close}
              onClick={onClose}
              aria-label="Close form"
            >
              &times;
            </button>

            {!iframeLoaded && (
              <div className={styles.spinnerContainer}>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>
                  Loading secure intake form…
                </p>
              </div>
            )}

            <p
              style={{
                color: '#dbeafe',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
              }}
            >
              Your request is safe and confidential. WebTriage will never sell
              your data.
            </p>

            <iframe
              src={formURL}
              width="100%"
              height="700"
              onLoad={() => setIframeLoaded(true)}
              style={{
                border: 'none',
                display: iframeLoaded ? 'block' : 'none',
              }}
              title="WebTriage Intake Form"
            />

            {iframeLoaded && (
              <p className={styles.trustMessage}>
                🔒 All data is encrypted and securely stored. No credit card
                required.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
