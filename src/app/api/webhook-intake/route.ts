// src/app/api/webhook-intake/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { encryptCredentials } from '../../lib/vault';
import { createJob } from '../../lib/db';

export function GET() {
  // Quick health‑check endpoint
  return new NextResponse('Webhook stub is up and running', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(request: NextRequest) {
  // 1. Parse incoming JSON
  const {
    fullName,
    businessEmail,
    websiteUrl,
    service,
    credentials = '',
    notes = ''
  } = await request.json();

  // 2. Encrypt credentials if provided
  let vaultRecord: {
    encryptedBlob: string;
    ciphertextDataKey: string;
    iv: string;
    tag: string;
  } | null = null;

  if (credentials.trim()) {
    vaultRecord = await encryptCredentials(credentials);
  }

  // 3. Enqueue the job
  await createJob({
    fullName,
    businessEmail,
    websiteUrl,
    service,
    notes,
    // only spread vault fields when they exist
    ...(vaultRecord && {
      encrypted_blob: vaultRecord.encryptedBlob,
      ciphertext_data_key: vaultRecord.ciphertextDataKey,
      iv: vaultRecord.iv,
      tag: vaultRecord.tag,
    }),
  });

  // 4. Respond immediately so Tally knows we succeeded
  return NextResponse.json({ status: 'queued' });
}
