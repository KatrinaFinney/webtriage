"use client";

import { motion } from "framer-motion";
import styles from "../styles/SectionDivider.module.css";

export default function SectionDivider() {
  return (
    <motion.div
      className={styles.divider}
      initial={{ opacity: 0, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true }}
    />
  );
}
