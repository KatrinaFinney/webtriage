// src/lib/resend.ts
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY in environment');
}

/**
 * A singleton Resend client for sending transactional emails.
 * Docs: https://resend.com/docs
 */
export const resend = new Resend(process.env.RESEND_API_KEY);
