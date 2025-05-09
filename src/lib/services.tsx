/* ------------------------------------------------------------------
   src/lib/services.ts
   Unified catalogue of WebTriage “treatments”
-------------------------------------------------------------------*/
import type { PSIResult } from '@/types/webVitals';

/* ── Shape for every service card / upsell ─────────────────────── */
export interface Service {
  /* internal */
  slug:   string;     // url‑safe ID (“perf-seo”, “triage”, …)

  /* public copy */
  title:  string;     // headline on the card
  summary:string;     // short one‑liner
  description:string; // longer blurb (used in accordion / modal)
  price:  string;     // e.g. “$149” or “$499 / mo”
  cta:    string;     // button text
  link:   string;     // checkout / intake URL

  /* legacy aliases – keep old code working */
  readonly name?: string;
  readonly desc?: string;
}

/* ── Master list (copied from ServicesSection) ─────────────────── */
export const ALL_SERVICES: Service[] = [
  {
    slug:  'triage',
    title: 'Site Triage',
    summary: 'Full site diagnosis & action plan.',
    description:
      "Get a comprehensive overview of your website's health. We evaluate performance, usability, and accessibility to deliver a tailored roadmap that pinpoints key areas for improvement.",
    price: '$99',
    cta:   'Start Triage',
    link:  '/order?service=Site%20Triage',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'emergency',
    title: 'Emergency Fix',
    summary: 'Rapid rescue for urgent site issues.',
    description:
      'When a critical error strikes, our emergency team springs into action to restore functionality quickly. We resolve core issues and provide actionable insights to help prevent future problems.',
    price: '$149',
    cta:   'Request a Fix',
    link:  '/order?service=Emergency%20Fix',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'perf-seo',
    title: 'Performance & SEO Boost',
    summary: 'Optimise speed and elevate search rankings.',
    description:
      'Enhance your website with advanced speed optimisations and targeted SEO strategies. Enjoy faster load times, increased engagement, and improved search visibility that drive qualified traffic.',
    price: '$199',
    cta:   'Boost Performance',
    link:  '/order?service=Performance%20SEO%20Boost',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'security',
    title: 'Security & Compliance Package',
    summary: 'Protect your site & meet industry standards.',
    description:
      'Safeguard your online presence with a thorough security audit, proactive threat mitigation, and compliance reviews. Build trust by ensuring your website meets the highest industry standards.',
    price: '$299',
    cta:   'Secure My Site',
    link:  '/order?service=Security%20Compliance',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'care',
    title: 'Continuous Care',
    summary: 'Proactive monthly maintenance & monitoring.',
    description:
      'Stay ahead of issues with regular updates, continuous monitoring, and proactive maintenance. Our dedicated team ensures your website remains secure, optimised, and ready to support your growth.',
    price: '$499 /mo',
    cta:   'Start Care Plan',
    link:  '/order?service=Continuous%20Care',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'recovery',
    title: 'Full Recovery Plan',
    summary: 'Complete overhaul for under‑performing sites.',
    description:
      'Transform your outdated site into a modern, fast, and engaging platform. We rebuild your frontend, enhance performance, and deliver a refreshed user experience that drives lasting success.',
    price: 'From $999',
    cta:   'Plan Recovery',
    link:  '/order?service=Full%20Recovery%20Plan',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
];

/* ------------------------------------------------------------------
   Heuristic: rank services by need (lower Lighthouse score ⇒ higher)
-------------------------------------------------------------------*/
function weight(cat: PSIResult['categories'], slug: string): number {
  const { performance, seo } = cat;

  if (slug === 'perf-seo') return (1 - performance.score) + (1 - seo.score);
  if (slug === 'emergency') return 0.8;           // always high
  if (slug === 'security')  return 0.6;           // medium default

  /* fall‑backs */
  if (slug === 'triage')    return 1.0;           // always show first
  if (slug === 'care')      return 0.5;           // always show last

  return 0; // default
}

/** Build a sorted list tailored to the user’s scan */
export function buildServiceRecs(cat: PSIResult['categories']): Service[] {
  return [...ALL_SERVICES]
    .sort((a, b) => weight(cat, b.slug) - weight(cat, a.slug));
}
