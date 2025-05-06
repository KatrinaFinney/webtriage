// File: src/lib/pdf.tsx
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import ReportPdf          from '@/app/components/ReportPdf';
import type { PSIResult } from '@/types/webVitals';

interface PdfParams {
  site:      string;
  result:    PSIResult;
  scannedAt?: string;     // may be undefined
}

export async function generatePdf({
  site,
  result,
  scannedAt,
}: PdfParams) {
  // Guarantee a string for scannedAt
  const scannedAtStr = scannedAt ?? new Date().toLocaleString();

  // Render to a Buffer
  const buffer = await renderToBuffer(
    <ReportPdf site={site} result={result} scannedAt={scannedAtStr} />
  );
  return buffer;
}
