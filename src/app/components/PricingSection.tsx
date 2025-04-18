"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/PricingSection.module.css";
import Modal from "./Modal";

export default function PricingSection() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

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
      summary: "Proactive monthly maintenance.",
      features: [
        "Uptime monitoring + bug fixes",
        "Monthly performance reports",
        "Peace of mind = priceless",
      ],
      button: "Start Care",
    },
    {
      title: "Full Recovery Plan",
      price: "Starting at $999",
      summary: "Complete redesign & modernization.",
      features: [
        "Site rebuild + UX overhaul",
        "Performance + accessibility boost",
        "Fresh, engaging user experience",
      ],
      button: "Start Recovery",
    },
  ];

  return (
    <>
      <motion.section
        className={styles.pricing}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className={styles.title}>Tailored Treatment Options</h2>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div className={styles.card} key={index}>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardPrice}>{service.price}</p>
              <p className={styles.cardSummary}>{service.summary}</p>
              <ul className={styles.cardFeatures}>
                {service.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <button
                className={styles.button}
                onClick={() => openForm(service.title)}
              >
                {service.button}
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedService={selectedService || undefined}
      />
    </>
  );
}
