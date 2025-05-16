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
    tagline: "Full site diagnosis & strategic roadmap",
    description:
      "Worried your site isn’t performing its best? We run in-depth health checks—covering speed, SEO, accessibility and security—and deliver everything in an easy-to-follow plan so you know exactly what to tackle first.",
    features: [
      "In-depth performance, SEO & usability scan",
      "Accessibility & mobile responsiveness review",
      "Recorded Loom walkthrough of the key findings",
    ],
    deliverables: [
      "Comprehensive audit report (PDF) with detailed metrics",
      "Prioritized action checklist sent straight to your inbox",
      "Loom video summary highlighting the top three focus areas",
      "Link to a live dashboard for ongoing site visibility",
    ],
    benefits: [
      "Clear insight into what’s holding your site back",
      "Saves you hours of manual testing and analysis",
      "A targeted roadmap so every change moves the needle",
    ],
    ctaLabel: "Start Triage",
  },

  "Emergency Fix": {
    title: "Emergency Fix",
    price: "$149",
    tagline: "Swift repair for critical site failures",
    description:
      "When your site breaks, you need a fast recovery. Our monitoring system spots critical errors immediately, kicks off our repair process, and packages the fix details into a clear report.",
    features: [
      "Continuous error detection & logging",
      "Targeted patch to restore core functionality",
      "Loom recap with prevention tips",
    ],
    deliverables: [
      "Complete error log export for your records",
      "Patch applied directly to your repository",
      "Automated test report showing success/failure",
      "Concise change summary with next-step recommendations",
    ],
    benefits: [
      "Immediate recovery with minimal downtime",
      "Reduced risk of lost revenue from outages",
      "Built-in safeguards to prevent repeat failures",
    ],
    ctaLabel: "Request a Fix",
  },

  "Performance & SEO Boost": {
    title: "Performance & SEO Boost",
    price: "$199",
    tagline: "Speed tuning and search ranking lift",
    description:
      "Boost your site’s speed and improve its Google rankings with our proven optimization process—then hand you all the settings and insights to keep the momentum going.",
    features: [
      "Advanced caching and asset optimization",
      "On-page SEO metadata enhancements",
      "Engagement and ranking uplift analysis",
    ],
    deliverables: [
      "Side-by-side performance report (before & after)",
      "Pre-configured caching and build scripts",
      "SEO update pull request for titles, descriptions, and schema",
      "Loom walkthrough explaining changes and impact",
    ],
    benefits: [
      "Faster load times for happier visitors",
      "Better search visibility leading to more organic traffic",
      "Actionable data you can apply as your site grows",
    ],
    ctaLabel: "Boost Performance",
  },

  "Security & Compliance Package": {
    title: "Security & Compliance Package",
    price: "$299",
    tagline: "Fortify your site and meet key standards",
    description:
      "Sleep easy knowing your site is protected and compliant. We run thorough security scans, lock down vulnerabilities, and provide a straightforward checklist for any regulatory requirements.",
    features: [
      "Vulnerability and malware scanning",
      "Firewall and threat-prevention rule setup",
      "GDPR, ADA & CCPA compliance review",
    ],
    deliverables: [
      "Detailed security scan report (PDF/JSON)",
      "Pre-built firewall configuration files",
      "Compliance health checklist with pass/fail flags",
      "Loom summary of your site’s security posture",
    ],
    benefits: [
      "Lower breach risk for true peace of mind",
      "Documentation to satisfy regulatory audits",
      "Stronger visitor trust through proven safeguards",
    ],
    ctaLabel: "Secure My Site",
  },

  "Continuous Care": {
    title: "Continuous Care",
    price: "$499/mo",
    tagline: "Ongoing site health, reports & priority support",
    description:
      "Let us handle the routine maintenance. With 24/7 monitoring, monthly health reports, and priority updates, your site stays in top shape without you lifting a finger.",
    features: [
      "24/7 uptime, performance & security monitoring",
      "Monthly health report covering key metrics",
      "Priority support with fast response times",
    ],
    deliverables: [
      "Monthly health-check report delivered as a PDF",
      "Instant alert emails if any critical issue arises",
      "Live status dashboard link to share with your team",
      "Monthly Loom overview of changes and recommendations",
    ],
    benefits: [
      "Peace of mind with truly proactive maintenance",
      "Continuous improvements with no catch-up required",
      "Instant visibility into any emerging problems",
    ],
    ctaLabel: "Start Care Plan",
  },

  "Full Recovery Plan": {
    title: "Full Recovery Plan",
    price: "From $999",
    tagline: "Complete site rebuild & growth roadmap",
    description:
      "Whether you’re on WordPress, Wix, Shopify, or custom code, we give your site a fresh start—modern code, updated design, and a clear, data-driven plan for the months ahead.",
    features: [
      "Complete theme or template refresh for any platform",
      "Plugin and integration configuration",
      "Performance and accessibility validation",
    ],
    deliverables: [
      "Turnkey code package with working tests",
      "Platform-specific configuration files",
      "Growth roadmap spreadsheet with prioritized tasks",
      "Loom walkthrough of your new site and next steps",
    ],
    benefits: [
      "Launch-ready site without the platform headaches",
      "Built-in quality checks for performance and compliance",
      "Clear roadmap so you always know your next move",
    ],
    ctaLabel: "Plan Recovery",
  },
};
