"use client";

import { motion } from "framer-motion";

interface FadeSectionProps {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
}

export default function FadeSection({
  children,
  delay = 0.15,
  yOffset = 60,
}: FadeSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.section>
  );
}
