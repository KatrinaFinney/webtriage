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
      title: "Continuous Care",
      summary: "Proactive monthly maintenance & monitoring.",
      description: `Keep your site smooth and reliable with ongoing bug fixes, speed optimization, plugin updates, and monthly audits. 
Stay ahead of potential issues with uptime monitoring and a calm, professional caretaker always on call.`,
      button: "Start Continuous Care",
    },
    {
      title: "Emergency Fix",
      summary: "One-time rescue for urgent site issues.",
      description: `Broken layout? Checkout glitch? 
We'll jump in fast, fix what's critical, and restore stability. 
Afterward, you'll get a straightforward breakdown of what happened—and how to prevent it from recurring.`,
      button: "Request Emergency Fix",
    },
    {
      title: "Full Recovery Plan",
      summary: "Complete overhaul for underperforming websites.",
      description: `Take your site from sluggish and outdated to fast, accessible, and polished. 
We'll audit your current setup, rebuild your frontend for clarity, ensure mobile responsiveness, and modernize your user experience.
Perfect for older or DIY-built sites that need a fresh start.`,
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
        <h2 className={styles.title}>Choose Your Care Plan</h2>
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
                      setShowForm(true);
                    }}
                  >
                    {service.button}
                  </button>
                </div>
              ) : (
                // A clearer hint that the card is clickable
                <span className={styles.expandHint}>
                  Tap or Click to View Details ↓
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
