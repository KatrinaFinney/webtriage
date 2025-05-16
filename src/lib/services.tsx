// src/lib/services.ts

import type { PSIResult } from '@/types/webVitals';

/* ── Shape for every service card / upsell ─────────────────────── */
export interface Service {
  slug:        string;       // url-safe ID (“perf-seo”, “triage”, …)
  title:       string;       // headline
  summary:     string;       // one-liner
  description: string;       // longer blurb (accordion / modal)
  features:    string[];     // list of deliverables/benefits
  price:       string;       // e.g. “$149” or “$499 /mo”
  cta:         string;       // button text
  link:        string;       // checkout / intake URL

  /* legacy aliases – kept for backwards compatibility */
  readonly name?: string;
  readonly desc?: string;
}

/* ── Master list of all services ──────────────────────────────── */
export const ALL_SERVICES: Service[] = [
  {
    slug:  'triage',
    title: 'Site Triage',
    summary: 'Comprehensive site health audit & strategic roadmap.',
    description:
      "Receive your Lighthouse performance breakdown (0–100), WCAG AA accessibility review, and mobile-responsiveness assessment. Within 24 hours we deliver an interactive PDF listing the top-impact fixes so you can boost speed, usability, and conversions.",
    features: [
      "Lighthouse performance report (0–100 score breakdown)",
      "WCAG AA accessibility review with top-5 fix list",
      "Mobile responsiveness assessment",
      "Interactive PDF roadmap delivered within 24 hours",
    ],
    price: '$99',
    cta:   'Start Triage',
    link:  '/order?service=Site%20Triage',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'emergency',
    title: 'Emergency Fix',
    summary: 'Rapid rescue & restore for critical site failures.',
    description:
      "When downtime strikes, we resolve critical errors quickly—restoring 99.9% uptime. You’ll receive a root-cause analysis and a prevention checklist to safeguard against future breakages.",
    features: [
      "Critical error resolution in under 4 hours",
      "99.9% uptime recovery guarantee",
      "Root-cause analysis summary",
      "Prevention checklist to block repeat issues",
    ],
    price: '$149',
    cta:   'Request a Fix',
    link:  '/order?service=Emergency%20Fix',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'perf-seo',
    title: 'Performance & SEO Boost',
    summary: 'Accelerate load times & climb search rankings.',
    description:
      "Boost your site speed by up to 40% (Lighthouse ≥ 90) and unlock new traffic with a keyword audit and schema enhancements. We deliver a data-driven engagement uplift plan tailored to your audience.",
    features: [
      "Boost load speed by up to 40% (Lighthouse ≥ 90)",
      "Targeted keyword audit with traffic impact forecast",
      "Meta & schema optimizations for richer snippets",
      "Engagement uplift plan based on real user data",
    ],
    price: '$199',
    cta:   'Boost Performance',
    link:  '/order?service=Performance%20SEO%20Boost',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'security',
    title: 'Security & Compliance Package',
    summary: 'Fortify your site & prove regulatory compliance.',
    description:
      "Eliminate vulnerabilities with a full threat scan and firewall setup that blocks 99% of common attacks. We handle GDPR cookie consent, privacy policy, and issue a compliance certificate for ADA, GDPR, and CCPA.",
    features: [
      "Full vulnerability scan & threat removal",
      "Firewall rules blocking 99% of common attacks",
      "GDPR cookie-consent & privacy policy setup",
      "Compliance certificate for ADA, GDPR & CCPA",
    ],
    price: '$299',
    cta:   'Secure My Site',
    link:  '/order?service=Security%20Compliance%20Package',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'care',
    title: 'Continuous Care',
    summary: 'Ongoing monitoring, reports & priority support.',
    description:
      "Stay ahead of issues with real-time uptime and performance alerts, plus a detailed monthly scorecard covering performance, SEO, and security. Priority support and quarterly growth playbooks keep you on track.",
    features: [
      "Real-time uptime & performance monitoring",
      "Monthly scorecard: performance, SEO & security",
      "Same-day response SLA for urgent issues",
      "Quarterly growth recommendations",
    ],
    price: '$499 /mo',
    cta:   'Start Care Plan',
    link:  '/order?service=Continuous%20Care',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
  {
    slug:  'recovery',
    title: 'Full Recovery Plan',
    summary: 'Total site overhaul with UX/UI & strategy reset.',
    description:
      "Transform your site into a modern, lightning-fast platform (Lighthouse ≥ 95) with WCAG AA compliance. Includes dedicated PM, user-testing sessions, and a 6-month strategic roadmap with clear milestones.",
    features: [
      "Modern rebuild with Lighthouse ≥ 95",
      "WCAG AA accessibility compliance",
      "Dedicated project manager & user testing",
      "6-month growth roadmap with milestones",
    ],
    price: 'From $999',
    cta:   'Plan Recovery',
    link:  '/order?service=Full%20Recovery%20Plan',
    get name() { return this.title; },
    get desc() { return this.summary; },
  },
];

/* ------------------------------------------------------------------
   Heuristic: rank services by need (lower score ⇒ higher priority)
-------------------------------------------------------------------*/
function weight(cat: PSIResult['categories'], slug: string): number {
  const { performance, seo } = cat;
  if (slug === 'perf-seo')   return (1 - performance.score) + (1 - seo.score);
  if (slug === 'emergency')  return 0.8;
  if (slug === 'security')   return 0.6;
  if (slug === 'triage')     return 1.0;
  if (slug === 'care')       return 0.5;
  return 0;
}

/** Build a sorted list tailored to the user’s scan */
export function buildServiceRecs(cat: PSIResult['categories']): Service[] {
  return [...ALL_SERVICES].sort((a, b) => weight(cat, b.slug) - weight(cat, a.slug));
}
