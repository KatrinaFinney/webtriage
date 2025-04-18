"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/ServicesSection.module.css";
import Modal from "./Modal";

export default function ServicesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const toggleCard = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const openForm = (service: string) => {
    setSelectedService(service);
    setShowForm(true);

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "form_open", {
        event_category: "Service CTA",
        event_label: service,
      });
    }
  };

  const services = [
    {
      title: "Site Triage",
      summary: "Full site diagnosis & action plan.",
      description: `Get a comprehensive overview of your website's health. We evaluate performance, usability, and accessibility to deliver a tailored roadmap that pinpoints key areas for improvement.`,
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      summary: "Rapid rescue for urgent site issues.",
      description: `When a critical error strikes, our emergency team springs into action to restore functionality quickly. We resolve core issues and provide actionable insights to help prevent future problems.`,
      button: "Request a Fix",
    },
    {
      title: "Performance & SEO Boost",
      summary: "Optimize speed and elevate search rankings.",
      description: `Enhance your website with advanced speed optimizations and targeted SEO strategies. Enjoy faster load times, increased engagement, and improved search visibility that drive qualified traffic.`,
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance Package",
      summary: "Protect your site and ensure industry compliance.",
      description: `Safeguard your online presence with a thorough security audit, proactive threat mitigation, and compliance reviews. Build trust by ensuring your website meets the highest industry standards.`,
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      summary: "Proactive monthly maintenance & monitoring.",
      description: `Stay ahead of issues with regular updates, continuous monitoring, and proactive maintenance. Our dedicated team ensures your website remains secure, optimized, and ready to support your growth.`,
      button: "Start Care Plan",
    },
    {
      title: "Full Recovery Plan",
      summary: "Complete overhaul for underperforming websites.",
      description: `Transform your outdated site into a modern, fast, and engaging platform. We rebuild your frontend, enhance performance, and deliver a refreshed user experience that drives lasting success.`,
      button: "Start Recovery",
    },
  ];

  return (
    <>
      <motion.section
        className={styles.services}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className={styles.title}>Choose Your Care Option</h2>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => toggleCard(index)}
            >
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardSummary}>{service.summary}</p>

              {openIndex === index ? (
                <div className={styles.cardBody}>
                  <p className={styles.cardDescription}>{service.description}</p>
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenIndex(null);
                      openForm(service.title);
                    }}
                  >
                    {service.button}
                  </button>
                </div>
              ) : (
                <span className={styles.expandHint}>
                  Tap or Click for Details ↓
                </span>
              )}
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
