// src/lib/serviceDetails.ts

export interface ServiceDetail {
  title: string;
  price: string;
  tagline: string;
  description: string;
  features: string[];
  deliverables: string[];
  benefits: string[];
  ctaLabel: string;
}

export const serviceDetails: Record<string, ServiceDetail> = {
  "Site Triage": {
    title: "Site Triage",
    price: "$99",
    tagline: "Full site diagnosis & action plan",
    description:
      "Is your site underperforming? We run a suite of automated health checks—performance, SEO, accessibility—then package everything into clear, actionable insights so you know exactly where to focus.",
    features: [
      "✅ Automated performance, SEO & usability scan",
      "✅ Accessibility & mobile device check",
      "✅ Loom walkthrough & strategic roadmap",
    ],
    deliverables: [
      "🖥️ Automated audit report (PDF) with raw metrics",
      "🎥 Loom video summary highlighting top 3 issues",
      "📋 Prioritized checklist emailed to you",
      "🔗 Link to live dashboard for ongoing visibility",
    ],
    benefits: [
      "🔍 Clarity on exactly what’s holding your site back",
      "⏱️ Saves you hours of manual analysis",
      "🎯 Laser-focused roadmap so every fix moves the needle",
    ],
    ctaLabel: "Start Triage",
  },

  "Emergency Fix": {
    title: "Emergency Fix",
    price: "$149",
    tagline: "Rapid rescue for urgent issues",
    description:
      "When something breaks, you can’t wait. Our automation pipeline flags critical errors and triggers our repair workflow—then we bundle the fix details and next-step tips in a single Loom.",
    features: [
      "⚡ Automated error detection & logging",
      "⚡ Targeted fix of core functionality",
      "⚡ Loom recap with prevention tips",
    ],
    deliverables: [
      "📈 Error log export (CSV/JSON) for your records",
      "🔧 Automated patch applied to your repo (via PR)",
      "🎥 Loom video overview of what was fixed",
      "📝 GitHub-style change summary",
    ],
    benefits: [
      "🛠️ Restores functionality without guesswork",
      "📉 Minimizes downtime and lost revenue",
      "🛡️ Built-in prevention tips to avoid repeats",
    ],
    ctaLabel: "Request a Fix",
  },

  "Performance & SEO Boost": {
    title: "Performance & SEO Boost",
    price: "$199",
    tagline: "Turbocharge speed & rankings",
    description:
      "We apply proven automation recipes—caching configs, image optimizations, meta-tag tuning—then hand off everything you need to keep your site fast and findable.",
    features: [
      "🚀 Automated caching & code-level tuning",
      "🚀 On-page SEO metadata enhancements",
      "🚀 Engagement & ranking uplift insights",
    ],
    deliverables: [
      "📊 Speed test report (Lighthouse export)",
      "⚙️ Pre-configured caching & minification settings",
      "🔍 SEO audit PDF with before-and-after comparison",
      "🎥 Loom walkthrough of changes and impact",
    ],
    benefits: [
      "⏩ Faster user experience = higher conversions",
      "🌐 Better search visibility = more organic traffic",
      "📈 Data-backed tweaks you can reapply anytime",
    ],
    ctaLabel: "Boost Performance",
  },

  "Security & Compliance Package": {
    title: "Security & Compliance Package",
    price: "$299",
    tagline: "Lockdown your site & meet standards",
    description:
      "Our automated security scans catch vulnerabilities, then we deliver hardened configs and a plain-language compliance checklist so you can rest easy.",
    features: [
      "🔒 Automated vulnerability & malware scan",
      "🔒 Firewall & threat-prevention rules",
      "🔒 ADA, GDPR & PCI compliance overview",
    ],
    deliverables: [
      "🔍 Security scan report (PDF/JSON)",
      "🛡️ Pre-built firewall rule set",
      "📋 Compliance checklist with pass/fail flags",
      "🎥 Loom summary of your site’s security posture",
    ],
    benefits: [
      "🛡️ Lower breach risk = peace of mind",
      "✅ Clear path to regulatory compliance",
      "🤝 Builds visitor trust with documented standards",
    ],
    ctaLabel: "Secure My Site",
  },

  "Continuous Care": {
    title: "Continuous Care",
    price: "$499/mo",
    tagline: "Proactive monthly maintenance",
    description:
      "Let us handle the routine. Automated monitoring, monthly health reports, and on-demand Loom summaries keep your site in peak shape—no phone calls or high-pressure SLA hoops.",
    features: [
      "📈 24/7 uptime & error monitoring",
      "📈 Automated monthly performance & SEO reports",
      "📈 Priority Loom updates & support queue access",
    ],
    deliverables: [
      "📅 Monthly health report (PDF) delivered to inbox",
      "⚠️ Automated alert emails for critical issues",
      "🎥 Loom overview of that month’s changes",
      "🔗 Live status dashboard with real-time data",
    ],
    benefits: [
      "🕹️ Truly hands-off site maintenance",
      "🚀 Continuous optimization, no catch-up required",
      "💡 Instant visibility into any emerging issues",
    ],
    ctaLabel: "Start Care Plan",
  },

  "Full Recovery Plan": {
    title: "Full Recovery Plan",
    price: "From $999",
    tagline: "Complete site overhaul & roadmap",
    description:
      "We automate initial scaffolding, then rebuild your frontend with modern UX/UI. You get a turnkey GitHub repo, design mockups, and a strategic growth plan—no heavy project-management overhead.",
    features: [
      "🔄 Automated code scaffolding & setup",
      "🔄 UX/UI redesign mockups",
      "🔄 Performance & accessibility enforcement",
    ],
    deliverables: [
      "🔧 GitHub repository with working code & tests",
      "🎨 Figma link with new design comps",
      "📋 Growth roadmap spreadsheet",
      "🎥 Loom walkthrough of the new site & roadmap",
    ],
    benefits: [
      "🚀 Modern, scalable codebase ready for growth",
      "🎨 Fresh UX that delights and converts",
      "🗺️ Clear roadmap so you always know the next step",
    ],
    ctaLabel: "Plan Recovery",
  },
};
