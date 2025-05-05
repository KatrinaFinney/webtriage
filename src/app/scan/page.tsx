// File: src/app/scan/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vibrate } from '@/lib/haptics';

import LoaderRadar from '../components/LoaderRadar';
import ScanForm    from '../components/ScanForm';
import ScanResults from '../scan/ScanResults';

import styles      from '../styles/ScanPage.module.css';
import type { PSIResult } from '@/types/webVitals';

type Phase = 'form' | 'pending' | 'results';
const REVALIDATE_MS = 3000;

export default function ScanPage() {
  const [domain, setDomain] = useState('');
  const [email,  setEmail ] = useState('');
  const [phase,  setPhase ] = useState<Phase>('form');
  const [scanId, setScanId] = useState<number | null>(null);
  const [logs,   setLogs  ] = useState<string[]>([]);
  const [result, setResult] = useState<PSIResult | null>(null);

  /* Kick off the vibration pattern for “start” */
  const startScan = async () => {
    setPhase('pending');
    setLogs([]);
    vibrate('start');

    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: domain, email }),
    });
    if (!res.ok) {
      toast.error('Scan request failed');
      setPhase('form');
      return;
    }
    const { scanId } = await res.json();
    setScanId(scanId);
  };

  /* Polling loop for scan status */
  useEffect(() => {
    if (phase !== 'pending' || scanId == null) return;

    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/scan/status/${scanId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const payload = await res.json() as {
          status: string;
          result?: PSIResult;
          logs: string[];
        };

        setLogs(payload.logs);
        vibrate('ping');

        if (payload.status === 'done' && payload.result) {
          clearInterval(iv);
          vibrate('success');
          setResult(payload.result);
          setPhase('results');
          toast.success('📧 Report emailed!');
        }
      } catch {
        vibrate('error');
      }
    }, REVALIDATE_MS);

    return () => clearInterval(iv);
  }, [phase, scanId]);

  return (
    <div className={styles.page}>
      {phase === 'form' && (
        <ScanForm
          domain={domain}
          email={email}
          setDomain={setDomain}
          setEmail={setEmail}
          onStart={startScan}
        />
      )}

      {phase === 'pending' && <Pending logs={logs} />}

      {phase === 'results' && result && (
        <ScanResults
          domain={domain}
          result={result}
          onRerun={() => {
            setResult(null);
            setScanId(null);
            setPhase('form');
          }}
        />
      )}
    </div>
  );
}

/* ── Pending UI ─────────────────────────────────────────── */
const Pending: React.FC<{ logs: string[] }> = ({ logs }) => (
  <div className={styles.scanningContainer}>
    <LoaderRadar />
    <p className={styles.runningText}>Performing your website triage…</p>
    <ul className={styles.debugList}>
      {logs.map((log, i) => (
        <li key={i}>{log}</li>
      ))}
    </ul>
  </div>
);
