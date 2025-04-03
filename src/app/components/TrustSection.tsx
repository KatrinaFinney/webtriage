"use client";

import styles from "../styles/TrustSection.module.css";

export default function TrustSection() {
  return (
    <section className={styles.trust} style={{ position: "relative", overflow: "hidden" }}>
      {/* 🔵 Floating Halo Background */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(90,141,238,0.5), transparent 70%)",
          borderRadius: "50%",
          filter: "blur(9rgba(90,141,238,0.5)0px)",
          transform: "translate(-50%, -50%)",
          animation: "floatHalo 14s ease-in-out infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div className={styles.container} style={{ position: "relative", zIndex: 1 }}>
        <h2 className={styles.title}>You’re In Good Hands</h2>
        <p className={styles.description}>
          WebTriage.pro delivers steady, expert support for sites in distress.
          From broken pages to full rebuilds, our team works quickly and precisely
          to get you back online — and keep you there.
          We’ve helped dozens of websites recover from downtime, bugs, and performance issues.
        </p>
      </div>
    </section>
  );
}
