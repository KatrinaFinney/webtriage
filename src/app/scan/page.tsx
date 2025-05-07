// File: src/app/scan/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vibrate } from '@/lib/haptics';

import LoaderRadar from '../components/LoaderRadar';
import ScanForm    from '../components/ScanForm';
import ScanResults from './ScanResults';

import styles      from '../styles/ScanPage.module.css';
import type { PSIResult } from '@/types/webVitals';

type Phase = 'form' | 'pending' | 'results' | 'error';
const REVALIDATE_MS = 3000;

// messages to rotate every 15s
const loadingMessages = [
  'Performing your free first aid scan…',
  'Checking vital signs…',
  'Gathering key metrics…',
  'Finalizing your report…',
];

export default function ScanPage() {
  const [domain,     setDomain   ] = useState('');
  const [email,      setEmail    ] = useState('');
  const [phase,      setPhase    ] = useState<Phase>('form');
  const [scanId,     setScanId   ] = useState<number | null>(null);
  const [logs,       setLogs     ] = useState<string[]>([]);
  const [result,     setResult   ] = useState<PSIResult | null>(null);
  const [scannedAt,  setScannedAt] = useState<string>('');
  const [errorMsg,   setErrorMsg ] = useState<string | null>(null);

  // which loading message to show
  const [msgIndex, setMsgIndex] = useState(0);

  /* start a new scan */
  const startScan = async () => {
    setPhase('pending');
    setErrorMsg(null);
    setLogs([]);
    vibrate('start');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: domain, email }),
      });
      if (!res.ok) throw new Error(`Request failed ${res.status}`);
      const { scanId } = await res.json();
      setScanId(scanId);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Scan request failed';
      setErrorMsg(msg);
      setPhase('error');
    }
  };

  /* rotate the loading message every 15 s */
  useEffect(() => {
    if (phase === 'pending') {
      setMsgIndex(0);
      const intv = setInterval(() => {
        setMsgIndex(i => (i + 1) % loadingMessages.length);
      }, 15000);
      return () => clearInterval(intv);
    }
  }, [phase]);

  /* poll for status */
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;

    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = (await res.json()) as {
          status:    string;
          result?:   PSIResult;
          logs:      string[];
          error?:    string;
          scannedAt?: string;
        };

        setLogs(payload.logs);

        if (payload.status === 'error') {
          throw new Error(payload.error ?? 'Scan failed on server');
        }

        vibrate('ping');

        if (payload.status === 'done' && payload.result) {
          clearInterval(iv);
          vibrate('success');
          setResult(payload.result);
          setScannedAt(payload.scannedAt ?? '');
          setPhase('results');
          toast.success('Report complete!');
        }
      } catch (err: unknown) {
        clearInterval(iv);
        console.error(err);
        vibrate('error');
        const msg = err instanceof Error ? err.message : 'Unexpected error';
        setErrorMsg(msg);
        setPhase('error');
      }
    }, REVALIDATE_MS);

    return () => clearInterval(iv);
  }, [phase, scanId]);

  /* UI by phase */
  if (phase === 'form') {
    return (
      <div className={styles.page}>
        <ScanForm
          domain={domain}
          email={email}
          setDomain={setDomain}
          setEmail={setEmail}
          onStart={startScan}
        />
      </div>
    );
  }

  if (phase === 'pending') {
    return (
      <div className={styles.page}>
        <div className={styles.scanningContainer}>
          {/* larger spinner */}
          <div className={styles.loaderWrapper}>
            <LoaderRadar />
          </div>
          {/* rotating message */}
          <p className={styles.runningText}>
            {loadingMessages[msgIndex]}
          </p>
          {logs.length > 0 && (
            <ul className={styles.debugList}>
              {logs.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.glassCard}>
          <h2>Oops, something went wrong</h2>
          <p style={{ color: '#f88', margin: '1rem 0' }}>{errorMsg}</p>
          <button
            className={styles.darkButton}
            onClick={() => {
              setPhase('form');
              setErrorMsg(null);
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* results */
  return (
    <div className={styles.page}>
      {result && (
        <ScanResults
          domain={domain}
          result={result}
          scannedAt={scannedAt}
          onRerun={() => {
            setResult(null);
            setScanId(null);
            setScannedAt('');
            setPhase('form');
          }}
        />
      )}
    </div>
  );
}
