"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/ServicesSection.module.css";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function ServicesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleCard = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const services = [
    {
      title: "Site Triage",
      summary: "Full site diagnosis & action plan.",
      description: `Receive a comprehensive overview of your site’s health. We evaluate performance, usability, and accessibility to craft a tailored roadmap for improvement.`,
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      summary: "Rapid rescue for urgent site issues.",
      description: `Encounter a sudden glitch or critical error? We respond immediately to restore stability, fix the core issues, and provide actionable insights for future prevention.`,
      button: "Request Emergency Fix",
    },
    {
      title: "Performance & SEO Boost",
      summary: "Optimize speed and elevate search rankings.",
      description: `Accelerate your site’s performance and improve visibility with targeted speed optimizations and SEO enhancements. Watch as your engagement and search rankings climb.`,
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance Package",
      summary: "Protect your site and ensure industry compliance.",
      description: `Secure your online presence with a thorough security audit, threat mitigation, and compliance checks. Stay safe and meet regulatory standards effortlessly.`,
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      summary: "Proactive monthly maintenance & monitoring.",
      description: `Keep your website running smoothly with regular updates, bug fixes, and performance audits. Our dedicated caretaker ensures your site remains secure and optimized all month long.`,
      button: "Start Continuous Care",
    },
    {
      title: "Full Recovery Plan",
      summary: "Complete overhaul for underperforming websites.",
      description: `Transform your outdated site into a modern, fast, and accessible platform. We rebuild your frontend, optimize performance, and enhance user experience for lasting impact.`,
      button: "Begin Recovery",
    },
  ];

  return (
    <>
      <motion.section
        className={styles.services}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0 }}
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
                  <p className={styles.cardDescription}>
                    {service.description}
                  </p>
                  <button
                    className={styles.button}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenIndex(null);
                      setShowForm(true);
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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </>
  );
}
