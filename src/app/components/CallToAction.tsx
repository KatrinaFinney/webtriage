"use client";

import styles from "../styles/CallToAction.module.css";
import { useState } from "react";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function CallToAction() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleClick = () => {
    setSelectedService("Site Triage");
    setShowForm(true);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Breathe New Life into Your Website
        </h2>
        <p className={styles.subtext}>
          Whether you&apos;re facing a sudden outage or need a long-overdue upgrade, we&apos;ve got you covered. Let&rsquo;s work together to restore and enhance your site&mdash;so you can get back to what matters most.
        </p>
        <button className={styles.button} onClick={handleClick}>
          Stabilize My Site
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm
          selectedService={selectedService || undefined}
          onSuccess={() => setShowForm(false)}
        />
      </Modal>
    </section>
  );
}
