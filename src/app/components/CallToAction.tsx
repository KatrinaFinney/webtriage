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
        {/* REVERTED / RESTORED COPY: reassuring and on brand */}
        <h2 className={styles.heading}>Let’s Fix Your Website</h2>
        <p className={styles.subtext}>
          Whether it’s an emergency or a long overdue upgrade, we’re here to help. Get in touch and let’s stabilize your site together.
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
