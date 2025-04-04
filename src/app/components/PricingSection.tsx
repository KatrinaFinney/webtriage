"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/PricingSection.module.css";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function PricingSection() {
  const [showForm, setShowForm] = useState(false);

  // Each plan now uses descriptionPoints: string[], for bullet points.
  const services = [
    {
      title: "Site Triage",
      amount: 99,
      frequency: "",
      summary: "Full site diagnosis & action plan.",
      descriptionPoints: [
        "Comprehensive performance & UX scan",
        "SEO, mobile, and accessibility checks",
        "Recorded walkthrough + roadmap",
      ],
      button: "Start Triage",
      featured: false,
    },
    {
      title: "Emergency Fix",
      amount: 149,
      frequency: "",
      summary: "Rapid repair for critical website meltdowns.",
      descriptionPoints: [
        "Pinpoint issues fast and fix them swiftly",
        "Restore site stability and calm",
        "Deliver a concise post-fix report",
      ],
      button: "Request a Fix",
      featured: false,
    },
    {
      title: "Continuous Care",
      amount: 499,
      frequency: "/month",
      summary: "Proactive monthly support & monitoring.",
      descriptionPoints: [
        "Ongoing uptime monitoring & bug fixes",
        "Monthly speed & security checks",
        "Your calm, reliable web caretaker",
      ],
      button: "Start Care",
      featured: true,
    },
    {
      title: "Full Recovery Plan",
      amount: 999,
      frequency: "Starting at", // triggers "Starting at $999"
      summary: "Complete makeover for underperforming websites.",
      descriptionPoints: [
        "In-depth site audit & modern rebuild",
        "Improved performance & accessibility",
        "Fresh, engaging user experience",
        "Ideal for older or DIY sites",
      ],
      button: "Start Recovery",
      featured: false,
    },
  ];

  return (
    <>
      <motion.section
        className={styles.pricing}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0 }}
      >
        <div className={styles.firstAidBlock}>
  <h3 className={styles.firstAidTitle}>🩹 Just need a quick checkup?</h3>
  <p className={styles.firstAidText}>
    Try our free <strong>First Aid Scan</strong> and get a rapid review of your site’s homepage health.
  </p>
  <button
    className={styles.button}
    onClick={() => setShowForm(true)}
    style={{ marginBottom: "2rem" }}
  >
    Request First Aid
  </button>
</div>

        <h2 className={styles.title}>Tailored Treatment Options</h2>

        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={`${styles.card} ${service.featured ? styles.featured : ""}`}
            >
              {service.featured && (
                <span className={styles.badge}>Most Popular</span>
              )}

              <h3 className={styles.cardTitle}>{service.title}</h3>

              {/* PRICE DISPLAY LOGIC */}
              <div className={styles.priceContainer}>
                {service.frequency.toLowerCase().includes("start") ? (
                  <>
                    {/* e.g. "Starting at $999" */}
                    <span className={styles.frequency}>{service.frequency}</span>
                    <span className={styles.dollarSign}>$</span>
                    <span className={styles.priceAmount}>{service.amount}</span>
                  </>
                ) : (
                  <>
                    {/* e.g. "$149" or "$499 /month" */}
                    <span className={styles.dollarSign}>$</span>
                    <span className={styles.priceAmount}>{service.amount}</span>
                    <span className={styles.frequency}>{service.frequency}</span>
                  </>
                )}
              </div>

              <p className={styles.cardSummary}>{service.summary}</p>

              <div className={styles.cardBody}>
                {/* Render bullet points via an unordered list */}
                <ul className={styles.bulletList}>
                  {service.descriptionPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <button
                  className={styles.button}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowForm(true);
                  }}
                >
                  {service.button}
                </button>
              </div>
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
