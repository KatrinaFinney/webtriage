'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import styles from '../styles/HeroSection.module.css';

export default function HeroSection() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Determine current domain on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  // Watch for mobile breakpoint
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openForm = (service: string) => {
    if (service === 'First Aid') {
      router.push(`/scan?site=${encodeURIComponent(domain)}`);
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'scan_started', {
          event_category: 'Hero CTA',
          event_label: service,
        });
      }
    } else {
      setSelectedService(service);
      setShowForm(true);
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'form_open', {
          event_category: 'Hero CTA',
          event_label: service,
        });
      }
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.halo} />

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          webtriage.pro
        </div>

        <div
          className={`${styles.heroContent} ${
            isMobile ? styles.heroContentMobile : ''
          }`}
        >
          <h1 className={styles.title}>
            Website Problems?
            <br />
            Let’s Fix That.
          </h1>
          <p className={styles.subtitle}>
            Fast, precise, worry-free support whenever your website needs it.
          </p>
        </div>

        <div className={styles.freeAidCard}>
          <p className={styles.cardText}>
            Just need a quick checkup? Try our{' '}
            <span
              className={styles.freeAidLink}
              onClick={() => openForm('First Aid')}
            >
              Free First Aid Scan
            </span>{' '}
            at no cost.
          </p>
          <button
            className={styles.freeAidButton}
            onClick={() => openForm('First Aid')}
          >
            Get First Aid
          </button>
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedService={selectedService || undefined}
      />
    </>
  );
}
