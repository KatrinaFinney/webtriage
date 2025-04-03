"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type VantaEffectInstance = { destroy: () => void };
type VantaGlobal = {
  GLOBE?: (opts: object) => VantaEffectInstance;
};

interface VantaBackgroundProps {
  children: React.ReactNode;
  color?: number;
  backgroundColor?: number;
  points?: number;
  size?: number;
  scale?: number;
  scaleMobile?: number;
}

export default function VantaBackground({
  children,
  color = 0x4e8fff,
  backgroundColor = 0x0a1128,
  points = 12.0,
  size = 1.2,
  scale = 1.0,
  scaleMobile = 1.0,
}: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    if (vantaEffect || !vantaRef.current) return;

    if (!scriptRef.current) {
      scriptRef.current = document.createElement("script");
      scriptRef.current.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js";
      scriptRef.current.async = true;
      scriptRef.current.defer = true;

      scriptRef.current.onload = () => {
        const w = window as unknown as { VANTA?: VantaGlobal };
        if (w.VANTA?.GLOBE && vantaRef.current) {
          const effect = w.VANTA.GLOBE({
            el: vantaRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale,
            scaleMobile,
            color,
            backgroundColor,
            size,
            points,
          });
          setVantaEffect(effect);
        }
      };

      document.body.appendChild(scriptRef.current);
    }
  }, [vantaEffect, color, backgroundColor, points, size, scale, scaleMobile]);

  useEffect(() => {
    return () => {
      vantaEffect?.destroy();
      scriptRef.current?.remove();
    };
  }, [vantaEffect]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh", // ✅ Ensures content grows beyond viewport
        overflow: "hidden",
      }}
    >
      <div
  ref={vantaRef}
  style={{
    position: "absolute",
    top: "0", // no need to lift anymore
    left: "50%", // center horizontally
    transform: "translate(-50%, -15%)", // center X, nudge upward
    width: "100vw",
    height: "100vh",
    zIndex: 0,
    pointerEvents: "none",
    backgroundColor: `#${backgroundColor.toString(16).padStart(6, "0")}`,
  }}
/>



      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
