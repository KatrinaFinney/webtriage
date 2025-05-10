'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/ServicesSection.module.css";
import Modal from "./Modal";
import Button from '../components/Button';
import ServiceDetailModal from "./ServiceDetailModal";

export default function ServicesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const toggleCard = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const openDetail = (service: string) => {
    setSelectedService(service);
    setShowDetail(true);
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "detail_open", {
        event_category: "Service Detail",
        event_label: service,
      });
    }
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
      description:
        "Get a comprehensive overview of your website's health. We evaluate performance, usability, and accessibility to deliver a tailored roadmap that pinpoints key areas for improvement.",
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      summary: "Rapid rescue for urgent site issues.",
      description:
        "When a critical error strikes, our emergency team springs into action to restore functionality quickly. We resolve core issues and provide actionable insights to help prevent future problems.",
      button: "Request a Fix",
    },
    {
      title: "Performance & SEO Boost",
      summary: "Optimize speed and elevate search rankings.",
      description:
        "Enhance your website with advanced speed optimizations and targeted SEO strategies. Enjoy faster load times, increased engagement, and improved search visibility that drive qualified traffic.",
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance",
      summary: "Protect your site & meet industry standards.",
      description:
        "Safeguard your online presence with a thorough security audit, proactive threat mitigation, and compliance reviews. Build trust by ensuring your website meets the highest industry standards.",
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      summary: "Proactive monthly maintenance & monitoring.",
      description:
        "Stay ahead of issues with regular updates, continuous monitoring, and proactive maintenance. Our dedicated team ensures your website remains secure, optimized, and ready to support your growth.",
      button: "Start Care Plan",
    },
    {
      title: "Full Recovery Plan",
      summary: "Complete overhaul for underperforming sites.",
      description:
        "Transform your outdated site into a modern, fast, and engaging platform. We rebuild your frontend, enhance performance, and deliver a refreshed user experience that drives lasting success.",
      button: "Plan Recovery",
    },
  ];

  return (
    <>
      <motion.section
        className={styles.servicesSection}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className={styles.inner}>
          <h2 className={styles.title}>Choose Your Care Option</h2>
          <p className={styles.intro}>
            Click on any card to read more, then tap “Start” to open our secure intake form.
          </p>

          <div className={styles.grid}>
            {services.map((svc, idx) => (
              <motion.div
                key={svc.title}
                className={`${styles.card} ${
                  openIndex === idx ? styles.expanded : ""
                }`}
                onClick={() => toggleCard(idx)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className={styles.cardTitle}>{svc.title}</h3>
                <p className={styles.cardSummary}>{svc.summary}</p>

                {openIndex === idx ? (
                  <div className={styles.cardBody}>
                    <p className={styles.cardDescription}>{svc.description}</p>
                    <Button
                      className={styles.button}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("ServicesSection → openDetail:", svc.title);
                        openDetail(svc.title);
                      }}
                    >
                      {svc.button}
                    </Button>
                  </div>
                ) : (
                  <div className={styles.expandHint}>↓ Tap to learn more</div>
                )}
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
