'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vibrate } from '@/lib/haptics';

import ScanForm    from '../components/ScanForm';
import ScanLoader  from '../components/ScanLoader';
import ScanResults from './ScanResults';

import styles      from '../styles/ScanPage.module.css';
import type { PSIResult } from '@/types/webVitals';

type Phase = 'form' | 'pending' | 'results' | 'error';
const REVALIDATE_MS = 3000;

const loadingMessages = [
  'Warming up the server…',
  'Measuring first bytes…',
  'Rendering critical content…',
  'Checking accessibility…',
  'Analyzing SEO signals…',
  'Capturing site snapshot…',
  'Calculating speed index…',
  'Evaluating layout stability…'
];

function setFavicon(href: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

// --- NEW: explicit payload type for status endpoint ---
type ScanStatusPayload = {
  logs: string[];
  status: 'pending' | 'done' | 'error';
  error?: string;
  result?: PSIResult;
  scannedAt?: string;
};

export default function ScanPage() {
  const [domain, setDomain]     = useState('');
  const [email, setEmail]       = useState('');
  const [phase, setPhase]       = useState<Phase>('form');
  const [scanId, setScanId]     = useState<number|null>(null);
  const [logs, setLogs]         = useState<string[]>([]);
  const [result, setResult]     = useState<PSIResult|null>(null);
  const [scannedAt, setScannedAt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [loaderComplete, setLoaderComplete] = useState(false);

  /* Phase-based title + favicon updates */
  useEffect(() => {
    if (phase === 'pending') {
      document.title = 'Scanning Website Vitals…';
      setFavicon('/favicons/spinner.ico');
    } else if (phase === 'results') {
      document.title = 'Website Vitals Ready';
      setFavicon('/favicons/done.ico');
    } else if (phase === 'form') {
      document.title = 'Start Your Website Scan';
    } else if (phase === 'error') {
      document.title = 'Scan Error';
    }
  }, [phase]);

  /* start a new scan */
  const startScan = async () => {
    setPhase('pending');
    setLoaderComplete(false);
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
      setErrorMsg(err instanceof Error ? err.message : 'Scan request failed');
      setPhase('error');
    }
  };

  /* rotate the loading message every 6s */
  useEffect(() => {
    if (phase === 'pending') {
      setMsgIndex(0);
      const iv = setInterval(() => {
        setMsgIndex(i => (i + 1) % loadingMessages.length);
      }, 6000);
      return () => clearInterval(iv);
    }
  }, [phase]);

  /* poll for status */
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        // --- UPDATED: cast to our explicit type ---
        const payload = await res.json() as ScanStatusPayload;
        console.log('🛠 scan status payload:', payload);
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
          setLoaderComplete(true);
        }
      } catch (err: unknown) {
        clearInterval(iv);
        console.error(err);
        vibrate('error');
        setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
        setPhase('error');
      }
    }, REVALIDATE_MS);

    return () => clearInterval(iv);
  }, [phase, scanId]);

  /* once ScanLoader has finished fading out */
  const handleLoaderFadeOut = () => {
    setPhase('results');
  };

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
          <div className={styles.loaderWrapper}>
            <ScanLoader
              isComplete={loaderComplete}
              onFadeOut={handleLoaderFadeOut}
            />
          </div>
          <p className={styles.runningText}>
            {loadingMessages[msgIndex]}
          </p>
          {logs.length > 0 && (
            <ul className={styles.debugList}>
              {logs.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
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

  // results
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
