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

    const fieldKeyMap: Record<string, string> = {
      question_RMYxlv: 'fullName',
      question_oedEQ5: 'businessEmail',
      question_G9D6yQ: 'websiteUrl',
      question_O4Yayk: 'service',
      question_VQYGyN: 'credentials',
      question_P1YpyP: 'notes'
    };

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

    const normalize = (value: string | string[] | null): string =>
      Array.isArray(value) ? value[0] ?? "" : value ?? "";

    const fullName = normalize(fields["fullName"]);
    const businessEmail = normalize(fields["businessEmail"]);
    const websiteUrl = normalize(fields["websiteUrl"]);
    const service = normalize(fields["service"]);
    const credentials = normalize(fields["credentials"]);
    const notes = normalize(fields["notes"]);

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
      console.error("❌ Supabase insert error:", error);
      return new NextResponse("Supabase insert error", { status: 500 });
    }

    // 🔔 Slack notification
    await fetch("https://hooks.slack.com/services/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", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 *New WebTriage Intake!*\n\n👤 *Name:* ${fullName}\n📧 *Email:* ${businessEmail}\n🌐 *Website:* ${websiteUrl}\n🛠️ *Service:* ${service}\n📝 *Notes:* ${notes || '—'}`,
      }),
    });

    console.log("✅ Supabase insert + Slack alert success");
    return NextResponse.json({ status: 'queued' });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new NextResponse("Invalid payload or server error", {
      status: 500,
    });
  }
}
