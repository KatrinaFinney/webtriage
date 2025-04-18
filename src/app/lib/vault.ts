// lib/vault.ts
// Implements AWS KMS envelope encryption for sensitive credentials using AWS SDK v2.

import AWS from 'aws-sdk';
import crypto from 'crypto';

// Configure AWS SDK v2 KMS client
const kms = new AWS.KMS({ region: process.env.AWS_REGION });
const CMK_KEY_ID = process.env.KMS_CMK_ID!; // Your KMS Customer Master Key ID

export interface VaultRecord {
  encryptedBlob: string;
  ciphertextDataKey: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts plaintext credentials using AWS KMS envelope encryption (AES-256-GCM)
 * @param credentials - the sensitive text to encrypt
 * @returns VaultRecord containing KMS-encrypted data key and AES-encrypted payload
 */
export async function encryptCredentials(credentials: string): Promise<VaultRecord> {
  // 1. Generate a data key from KMS
  const dataKeyResp = await kms.generateDataKey({
    KeyId: CMK_KEY_ID,
    KeySpec: 'AES_256'
  }).promise();

  const plaintextKey = dataKeyResp.Plaintext as Buffer;
  const encryptedKey = dataKeyResp.CiphertextBlob as Buffer;

  // 2. Encrypt the credentials using AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', plaintextKey, iv);
  let encrypted = cipher.update(credentials, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  // 3. Return both KMS-encrypted data key and AES payload
  return {
    encryptedBlob: encrypted.toString('base64'),
    ciphertextDataKey: encryptedKey.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}
