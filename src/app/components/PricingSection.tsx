'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/PricingSection.module.css";
import Modal from "./Modal";                   // your existing intake modal
import Button from '../components/Button';
import ServiceDetailModal from "./ServiceDetailModal";
  
export default function PricingSection() {
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const openDetail = (service: string) => {
    setSelectedService(service);
    setShowDetail(true);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "detail_open", {
        event_category: "Pricing Detail",
        event_label: service,
      });
    }
  };

  const openForm = (service: string) => {
    setSelectedService(service);
    setShowForm(true);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "form_open", {
        event_category: "Pricing CTA",
        event_label: service,
      });
    }
  };

  const services = [
    {
      title: "Site Triage",
      price: "$99",
      summary: "Complete website health check & customized improvement plan.",
      features: [
        "A detailed performance report showing how fast your site is and how to improve it",
        "An accessibility review to ensure your site is usable by everyone, including those with disabilities",
        "A mobile-friendliness test to make sure your site works perfectly on phones and tablets",
        "A clear, easy-to-follow improvement plan delivered within 24 hours"
      ],
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      price: "$149",
      summary: "Rapid recovery for critical website issues.",
      features: [
        "Get critical website issues fixed in under 4 hours",
        "Guaranteed 99.9% uptime to keep your site live and working",
        "A summary of what caused the problem and how to avoid it in the future",
        "A list of actions to prevent future issues and improve stability"
      ],
      button: "Request a Fix",
    },
    {
      title: "Performance & SEO Boost",
      price: "$199",
      summary: "Speed up your site and improve search engine rankings.",
      features: [
        "Improve site load times by up to 40% for a better user experience and faster performance",
        "A keyword analysis to help you rank higher in search engines and attract more visitors",
        "Optimization for better search engine visibility, including adjustments to meta tags and schema",
        "A strategy to increase user engagement based on how visitors interact with your site"
      ],
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance Package",
      price: "$299",
      summary: "Protect your site and ensure it meets legal requirements.",
      features: [
        "A full scan to detect and remove security threats and vulnerabilities",
        "A firewall setup to block 99% of common attacks, keeping your site safe",
        "GDPR and privacy policy setup to comply with legal requirements on cookies and data protection",
        "A compliance certificate showing your site meets accessibility and data protection laws"
      ],
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      price: "$499 / mo",
      summary: "Ongoing monitoring and support to keep your site running smoothly.",
      features: [
        "Real-time monitoring of your site’s performance and uptime, with alerts for any issues",
        "A monthly report covering performance, SEO, and security updates",
        "Priority support with a guarantee of same-day responses to urgent issues",
        "Quarterly advice on how to improve your site and grow your online presence"
      ],
      button: "Start Care",
    },
    {
      title: "Full Recovery Plan",
      price: "From $999",
      summary: "Complete website overhaul with a fresh design and strategy.",
      features: [
        "A full website rebuild with a performance score of 95+ for faster loading times",
        "Accessibility improvements to ensure your site complies with the latest standards",
        "Dedicated project manager to handle everything and ensure quality testing",
        "A 6-month growth plan with goals and milestones to track your progress"
      ],
      button: "Plan Recovery",
    },
  ];
  

  return (
    <>
      <motion.section
        className={styles.pricingSection}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className={styles.inner}>
          <h2 className={styles.title}>Choose A Care Option</h2>
          <p className={styles.intro}>
            Choose the level of care that fits your needs—from a quick triage
            to a full recovery plan.
          </p>

          <div className={styles.grid}>
            {services.map((service) => (
              <motion.div
                key={service.title}
                className={styles.card}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardPrice}>{service.price}</p>
                <p className={styles.cardSummary}>{service.summary}</p>
                <ul className={styles.features}>
                  {service.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
                <Button
                  className={styles.button}
                  onClick={() => openDetail(service.title)}
                >
                  {service.button}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Detail-first modal */}
      <ServiceDetailModal
        isOpen={showDetail}
        serviceKey={selectedService}
        onClose={() => setShowDetail(false)}
        onStartIntake={(svc) => {
          setShowDetail(false);
          openForm(svc);
        }}
      />

      {/* Then the existing intake form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedService={selectedService || undefined}
      />
    </>
  );
}
