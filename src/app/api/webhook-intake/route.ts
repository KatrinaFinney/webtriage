import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return new NextResponse(
    'Webhook stub is up and running',
    {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('🔔 Webhook payload:', JSON.stringify(body, null, 2));
  return NextResponse.json({ received: true });
}
