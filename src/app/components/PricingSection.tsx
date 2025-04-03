"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/PricingSection.module.css";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function PricingSection() {
  const [showForm, setShowForm] = useState(false);

  const services = [
    {
      title: "Emergency Fix",
      price: "$149",
      summary: "Urgent repair for critical site issues.",
      description: `Broken layout? Checkout down? Styles gone rogue? We rapidly triage the issue, fix what’s urgent, and restore stability.

You’ll receive a diagnosis, a breakdown of what happened, and recommendations for further care. This is digital CPR for your website — fast and focused.`,
      button: "Request a Fix",
      featured: false,
    },
    {
      title: "Continuous Care",
      price: "$499/month",
      summary: "Ongoing proactive support & monitoring.",
      description: `This monthly plan is for business owners, creatives, and founders who can’t afford site issues. It includes ongoing uptime monitoring, bug fixes, plugin updates, speed optimization, mobile responsiveness checks, and monthly audits.

It’s like having a calm, professional web medic always on call. Ideal for sites that need consistency — not chaos.`,
      button: "Start Care",
      featured: true,
    },
    {
      title: "Full Recovery Plan",
      price: "Starting at $999",
      summary: "A complete rebuild for underperforming websites.",
      description: `If your site feels outdated, slow, or clunky, this is a full-scale transformation. We’ll audit your current setup, rebuild your frontend for speed and clarity, apply accessibility best practices, and streamline the experience for your users.

This is ideal for older or DIY-built websites that now need professional care to thrive.`,
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
        <h2 className={styles.title}>Tailored Treatment Options</h2>
        <div className={styles.grid}>
          {services.map((service, index) => (
            <div
              key={index}
              className={`${styles.card} ${service.featured ? styles.featured : ""}`}
            >
              {service.featured && <span className={styles.badge}>Most Popular</span>}

              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.price}>{service.price}</p>
              <p className={styles.cardSummary}>{service.summary}</p>
              <div className={styles.cardBody}>
                <p className={styles.cardDescription}>{service.description}</p>
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
