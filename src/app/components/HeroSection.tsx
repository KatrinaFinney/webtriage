'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/HeroSection.module.css';
import Button from '../components/Button';

export default function HeroSection() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
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
              onClick={startFreeScan}
            >
              Free Website Check-up
            </span>{' '}
            at no cost.
          </p>
          <Button
            className={styles.freeAidButton}
            onClick={startFreeScan}
          >
            Get a Check-up
          </Button>
        </div>
      </div>

    </>
  );
}
