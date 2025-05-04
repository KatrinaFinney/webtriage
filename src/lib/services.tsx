/* ---------------------------------------------------------------
   src/lib/services.ts                – “treatments” catalogue
---------------------------------------------------------------- */
import type { PSIResult } from '@/types/webVitals';

/* ---------- public interface ---------------------------------- */
export interface Service {
  name : string;
  price: string;
  desc : string;
  cta  : string;
  link : string;
}

/* ---------- master list --------------------------------------- */
const ALL_SERVICES: Record<string, Service> = {
  full: {
    name : 'Site Triage Report',
    price: '$99',
    desc : 'A physician‑style examination of every page plus a step‑by‑step recovery prescription.',
    cta  : 'Send my care plan',
    link : '/order?service=Full%20Triage',
  },

  emergency: {
    name : 'Priority Stabilisation',
    price: '$149',
    desc : 'We fix the single most critical issue uncovered in your scan—fast.',
    cta  : 'Stabilise my site',
    link : '/order?service=Emergency%20Fix',
  },

  speed: {
    name : 'Performance Therapy',
    price: '$199',
    desc : 'Targeted code & asset optimisation to achieve sub‑second load times.',
    cta  : 'Accelerate speed',
    link : '/order?service=Speed%20Boost',
  },

  a11y: {
    name : 'Accessibility Rehab',
    price: '$179',
    desc : 'WCAG‑guided adjustments so everyone enjoys full, frustration‑free access.',
    cta  : 'Improve accessibility',
    link : '/order?service=Accessibility',
  },

  seo: {
    name : 'Visibility Enhancement',
    price: '$189',
    desc : 'Structured data & crawl‑path fixes to raise your search rankings.',
    cta  : 'Enhance visibility',
    link : '/order?service=SEO',
  },

  mobile: {
    name : 'Mobile Optimisation',
    price: '$159',
    desc : 'Touch‑friendly layouts & media tuning for on‑the‑go visitors.',
    cta  : 'Optimise mobile UX',
    link : '/order?service=Mobile',
  },
};

/* ---------- recommendation helper ----------------------------- */
export function buildServiceRecs(
  c: PSIResult['categories'],
): Service[] {
  const needs = [
    { svc: ALL_SERVICES.speed,  score: 1 - c.performance.score },
    { svc: ALL_SERVICES.a11y,   score: 1 - c.accessibility.score },
    { svc: ALL_SERVICES.seo,    score: 1 - c.seo.score },
    { svc: ALL_SERVICES.mobile, score: 1 - (c['mobile-friendly']?.score ?? 1) },

    /* always show baseline offers */
    { svc: ALL_SERVICES.emergency, score: 0.50 },
    { svc: ALL_SERVICES.full,      score: 0.40 },
  ];

  return needs.sort((a, b) => b.score - a.score).map(n => n.svc);
}
