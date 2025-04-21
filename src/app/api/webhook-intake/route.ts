// src/app/api/webhook-intake/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { encryptCredentials } from '../../lib/vault';
import { createJob } from '../../lib/db';

export function GET() {
  return new NextResponse('Webhook stub is up and running', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const {
      fullName,
      businessEmail,
      websiteUrl,
      service,
      credentials = '',
      notes = ''
    } = payload;

    console.log("Incoming webhook submission:", payload);

    // Encrypt credentials if present
    let vaultRecord = null;
    if (credentials.trim()) {
      vaultRecord = await encryptCredentials(credentials);
    }

    const jobData = {
      fullName,
      businessEmail,
      websiteUrl,
      service,
      notes,
      ...(vaultRecord && {
        encrypted_blob: vaultRecord.encryptedBlob,
        ciphertext_data_key: vaultRecord.ciphertextDataKey,
        iv: vaultRecord.iv,
        tag: vaultRecord.tag,
      }),
    };

    const { error } = await createJob(jobData);

    if (error) {
      console.error("Supabase insert error:", error);
      return new NextResponse("Error saving submission", { status: 500 });
    }

    return NextResponse.json({ status: 'queued' });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new NextResponse("Invalid request body or internal error", {
      status: 500,
    });
  }
}
