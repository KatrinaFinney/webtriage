'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/CallToAction.module.css';
import Modal from './Modal';
import Button from '../components/Button';

export default function CallToAction() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Grab current hostname for /scan?site=
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  const openTriage = () => {
    const service = 'Site Triage';
    setSelectedService(service);
    setShowForm(true);
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'form_open', {
        event_category: 'CTA',
        event_label: service,
      });
    }
  };

  const startFreeScan = () => {
    if (!domain) return;
    router.push(`/scan?site=${encodeURIComponent(domain)}`);
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'scan_started', {
        event_category: 'CTA',
        event_label: 'Free Scan',
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Breathe New Life into Your Website
        </h2>
        <p className={styles.subtext}>
          Whether you’re facing a sudden outage or need a long-overdue upgrade,
          we’ve got you covered. Let’s work together to restore and enhance your
          site—so you can get back to what matters most.
        </p>

        <div className={styles.buttonGroup}>
          <Button
            className={styles.button}
            onClick={startFreeScan}
            disabled={!domain}
          >
            Free Website Check-up
          </Button>
          <Button
            className={styles.button}
            onClick={openTriage}
          >
            Stabilize My Site Now
          </Button>
        </div>
      </div>

      {/* Modal for Site Triage only */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedService={selectedService || undefined}
      />
    </section>
  );
}
