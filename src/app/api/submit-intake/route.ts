import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEmailTemplate } from '@/utils/getEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, email, website, issue, urgency } = data;

  try {
    await resend.emails.send({
      from: 'WebTriage Team <support@webtriage.pro>',
      to: 'katrinafinney@gmail.com', 
      subject: `🔧 New Triage Request from ${name}`,
      html: getEmailTemplate({ name, email, website, issue, urgency }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Email send failed:', err);
    return new NextResponse('Email failed to send', { status: 500 });
  }
}
