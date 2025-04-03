"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useScroll, useTransform, motion } from "framer-motion";

type VantaEffectInstance = {
  destroy: () => void;
};

type VantaGlobal = {
  GLOBE?: (opts: object) => VantaEffectInstance;
};

interface VantaBackgroundParallaxProps {
  children: React.ReactNode;
  color?: number;
  backgroundColor?: number;
  points?: number;
  size?: number;
  scale?: number;
  scaleMobile?: number;
}

export default function VantaBackgroundParallax({
  children,
  color = 0x4e8fff,
  backgroundColor = 0x0a1128,
  points = 12.0,
  size = 1.2,
  scale = 1.0,
  scaleMobile = 1.0,
}: VantaBackgroundParallaxProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  const wrapperRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapperRef });
  const scaleEffect = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

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
    <motion.div
      ref={wrapperRef}
      style={{
        width: "100%",
        minHeight: "100dvh",
        margin: "0",
        padding: "0",
        position: "relative",
        overflow: "hidden",         // ✅ Ensures globe doesn't bleed
        zIndex: 0,
        scale: scaleEffect,
      }}
    >
      <div
        ref={vantaRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",       // ✅ Ensures globe stays contained
          zIndex: 0,
          backgroundColor: `#${backgroundColor.toString(16).padStart(6, "0")}`,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "6rem",       // ✅ Adjust content spacing here only
          paddingBottom: "4rem",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
