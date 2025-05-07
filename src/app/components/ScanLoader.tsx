// src/app/components/ScanLoader.tsx
'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import styles from '../styles/ScanLoader.module.css';

interface ScanLoaderProps {
  /** Set to true when the scan has finished */
  isComplete: boolean;
  /** Optional callback once the loader has fully faded out */
  onFadeOut?: () => void;
  /** The result message or component to show after the scan */
  result?: React.ReactNode;
}

export default function ScanLoader({
  isComplete,
  onFadeOut,
  result,
}: ScanLoaderProps) {
  const loaderControls = useAnimation();
  const resultControls = useAnimation();

  useEffect(() => {
    if (isComplete) {
      // 1) Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.2 },
      });

      // 2) Fade loader out
      loaderControls
        .start({ opacity: 0, transition: { duration: 0.8 } })
        .then(() => onFadeOut?.());

      // 3) Fade result in
      resultControls.start({
        opacity: 1,
        transition: { duration: 0.8, delay: 0.2 },
      });
    }
  }, [isComplete, loaderControls, resultControls, onFadeOut]);

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.loaderContainer}
        animate={loaderControls}
      >
        <motion.div
          className={styles.loader}
          animate={{ rotate: 360 }}
          transition={{ loop: Infinity, ease: 'linear', duration: 1 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4fd1c5" />
                <stop offset="100%" stopColor="#81e6d9" />
                <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="url(#scanGradient)"
              strokeWidth="5"
              fill="none"
              className={styles.gradientCircle}
            />
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.resultMessage}
        initial={{ opacity: 0 }}
        animate={resultControls}
      >
        {result ?? <p>Your scan is complete! Here are the results…</p>}
      </motion.div>
    </div>
  );
}
