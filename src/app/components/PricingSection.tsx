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
      summary: "Full site diagnosis & action plan.",
      features: [
        "Performance, SEO & usability scan",
        "Accessibility + mobile check",
        "Recorded walkthrough + roadmap",
      ],
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      price: "$149",
      summary: "Rapid rescue for urgent site issues.",
      features: [
        "Pinpoint & fix critical errors fast",
        "Stabilize broken functionality",
        "Post-fix insight & prevention tips",
      ],
      button: "Request a Fix",
    },
    {
      title: "Performance & SEO Boost",
      price: "$199",
      summary: "Speed optimization & search visibility.",
      features: [
        "Advanced speed tuning",
        "SEO enhancements",
        "Better rankings + user engagement",
      ],
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance Package",
      price: "$299",
      summary: "Protect your site & meet standards.",
      features: [
        "Security audit & threat removal",
        "Firewall + malware prevention",
        "Compliance (ADA, GDPR, etc.)",
      ],
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      price: "$499/mo",
      summary: "Proactive monthly maintenance & optimization.",
      features: [
        "24/7 uptime monitoring & emergency fixes",
        "Detailed monthly performance & SEO reports",
        "Priority support with same-day response",
      ],
      button: "Start Care",
    },
    {
      title: "Full Recovery Plan",
      price: "From $999",
      summary: "Complete site overhaul, redesign & strategic roadmap.",
      features: [
        "Full rebuild with UX/UI modernization",
        "Performance tuning & accessibility compliance",
        "Dedicated project manager & user testing",
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
