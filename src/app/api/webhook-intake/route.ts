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
    console.log("Incoming webhook submission:", payload);

    const fieldsArray = payload?.data?.fields;

    // 🧠 Flatten Tally fields into a usable object
    const fields: Record<string, string> = {};
    fieldsArray?.forEach((field: { key: string; value: string }) => {
      fields[field.key] = field.value;
    });

    console.log("🧪 Flattened fields object:", fields); 

    const fullName = fields["fullName"] || "";
    const businessEmail = fields["businessEmail"] || "";
    const websiteUrl = fields["websiteUrl"] || "";
    const service = fields["service"] || "";
    const credentials = fields["credentials"] || "";
    const notes = fields["notes"] || "";

    let vaultRecord: {
      encryptedBlob: string;
      ciphertextDataKey: string;
      iv: string;
      tag: string;
    } | null = null;

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

    const { data, error } = await createJob(jobData);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return new NextResponse("Supabase insert error", { status: 500 });
    }

    console.log("✅ Supabase insert success:", data);
    return NextResponse.json({ status: 'queued' });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new NextResponse("Invalid payload or server error", {
      status: 500,
    });
  }
}
