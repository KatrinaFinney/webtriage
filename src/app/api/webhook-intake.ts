import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Log the incoming payload so you can inspect it
  console.log('🔔 Webhook received!', JSON.stringify(req.body, null, 2));

  // 2. Return a 200 OK so Tally knows we got it
  res.status(200).json({ received: true });
}
