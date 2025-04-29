// src/lib/services.ts

export type CategoryKey = 'performance' | 'accessibility' | 'seo';
export type Categories = Record<CategoryKey, { score: number }>;

export interface Service {
  name: string;
  price: string;
  desc: string;
  cta: string;
  link: string;
}

export function buildServiceRecs(categories: Categories): Service[] {
  const recs: Service[] = [];

  if (categories.performance.score < 0.8) {
    recs.push({
      name: 'Emergency Fix',
      price: '$149',
      desc: 'Fast, targeted repairs for critical issues.',
      cta: 'Request Fix',
      link: '/services?service=Emergency%20Fix',
    });
  }

  if (categories.accessibility.score < 0.75 || categories.seo.score < 0.75) {
    recs.push({
      name: 'Continuous Care',
      price: '$499/mo',
      desc: 'Monthly health checks & 24/7 monitoring.',
      cta: 'Subscribe',
      link: '/services?service=Continuous%20Care',
    });
  }

  // always include these two
  recs.push(
    {
      name: 'Site Triage',
      price: '$99',
      desc: 'In-depth audit with action roadmap.',
      cta: 'Start Triage',
      link: '/services?service=Site%20Triage',
    },
    {
      name: 'Full Recovery Plan',
      price: 'From $999',
      desc: 'Complete rebuild & optimization.',
      cta: 'Plan Recovery',
      link: '/services?service=Full%20Recovery%20Plan',
    }
  );

  return recs;
}
