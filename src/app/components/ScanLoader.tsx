// src/app/components/ScanLoader.tsx
'use client';

import { motion } from 'framer-motion';
import styles from '../styles/ScanLoader.module.css';

export default function ScanLoader() {
  return (
    <motion.div
      className={styles.loader}
      animate={{ rotate: 360 }}
      transition={{ loop: Infinity, ease: 'linear', duration: 1 }}
    >
      <svg width="80" height="80" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="#4fd1c5"
          strokeWidth="5"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}
