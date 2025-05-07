// File: src/app/components/ScreenshotPreview.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/ScanPage.module.css';

interface Props {
  src: string;
  alt?: string;
}

export default function ScreenshotPreview({ src, alt = 'Site screenshot' }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`${styles.glassCard} ${styles.previewBox}`}>
      <div className={styles.previewWrapper}>
        {!loaded && <div className={styles.previewPlaceholder}>Loading preview…</div>}
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          className={`${styles.previewImg} ${loaded ? '' : styles.hidden}`}
          onLoad={() => setLoaded(true)}
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
