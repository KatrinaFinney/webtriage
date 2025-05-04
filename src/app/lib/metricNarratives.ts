/* ---------------------------------------------------------------
   Narrative “copy pools” shown under the big category score cards
---------------------------------------------------------------- */
import type { CategoryKey } from '@/types/webVitals';

/** Convenience buckets */
type Bucket = 'excellent' | 'good' | 'fair' | 'poor';

/** Random helper */
const choose = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/* ---------------------------------------------------------------
   Copy pools – every CategoryKey **must** expose the four buckets
---------------------------------------------------------------- */
export const pools: Record<CategoryKey, Record<Bucket, string[]>> = {
  /* ——————————————————— PERFORMANCE ——————————————————— */
  performance: {
    excellent: [
      'Pages load in a heartbeat – no waiting room required.',
      'Your caching protocol deserves a gold star from every triage nurse.',
    ],
    good: [
      'Vitals are healthy, but a quick IV of optimisation could shave precious ms.',
      'Latency is under control; one round of minification might finish the job.',
    ],
    fair: [
      'Pages jog instead of sprint; time for some cardio‑rehab.',
      'Waiting times edge into frustration territory – let’s open that airway.',
    ],
    poor: [
      'Vitals critical – visitors flat‑line before content appears.',
      'Conversion haemorrhage detected; administer CDN transfusion ASAP.',
    ],
  },

  /* ————————————————— ACCESSIBILITY ———————————————— */
  accessibility: {
    excellent: [
      'Inclusive by design – every visitor gets a front‑row seat.',
      'Colour contrast passes with flying hues; vision‑impaired users applaud.',
    ],
    good: [
      'Most users breeze through; a few tweaks will achieve universal care.',
      'Contrast ratios are stable; interactive states need a second look.',
    ],
    fair: [
      'Navigation hits obstacles like an IV pole in the hallway.',
      'Alt‑text gaps leave screen‑reader users guessing – fill those charts.',
    ],
    poor: [
      'Critical impairments – some patients can’t enter the ward.',
      'Screen readers hit dead ends; add ARIA way‑finding STAT.',
    ],
  },

  /* ———————————————————— SEO ———————————————————— */
  seo: {
    excellent: [
      'You’re ranking like a seasoned chief surgeon – visibility is stellar.',
      'Bots crawl effortlessly; nothing gets left on the operating table.',
    ],
    good: [
      'You’re in the search ward’s top beds – a few tweaks and you’re ICU‑free.',
      'Structured data passes; adding FAQ schema could yield rich results.',
    ],
    fair: [
      'Search vitals stable but unremarkable – time for optimisation therapy.',
      'Keyword targeting anaemia – enrich copy with semantic relatives.',
    ],
    poor: [
      'Search visibility in critical condition – hardly a pulse on page 1.',
      'Meta‑data flat‑lines; Google sees an empty chart.',
    ],
  },

  /* ——————————————— MOBILE‑FRIENDLY ——————————————— */
  'mobile-friendly': {
    excellent: [
      '📱 Layouts flex perfectly – thumb‑friendly and lightning fast.',
      '📱 A seamless bedside manner on every screen size.',
    ],
    good: [
      '📱 Overall solid; minor tweaks to tap targets will reach perfection.',
      '📱 Image compression will cut 4G data costs for on‑the‑go users.',
    ],
    fair: [
      '📱 Occasional layout shifts – reinforce breakpoints and font sizes.',
      '📱 Buttons sit a bit too close; spacing therapy recommended.',
    ],
    poor: [
      '📱 Critical issues on small screens: text tiny, buttons cramped.',
      '📱 Non‑responsive design hampers half your traffic – urgent care needed.',
    ],
  },
};

/* ---------------------------------------------------------------
   Public helper
---------------------------------------------------------------- */
export function narrativeFor(metric: CategoryKey, score: number): string {
  const bucket: Bucket =
    score >= 90
      ? 'excellent'
      : score >= 75
      ? 'good'
      : score >= 50
      ? 'fair'
      : 'poor';

  return choose(pools[metric][bucket]);
}
