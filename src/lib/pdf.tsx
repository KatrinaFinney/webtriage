import { renderToBuffer } from '@react-pdf/renderer';
import ReportPdf          from '@/app/components/ReportPdf';
import type { PSIResult } from '@/types/webVitals';

export async function generatePdf({
  site,
  result,
  scannedAt,
}: {
  site: string;
  result: PSIResult;
  scannedAt?: string;
}): Promise<Uint8Array> {
  const buf: Buffer = await renderToBuffer(
    <ReportPdf site={site} result={result} scannedAt={scannedAt} />
  );
  return new Uint8Array(buf);
}
