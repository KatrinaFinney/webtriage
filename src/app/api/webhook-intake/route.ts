// src/app/api/webhook-intake/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { encryptCredentials } from '../../lib/vault';
import { createJob } from '../../lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESENDAPIKEY);

export function GET() {
  return new NextResponse('Webhook stub is up and running', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
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
      question_P1YpyP: 'notes',
    };

    const serviceIdMap: Record<string, string> = {
      '7942f92a-29a7-4b99-9861-fac6036eae6f': 'Site Triage',
      '41a4fba6-fe9a-499e-be05-78a9f17b4995': 'Emergency Fix',
      '6bb3c4f2-fc2b-490c-a10b-d3950b1c019f': 'Performance & SEO Boost',
      'd5e8b3a4-70e5-45a2-8b15-bb19d2f1d0ef': 'Security & Compliance',
      '9d8b2b25-e9d3-4f58-845e-b750cde7070a': 'Continuous Care',
      '3e392115-8e96-47ba-8629-7af1e730a937': 'Full Recovery Plan',
    };

    type TallyField = {
      key: string;
      value: string | string[] | null;
    };

    const fields: Record<string, unknown> = {};
    (fieldsArray as TallyField[])?.forEach((field) => {
      const mappedKey = fieldKeyMap[field.key];
      if (mappedKey) {
        fields[mappedKey] = field.value;
      }
    });

    const normalize = (value: unknown): string => {
      if (Array.isArray(value)) return value[0] ?? "";
      if (typeof value === "string") return value;
      return "";
    };

    const fullName = normalize(fields["fullName"]);
    const businessEmail = normalize(fields["businessEmail"]);
    const websiteUrl = normalize(fields["websiteUrl"]);
    const rawService = normalize(fields["service"]);
    const service = serviceIdMap[rawService] || rawService;
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
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      const slackRes = await fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *New WebTriage Intake!*\n\n👤 *Name:* ${fullName}\n📧 *Email:* ${businessEmail}\n🌐 *Website:* ${websiteUrl}\n🛠️ *Service:* ${service}\n📝 *Notes:* ${notes || '—'}`,
        }),
      });

      console.log("🔔 Slack response status:", slackRes.status);
      const slackBody = await slackRes.text();
      console.log("🔔 Slack response body:", slackBody);
    } else {
      console.warn("⚠️ Slack webhook URL not defined.");
    }

    // 📧 Autoresponder via Resend
    const emailResponse = await resend.emails.send({
      from: 'WebTriage Team <support@webtriage.pro>',
      to: businessEmail,
      subject: `We received your ${service} request`,
      html: `
        <div style="font-family: sans-serif; color: #0a1128;">
          <h2>Thanks, ${fullName}!</h2>
          <p>We’ve received your <strong>${service}</strong> request for:</p>
          <p style="font-size: 1.1rem;"><a href="${websiteUrl}" target="_blank">${websiteUrl}</a></p>
          <p>We'll review your submission and get started shortly.</p>
          <p>You’ll hear from us soon with next steps, or if any additional details are needed.</p>
          <hr />
          <p style="font-size: 0.9rem; color: #64748b;">WebTriage.pro – Urgent Care for Websites™</p>
        </div>
      `,
    });

    console.log("📤 Resend email response:", emailResponse);

    console.log("✅ Supabase insert + Slack alert + Email success");
    return NextResponse.json({ status: 'queued' });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return new NextResponse("Invalid payload or server error", {
      status: 500,
    });
  }
}
