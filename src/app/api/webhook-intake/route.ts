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
    console.log("📩 Incoming webhook payload:", payload);

    const fieldsArray = payload?.data?.fields;

    // 💡 Mapping Tally field keys → meaningful names
    const fieldKeyMap: Record<string, string> = {
      question_RMYxlv: 'fullName',
      question_oedEQ5: 'businessEmail',
      question_G9D6yQ: 'websiteUrl',
      question_O4Yayk: 'service',
      question_VQYGyN: 'credentials',
      question_P1YpyP: 'notes'
    };

    // ✅ Safe field typing
    type TallyField = {
      key: string;
      value: string | string[] | null;
    };

    const fields: Record<string, string | string[] | null> = {};
    (fieldsArray as TallyField[])?.forEach((field) => {
      const mappedKey = fieldKeyMap[field.key];
      if (mappedKey) {
        fields[mappedKey] = field.value;
      }
    });

    console.log("🧪 Mapped fields:", fields);

    const fullName = fields["fullName"] || "";
    const businessEmail = fields["businessEmail"] || "";
    const websiteUrl = fields["websiteUrl"] || "";
    const rawService = fields["service"];
    const service = Array.isArray(rawService) ? rawService[0] : rawService || "";
    const credentials = fields["credentials"] || "";
    const notes = fields["notes"] || "";

    let vaultRecord = null;
    if (typeof credentials === "string" && credentials.trim()) {
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
