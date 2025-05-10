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
      price: "$99",
      summary: "Comprehensive site health audit & strategic roadmap.",
      features: [
        "Lighthouse performance report (0–100 score breakdown)",
        "WCAG AA accessibility review with top-5 fix list",
        "Mobile responsiveness assessment",
        "Interactive PDF roadmap delivered within 24 hours",
      ],
      button: "Start Triage",
    },
    {
      title: "Emergency Fix",
      price: "$149",
      summary: "Rapid rescue & restore for critical site failures.",
      features: [
        "Critical error resolution in under 4 hours",
        "99.9% uptime recovery guarantee",
        "Root-cause analysis summary",
        "Prevention checklist to block repeat issues",
      ],
      button: "Request a Fix",
    },
    {
      title: "Performance & SEO Boost",
      price: "$199",
      summary: "Accelerate load times & climb search rankings.",
      features: [
        "Boost load speed by up to 40% (Lighthouse score ≥ 90)",
        "Targeted keyword audit with traffic impact forecast",
        "Meta & schema optimizations for richer snippets",
        "Engagement uplift plan based on user data",
      ],
      button: "Boost Performance",
    },
    {
      title: "Security & Compliance Package",
      price: "$299",
      summary: "Fortify your site & prove regulatory compliance.",
      features: [
        "Full vulnerability scan & threat removal",
        "Firewall rules applied to stop 99% of common attacks",
        "GDPR cookie & privacy policy setup",
        "Compliance certificate for ADA, GDPR, CCPA",
      ],
      button: "Secure My Site",
    },
    {
      title: "Continuous Care",
      price: "$499 / mo",
      summary: "Ongoing monitoring, reports & priority support.",
      features: [
        "Real-time uptime & performance monitoring",
        "Monthly scorecard (performance, SEO & security)",
        "Same-day response SLA for urgent issues",
        "Quarterly growth recommendations",
      ],
      button: "Start Care",
    },
    {
      title: "Full Recovery Plan",
      price: "From $999",
      summary: "Total site overhaul with UX/UI & strategy reset.",
      features: [
        "Modern rebuild with performance score ≥ 95",
        "WCAG AA accessibility compliance",
        "Dedicated project manager & user testing",
        "6-month growth roadmap with milestone tracking",
      ],
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
                    <p className={styles.cardDescription}></p>
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
