"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function HeroSection() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const openForm = (service: string) => {
    setSelectedService(service);
    setShowForm(true);

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "form_open", {
        event_category: "Hero CTA",
        event_label: service,
      });
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <section
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: "3rem 1rem",
          backgroundColor: "#0a1128",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Halo Background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(90, 141, 238, 0.5), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(100px)",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255, 77, 77, 0.5)",
            boxShadow: "0 0 10px rgba(255, 77, 77, 0.5)",
            fontSize: "0.95rem",
            fontFamily: "Space Grotesk, sans-serif",
            color: "#ff4d4d",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            zIndex: 2,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#ff4d4d",
              animation: "heartbeat 1.3s infinite ease-in-out",
            }}
          />
          webtriage.pro
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: isMobile ? "2.2rem" : "3rem",
            marginBottom: "1rem",
            color: "#fff",
            fontFamily: "Space Grotesk, sans-serif",
            lineHeight: 1.2,
            zIndex: 1,
          }}
        >
          Website Problems?<br />
          Let’s Fix That.
        </h1>

        <p
          style={{
            fontSize: isMobile ? "1.1rem" : "1.4rem",
            color: "#dbeafe",
            fontFamily: "Space Grotesk, sans-serif",
            marginBottom: "2rem",
            zIndex: 1,
          }}
        >
          Fast, precise, worry-free support whenever your website needs it.
        </p>

        {/* CTA */}
        <button
          onClick={() => openForm("Free First Aid Scan")}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            backgroundColor: "#5a8dee",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 600,
            zIndex: 1,
          }}
        >
          Get Free First Aid Scan
        </button>
      </section>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        selectedService={selectedService || undefined}
      />
    </>
  );
}
