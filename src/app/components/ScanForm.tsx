// File: src/app/components/ScanForm.tsx
'use client';

import React from 'react';
import styles from '../styles/ScanPage.module.css';
import Button from '../components/Button';

interface ScanFormProps {
  domain: string;
  email: string;
  setDomain: (s: string) => void;
  setEmail: (s: string) => void;
  onStart: () => Promise<void> | void;
}

const ScanForm: React.FC<ScanFormProps> = ({
  domain,
  email,
  setDomain,
  setEmail,
  onStart,
}) => (
  <div className={styles.formContainer}>
    <h1 className={styles.title}>Free Website Check-up</h1>
    <p className={styles.subtext}>
      Enter your domain &amp; email for instant results.
    </p>

    <input
      className={styles.input}
      placeholder="https://example.com"
      value={domain}
      onChange={(e) => setDomain(e.target.value)}
    />
    <input
      className={styles.emailInput}
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <Button
      className={styles.darkButton}
      onClick={onStart}
      disabled={!domain || !email}
    >
      Start Check-up
    </Button>

    <p className={styles.optInNote}>
      By completing this check-up, you agree to receive your results and occasional
      relevant offers. We respect your privacy—no spam or selling your info.
    </p>
  </div>
);

export default ScanForm;
