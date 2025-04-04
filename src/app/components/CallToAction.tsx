"use client";
import styles from "../styles/CallToAction.module.css";
import { useState } from "react";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function CallToAction() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.heading}>
          Breathe New Life into Your Website
        </h2>
        <p className={styles.subtext}>
          Whether you're facing a sudden outage or need a long-overdue upgrade, we've got you covered. Let’s work together to restore and enhance your site—so you can get back to what matters most.
        </p>
        <button className={styles.button} onClick={() => setShowForm(true)}>
          Stabilize My Site
        </button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </section>
  );
}
