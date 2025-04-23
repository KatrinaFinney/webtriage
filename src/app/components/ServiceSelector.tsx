'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/ServiceSelector.module.css';

interface ServiceSelectorProps {
  domain: string;
  onSelectService: (service: string) => void;
}

export default function ServiceSelector({
  domain,
  onSelectService,
}: ServiceSelectorProps) {
  const router = useRouter();
  const isDisabled = domain.trim() === '';

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = e.target.value;
    if (!service) return;

    if (service === 'Free Scan') {
      return router.push(`/scan?site=${encodeURIComponent(domain)}`);
    }
    onSelectService(service);
  };

  const onButtonClick = () => {
    router.push(`/scan?site=${encodeURIComponent(domain)}`);
  };

  return (
    <div className={styles.container}>
      <div>
        <label htmlFor="service-select" className={styles.label}>
          Choose a service
        </label>
        <select
          id="service-select"
          disabled={isDisabled}
          defaultValue=""
          className={`${styles.select} ${isDisabled ? styles.disabled : ''}`}
          onChange={onChange}
        >
          <option value="">— pick one —</option>
          <option value="Free Scan">Free Scan</option>
          <option value="Full Recovery Plan">Full Recovery Plan</option>
          <option value="Emergency Fix">Emergency Fix</option>
          <option value="Continuous Care Plan">Continuous Care Plan</option>
        </select>
      </div>

      <button
        type="button"
        aria-label="Start Free Scan"
        disabled={isDisabled}
        className={`${styles.button} ${isDisabled ? styles.disabled : ''}`}
        onClick={onButtonClick}
      >
        Free Scan
      </button>
    </div>
  );
}
