"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type VantaEffectInstance = {
  destroy: () => void;
};

type VantaGlobal = {
  GLOBE?: (opts: object) => VantaEffectInstance;
};

interface VantaBackgroundProps {
  children: React.ReactNode;
}

export default function VantaBackground({ children }: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffectInstance | null>(null);

  useEffect(() => {
    // If the effect is already set, do nothing
    if (vantaEffect) return;

    // If there's no container to attach to, do nothing
    if (!vantaRef.current) return;

    // Create & append the script if it hasn't been created yet
    if (!scriptRef.current) {
      scriptRef.current = document.createElement("script");
      scriptRef.current.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js";
      scriptRef.current.async = true;
      scriptRef.current.defer = true;

      scriptRef.current.onload = () => {
        // Once script loads, initialize Vanta
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
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x4e8fff,
            backgroundColor: 0x0a1128,
            size: 1.2,
            points: 12.0,
          });
          setVantaEffect(effect);
        }
      };

      document.body.appendChild(scriptRef.current);
    }
  }, [vantaEffect]);

  // Cleanup effect + script on unmount
  useEffect(() => {
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        width: "100vw",
        minHeight: "100vh",
       // position: "relative",
        overflow: "hidden",
        zIndex: 0,
        backgroundColor: "#0a1128", // fallback color if Vanta is skipped
      }}
    >
      {children}
    </div>
  );
}
