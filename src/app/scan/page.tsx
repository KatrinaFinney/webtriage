/* ---------------------------------------------------------------
   src/app/scan/page.tsx   – client component entry
---------------------------------------------------------------- */
'use client';

/* ── React / hooks ──────────────────────────────────────────── */
import { useState, useEffect } from 'react';

/* ── UX helpers ─────────────────────────────────────────────── */
import toast           from 'react-hot-toast';


/* ── local modules ──────────────────────────────────────────── */
import LoaderRadar     from '../components/LoaderRadar';
import ScanResults     from '@/app/scan/ScanResults';
import { vibrate }      from '@/lib/haptics';

/* ── styling ───────────────────────────────────────────────── */
import styles          from '../styles/ScanPage.module.css';

/* ── types shared with ScanResults ─────────────────────────── */
import type { PSIResult } from '../../types/webVitals';

/* tiny local types */
type Phase = 'form' | 'pending' | 'results';
const REVALIDATE_MS = 3_000;

/* ---------- Scan Form ---------------------------------------------------- */
interface ScanFormProps{
  domain:string; email:string;
  setDomain:(s:string)=>void; setEmail:(s:string)=>void;
  onStart:()=>void;
}
const ScanForm:React.FC<ScanFormProps>=({
  domain,email,setDomain,setEmail,onStart,
})=>(
  <div className={styles.formContainer}>
    <h1 className={styles.title}>Website Urgent Care</h1>
    <p className={styles.subtext}>Enter your domain &amp; email for a free triage scan.</p>

    <input
      className={styles.input}
      placeholder="https://example.com"
      value={domain}
      onChange={e=>setDomain(e.target.value)}
    />
    <input
      className={styles.emailInput}
      placeholder="you@example.com"
      value={email}
      onChange={e=>setEmail(e.target.value)}
    />

    <button
      className={styles.darkButton}
      onClick={onStart}
      disabled={!domain||!email}
    >
      Start&nbsp;Scan
    </button>
  </div>
);

/* ---------- Pending spinner -------------------------------------------- */
const Pending:React.FC<{logs:string[]}> = ({logs})=>(
  <div className={styles.scanningContainer}>
    <LoaderRadar/>
    <p className={styles.runningText}>Performing your website triage&hellip;</p>
    {logs.length>0 && (
      <ul className={styles.debugList}>
        {logs.map((l,i)=><li key={i}>{l}</li>)}
      </ul>
    )}
  </div>
);
/* ----------------------------------------------------------------
   Main ScanPage – orchestrates phases
---------------------------------------------------------------- */
export default function ScanPage(){
  /* ── state -------------------------------------------------- */
  const[domain, setDomain] = useState('');
  const[email , setEmail ] = useState('');
  const[phase , setPhase ] = useState<Phase>('form');
  const[scanId, setScanId] = useState<number|null>(null);
  const[logs  , setLogs  ] = useState<string[]>([]);
  const[result, setResult] = useState<PSIResult|null>(null);

  /* ---------- haptic util ----------------------------------- */
  const buzz = (pattern:number|number[])=>{
    if(typeof navigator!=='undefined' && 'vibrate' in navigator){
      navigator.vibrate(pattern);
    }
  };

  /* ---------- startScan ------------------------------------- */
  const startScan = async()=>{
    setPhase('pending'); setLogs([]); buzz(50);

    const res = await fetch('/api/scan',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({site:domain,email}),
    });
    if(!res.ok){ toast.error('Scan request failed'); setPhase('form'); return; }
    setScanId((await res.json()).scanId);
  };

/* ── Poll for scan status ───────────────────────────────────── */
useEffect(() => {
  if (phase !== 'pending' || scanId == null) return;

  const iv = setInterval(async () => {
    try {
      /* ① fetch the latest status */
      const res = await fetch(`/api/scan/status/${scanId}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const payload = (await res.json()) as {
        status: string;
        result?: PSIResult;
        logs: string[];
      };

      /* ② stream logs to the UI + haptic ping */
      setLogs(payload.logs);
      vibrate('ping');

      /* ③ finished? …clean up & advance */
      if (payload.status === 'done' && payload.result) {
        clearInterval(iv);
        vibrate('success');

        setResult(payload.result);
        setPhase('results');
        toast.success('📧 Report emailed!');
      }
    } catch (err) {
      /* network / JSON / server error */
      console.error(err);
      vibrate('error');
    }
  }, REVALIDATE_MS);

  /* tidy up on unmount */
  return () => clearInterval(iv);
}, [phase, scanId]);

  /* ---------- render ---------------------------------------- */
  return(
    <div className={styles.page}>
      {phase==='form' && (
        <ScanForm
          domain={domain} email={email}
          setDomain={setDomain} setEmail={setEmail}
          onStart={startScan}
        />
      )}

      {phase==='pending' && <Pending logs={logs}/>}

      {phase==='results' && result && (
        <ScanResults
          domain={domain}
          result={result}
          onRerun={()=>{
            setResult(null); setScanId(null); setPhase('form');
          }}
        />
      )}
    </div>
  );
}
