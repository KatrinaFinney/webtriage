import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, email, website, issue, urgency } = data;

  try {
    await resend.emails.send({
      from: 'WebTriage Team <support@webtriage.pro>',
      to: 'katrinafinney@gmail.com', // ← replace with where YOU want to receive alerts
      subject: `🔧 New Triage Request from ${name}`,
      html: `
        <h2>Website Triage Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Website:</strong> ${website}</p>
        <p><strong>Urgency:</strong> ${urgency}</p>
        <p><strong>Issue:</strong><br>${issue}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Email send failed:', err);
    return new NextResponse('Email failed to send', { status: 500 });
  }
}
