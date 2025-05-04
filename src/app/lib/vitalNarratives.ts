export type VitalKey =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'speed-index'
  | 'total-blocking-time'
  | 'cumulative-layout-shift';

type Bucket = 'excellent' | 'good' | 'fair' | 'poor';

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
export const vitalNarratives: Record<VitalKey, Record<Bucket, string[]>> = {
    /* ——— FCP ————————————————————————— */
    'first-contentful-paint': {
      excellent: [
        'Your content appears almost instantly – patients see a friendly face before they can blink. This rapid reassurance keeps stress hormones low and trust levels high.',
        'FCP clocks in lightning‑fast; first impressions are as sharp as a new scalpel. Visitors feel cared for the moment they walk through the digital doors.'
      ],
      good: [
        'The first element shows up promptly, but a metabolic booster (image compression) could shave off another few 100 ms. Small wins add up in patient satisfaction.',
        'Visitors aren’t left waiting, yet a touch of lazy‑loading would make that hello even snappier. Think of it as trimming seconds off the triage intake.'
      ],
      fair: [
        'There’s a heartbeat, but the vitals lag; users glance at the clock. Optimise critical CSS to get them into the exam room quicker.',
        'FCP is approaching the discomfort zone – large hero images act like extra body weight on the treadmill. A diet of modern formats (WebP/AVIF) is advised.'
      ],
      poor: [
        'Patients stare at a blank screen far too long – confidence haemorrhages. Prioritise above‑the‑fold resources STAT.',
        'FCP flat‑lines over three seconds; that’s an eternity in ER time. Defer non‑critical scripts and issue a CDN transfusion immediately.'
      ]
    },
  
    /* ——— LCP ————————————————————————— */
    'largest-contentful-paint': {
      excellent: [
        'Hero content loads before users even sit down – exemplary bedside manner. Google will award you top marks for this vitality.',
        'Your main banner lands like a smooth injection – painless and quick. That keeps bounce rates on the gurney, not your revenue.'
      ],
      good: [
        'LCP is strong, but there’s room for a supplement. Pre‑loading hero images can move you from “healthy” to “elite athlete.”',
        'Main content appears on time; shaving 200 ms would future‑proof the performance chart.'
      ],
      fair: [
        'Hero still suiting‑up when users scroll – they might fidget. Compress or resize that banner to restore healthy tempo.',
        'LCP bordering on sluggish; reduce server‑response time to avoid visitor impatience.'
      ],
      poor: [
        'Critical delay: users might abandon before the story unfolds. Investigate render‑blocking scripts and administer code‑splitting stat!',
        'LCP exceeds Google’s safe range – search ranking anaemia imminent. Deploy image CDN and monitor vitals hourly.'
      ]
    },
  
    /* ——— Speed Index ————————————— */
    'speed-index': {
      excellent: [
        'Visual completeness races ahead; the page stabilises before coffee cools. That’s Formula‑1 calibre rendering.',
        'Speed Index in the green means your interface pieces together seamlessly, reducing cognitive load to near zero.'
      ],
      good: [
        'Overall paint speed is respectable; sprinkle in resource hints to reach podium‑level finish times.',
        'A touch of code trimming can tighten the visual stitches and move you into elite territory.'
      ],
      fair: [
        'Visual build‑out feels piecemeal – users may tap their feet. Combine critical CSS and preconnect to key domains for faster assembly.',
        'Speed Index suggests mild inefficiencies; treat with selective hydration or skeleton screens.'
      ],
      poor: [
        'Screen paints arrive like test results by snail‑mail – too slow. Investigate bulky third‑party scripts clogging the IV line.',
        'High Speed Index indicates visual jank; implement content‑delivery triage and compress animations ASAP.'
      ]
    },
  
    /* ——— TBT ————————————————————————— */
    'total-blocking-time': {
      excellent: [
        'Main thread remains clear; interactions feel as responsive as a reflex hammer. Users enjoy silky browsing with zero lag.',
        'Blocking time hardly registers – JavaScript is trimmed like a well‑kept suture kit.'
      ],
      good: [
        'Rare micro‑stalls show up on the ECG; splitting long tasks will polish the interaction surface.',
        'Mostly smooth, but a sprinkle of code‑splitting could eliminate brief thread congestion.'
      ],
      fair: [
        'Clicks feel a touch sticky; heavy JS chunks hog the main artery. Break tasks into <50 ms slices for better blood flow.',
        'TBT shows strain; swap synchronous scripts for async/defers to relieve pressure.'
      ],
      poor: [
        'Severe thread blockage – user taps may feel ignored. Perform a JavaScript bypass surgery immediately.',
        'Main thread saturation causes interaction arrhythmia; triage long tasks and monitor with Web Vitals.'
      ]
    },
  
    /* ——— CLS ————————————————————————— */
    'cumulative-layout-shift': {
      excellent: [
        'Layout rock‑solid; nothing jumps like a startled patient. That stability fosters calm and boosts perceived quality.',
        'CLS nearly zero – visual elements hold position like disciplined med‑staff during rounds.'
      ],
      good: [
        'Mild twitches detected; reserve space for images to reach textbook steadiness.',
        'Tiny layout nudges occur on slower connections – specifying dimensions will prevent them.'
      ],
      fair: [
        'Shifts feel like bed‑rail adjustments – distracting but survivable. Inject size attributes and preload fonts for stability.',
        'CLS above threshold; visitors may lose their place. Remedy with explicit width/height and avoiding late‑loading banners.'
      ],
      poor: [
        'Content spasms disrupt reading flow – high risk of accidental clicks. Immediate intervention: eliminate pop‑in ads and define element sizes.',
        'Layout jitter resembles tremors; this erodes trust. Pin down dynamic components or patients might sign out AMA (against medical advice).'
      ]
    }
  };
/* ----------  EXTRA DIAGNOSTIC LINES  ---------- */
Object.assign(vitalNarratives['first-contentful-paint'], {
    excellent: [
      ...vitalNarratives['first-contentful-paint'].excellent,
      'The first visual cue bursts onto the screen before pupils fully dilate. That kind of reflex wins conversions.',
      'Blink and you’ll miss it — your above‑the‑fold payload is triage‑room fast, setting an immediate tone of competence.'
    ],
    good: [
      ...vitalNarratives['first-contentful-paint'].good,
      'Visitors greet your brand promptly; trimming a couple JS bandages could make the intro even crisper.',
      'FCP is healthy, but shaving render‑blocking fonts would get you discharge papers sooner.'
    ],
    fair: [
      ...vitalNarratives['first-contentful-paint'].fair,
      'Users sense a short pause before your content appears. An image‑format transplant (AVIF) should revive it.',
      'Sub‑optimal resource order is like stopping for coffee on the way to the ER; reprioritise to cut seconds.'
    ],
    poor: [
      ...vitalNarratives['first-contentful-paint'].poor,
      'Critical wait times push stress levels sky‑high. Inline key CSS and preload hero assets to stop the bleeding.',
      'Patients may walk out before vitals are taken; triage third‑party tags or risk site abandonment.'
    ]
  });
  
  Object.assign(vitalNarratives['largest-contentful-paint'], {
    excellent: [
      ...vitalNarratives['largest-contentful-paint'].excellent,
      'Main banner lands before the stethoscope is warm — a perfect handshake with both users and search bots.',
      'LCP soars through every assessment; you’re delivering bedside charm at fiber‑optic pace.'
    ],
    good: [
      ...vitalNarratives['largest-contentful-paint'].good,
      'Solid delivery time; implementing server‑side compression could nudge you into athletic territory.',
      'Hero arrives swiftly, though a touch of resource hinting (prefetch/preload) could earn a gold star.'
    ],
    fair: [
      ...vitalNarratives['largest-contentful-paint'].fair,
      'Hero hangs in traffic; optimise render path or users may feel they’re in the waiting room.',
      'LCP is borderline; a responsive‑image regimen will relieve the congestion.'
    ],
    poor: [
      ...vitalNarratives['largest-contentful-paint'].poor,
      'Slow hero content is a morale drain. Consider a critical‑CSS injection and image CDN transfusion.',
      'LCP exceeds safety limits — search rankings could flatline. Surgery: defer heavy widgets, streamline fonts.'
    ]
  });
  Object.assign(vitalNarratives['speed-index'], {
    excellent: [
      ...vitalNarratives['speed-index'].excellent,
      'Visual assembly feels instantaneous, like a practiced crash‑cart drill. Cohesion breeds confidence.',
      'Every UI element clicks into view without delay; it’s the UX version of a perfect suture line.'
    ],
    good: [
      ...vitalNarratives['speed-index'].good,
      'Minor flashes of blank canvas appear; eliminating unused CSS could smooth the stitches.',
      'Speed Index is solid. A service‑worker booster would keep repeat visits in tip‑top shape.'
    ],
    fair: [
      ...vitalNarratives['speed-index'].fair,
      'The visual build is serviceable but not slick. Adopt code‑splitting therapy for complex bundles.',
      'Piece‑by‑piece rendering causes mild frustration; compress animations to calm the pulse.'
    ],
    poor: [
      ...vitalNarratives['speed-index'].poor,
      'Content paints like drip‑feed IV — visitors grow restless. Audit third‑party scripts ASAP.',
      'High Speed Index indicates visual haze; prescribe lazy‑loading and remove render‑blocking relics.'
    ]
  });
  
  Object.assign(vitalNarratives['total-blocking-time'], {
    excellent: [
      ...vitalNarratives['total-blocking-time'].excellent,
      'Interaction latency is negligible; your JS payload is leaner than a surgeon’s scalpel set.',
      'Every click is greeted instantly — you’re operating with robotic‑surgery precision.'
    ],
    good: [
      ...vitalNarratives['total-blocking-time'].good,
      'Thread congestion is rare but measurable; sprinkle in a `requestIdleCallback` for background tasks.',
      'Some polyfills hover at the edge of tolerance; pruning them moves you to ICU‑grade responsiveness.'
    ],
    fair: [
      ...vitalNarratives['total-blocking-time'].fair,
      'Long tasks clog the main artery; initiate a bundle‑size diet to restore flow.',
      'Input lag may cause user anxiety — break heavy loops and monitor with PerformanceObserver.'
    ],
    poor: [
      ...vitalNarratives['total-blocking-time'].poor,
      'Severe thread choke; interactive life‑support required. Dynamically import heavy libraries.',
      'User taps queue up while JS monopolises the CPU. Cut deadweight scripts or face code‑blue churn.'
    ]
  });
  
  Object.assign(vitalNarratives['cumulative-layout-shift'], {
    excellent: [
      ...vitalNarratives['cumulative-layout-shift'].excellent,
      'No visual tremors detected — UX steadiness rivals a neurosurgeon’s hand.',
      'Content anchors in place; shoppers keep their focus, boosting cart success rates.'
    ],
    good: [
      ...vitalNarratives['cumulative-layout-shift'].good,
      'Occasional wiggles show; reserve ad slots to keep the stretcher steady.',
      'Fonts swap smoothly but late‑loaded banners shuffle things; apply a size‑placeholder brace.'
    ],
    fair: [
      ...vitalNarratives['cumulative-layout-shift'].fair,
      'Noticeable lurches disrupt reading flow; adopt `font‑display: swap` with fallbacks.',
      'Patients grip the rails as elements jump; define media aspect ratios to calm the ride.'
    ],
    poor: [
      ...vitalNarratives['cumulative-layout-shift'].poor,
      'Severe layout spasms trigger mis‑taps. Immediate intervention: eliminate DOM injections post‑load.',
      'CLS haemorrhage — pop‑ups shift content like aftershocks. Stabilise with client‑side scheduling guards.'
    ]
  });
  export function diagnosisFor(
    vital: VitalKey,
    score: number
  ): string {
    const bucket: Bucket =
      score >= 90 ? 'excellent'
      : score >= 75 ? 'good'
      : score >= 50 ? 'fair'
      : 'poor';
  
    return pick(vitalNarratives[vital][bucket]);
  }
       