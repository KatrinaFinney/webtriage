'use client';

import React from 'react';
import styles from '../styles/ScanPage.module.css';

interface ScanFormProps {
  domain: string;
  email: string;
  setDomain: (s: string) => void;
  setEmail: (s: string) => void;
  onStart: () => void;
}

export default function ScanForm({
  domain,
  email,
  setDomain,
  setEmail,
  onStart,
}: ScanFormProps) {
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Website Urgent Care</h1>
      <p className={styles.subtext}>
        Enter your domain &amp; email for a free triage scan.
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

      <button
        className={styles.darkButton}
        onClick={onStart}
        disabled={!domain || !email}
      >
        Start Scan
      </button>
    </div>
  );
}
