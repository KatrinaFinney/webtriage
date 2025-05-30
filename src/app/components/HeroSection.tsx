'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/HeroSection.module.css';
import Button from '../components/Button';

export default function HeroSection() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

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

        {/* Combined hero section */}
        <div
          className={`${styles.heroContent} ${
            isMobile ? styles.heroContentMobile : ''
          }`}
        >
          <h1 className={styles.title}>
            Need Website Care?
          </h1>
          <p className={styles.subtitle}>
            We&apos;re Here to Help.
          </p>
          
          {/* "Get Your Site's Vitals" and Button moved into hero section */}
          <div className={styles.vitalsContent}>
            <Button
              className={styles.freeAidButton}
              onClick={startFreeScan}
            >
              Free Website Check-up
            </Button>
          </div>

          {/* Trust Message */}
          <p className={styles.trustMessage}>
            Trusted by businesses like yours.
          </p>
        </div>
      </div>
      <div className="travelingLine" />
    </>
  );
}
