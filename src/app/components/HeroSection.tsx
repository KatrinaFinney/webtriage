"use client";

import { useState } from "react";
import Modal from "./Modal";
import IntakeForm from "./IntakeForm";

export default function HeroSection() {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const openForm = (service: string) => {
    setSelectedService(service);
    setShowForm(true);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "1rem",
          textAlign: "center",
          backgroundColor: "#0a1128",
          zIndex: 1,
        }}
      >
        {/* 🔵 Floating Halo Background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(90, 141, 238, 0.5), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(100px)",
            transform: "translate(-50%, -50%)",
            animation: "floatHalo 14s ease-in-out infinite",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* 🔥 Badge */}
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
            animation: "pulseBadge 2.5s ease-in-out infinite, fadeIn 1s ease-out forwards",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            zIndex: 2,
            opacity: 0,
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
          ></span>
          webtriage.pro
        </div>

        {/* 🌌 Hero Content */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "1rem",
            padding: "2rem",
            maxWidth: "90vw",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "3.25rem",
              marginBottom: "1rem",
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: "1.2",
              color: "#ffffff",
            }}
          >
            <span>Website Problems?</span>
            <br />
            <span>Let’s Fix That.</span>
          </h1>

          <p
            style={{
              fontSize: "1.4rem",
              marginBottom: "1rem",
              fontFamily: "Space Grotesk, sans-serif",
              color: "#dbeafe",
            }}
          >
            Fast, precise, and worry-free support whenever your website needs it.
          </p>

          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
              fontFamily: "Space Grotesk, sans-serif",
              color: "#94a3b8",
            }}
          >
            Just need a quick checkup? Try a{" "}
            <span
              onClick={() => openForm("First Aid")}
              style={{
                color: "#5a8dee",
                fontWeight: 500,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              First Aid
            </span>{" "}
            scan at no cost.
          </p>

          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "2rem",
              fontFamily: "Space Grotesk, sans-serif",
              color: "#94a3b8",
            }}
          >
            Not sure what you need? Start with a full{" "}
            <span
              onClick={() => openForm("Site Triage")}
              style={{
                color: "#5a8dee",
                fontWeight: 500,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Site Triage
            </span>{" "}
            for just $99.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => openForm("Site Triage")}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "#5a8dee",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
                animation: "pulseButton 2.5s ease-in-out infinite",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 500,
              }}
            >
              Start Site Triage
            </button>

            <button
              onClick={() => openForm("First Aid")}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                backgroundColor: "transparent",
                border: "1px solid #5a8dee",
                color: "#5a8dee",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 500,
              }}
            >
              Get First Aid
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <IntakeForm selectedService={selectedService || undefined} />
      </Modal>
    </>
  );
}
