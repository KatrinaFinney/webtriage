'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from '../styles/ScanPage.module.css';
import LoaderRadar from '../components/LoaderRadar';
import Image from 'next/image';

type PSIResult = {
  categories: Record<'performance' | 'accessibility' | 'seo' | 'mobile-friendly', { score: number }>;
  screenshots: string[];
};

type Phase = 'form' | 'pending' | 'results';

const buildHeroSummary = (categories: PSIResult['categories']): React.ReactNode => {
  const { performance, accessibility, seo, 'mobile-friendly': mobile } = categories;

  return (
    <div className={styles.heroSummary}>
      Your website scan is complete. Overall, your site&rsquo;s health is stable, but we&rsquo;ve identified key areas for improvement.
      {performance.score < 0.7 && ' Improving your site&rsquo;s speed will significantly enhance user satisfaction and SEO rankings.'}
      {accessibility.score < 0.7 && ' Accessibility enhancements will ensure all users can effectively navigate your site.'}
      {seo.score < 0.7 && ' SEO refinements will boost your visibility in search results.'}
      {mobile.score < 0.7 && ' Optimizing for mobile will greatly enhance usability for your on-the-go visitors.'}
      We recommend addressing these areas promptly to achieve optimal website health.
    </div>
  );
};
export default function ScanPage() {
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<PSIResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [, setElapsed] = useState(0);

  const startScan = async () => {
    setPhase('pending');
    setLogs([]);
    setElapsed(0);

    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: domain, email }),
    });

    if (!res.ok) {
      const payload = await res.json();
      alert(payload.error || 'Scan request failed');
      setPhase('form');
      return;
    }

    const { scanId } = await res.json();
    setScanId(scanId);
  };

  useEffect(() => {
    if (phase !== 'pending' || !scanId) return;
    const iv = setInterval(async () => {
      const res = await fetch(`/api/scan/status/${scanId}`);
      const payload = await res.json();
      setLogs(payload.logs);
      if (payload.status === 'done' && payload.result) {
        clearInterval(iv);
        setResult(payload.result);
        setPhase('results');
        toast.success('📧 Report emailed!');
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [phase, scanId]);
  return (
    <div className={styles.page}>
      {phase === 'form' && (
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Website Urgent Care</h1>
          <p className={styles.subtext}>Enter your domain and email for your free site scan.</p>
          <input className={styles.input} placeholder="Website URL" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <input className={styles.emailInput} placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className={styles.darkButton} onClick={startScan}>Start Scan</button>
        </div>
      )}

      {phase === 'pending' && (
        <div className={styles.scanningContainer}>
          <LoaderRadar />
          <p className={styles.runningText}>Performing your website triage, please wait...</p>
          <ul>{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
        </div>
      )}
      {phase === 'results' && result && (
        <div className={styles.resultsContainer}>
          <h2 className={styles.resultTitle}>Triage Results for <span className={styles.resultDomain}>{domain}</span></h2>
          {buildHeroSummary(result.categories)}

          <div className={styles.grid}>
            {Object.entries(result.categories).map(([cat, { score }]) => (
              <div key={cat} className={styles.card}>
                <span className={styles.cardLabel}>{cat.replace('-', ' ').toUpperCase()}</span>
                <span className={styles.cardScore}>{Math.round(score * 100)}</span>
              </div>
            ))}
          </div>

          <div className={styles.screenshotContainer}>
            {result.screenshots.slice(0,2).map((src, idx) => (
              <Image key={idx} src={src} alt={`Screenshot ${idx + 1}`} width={600} height={400} className={styles.screenshotCentered} />
            ))}
          </div>

          <div className={styles.nextSteps}>
            <h3 className={styles.nextStepsTitle}>Recommended Services</h3>
            <div className={styles.servicesGrid}>
              {['Full Triage Report ($99)', 'Emergency Fix ($149)', 'Monthly Continuous Care ($499/mo)'].map((service, idx) => (
                <div key={idx} className={styles.serviceCard}>
                  <span className={styles.serviceTitle}>{service}</span>
                  <button className={styles.darkButton}>Request Service</button>
                </div>
              ))}
            </div>
          </div>

          <button className={styles.darkButton} onClick={() => location.reload()}>Scan Another Site</button>
        </div>
      )}
    </div>
  );
}
