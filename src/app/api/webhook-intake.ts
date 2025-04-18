import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Confirm the endpoint is live
    return res.status(200).send('Webhook stub is up and running');
  }

  if (req.method === 'POST') {
    console.log('🔔 Webhook payload:', JSON.stringify(req.body, null, 2));
    return res.status(200).json({ received: true });
  }

  // Reject other methods
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
