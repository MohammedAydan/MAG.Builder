import crypto from 'crypto';

export interface WebhookSignatureConfig {
  secret: string;
  payload: string;
  timestamp?: number;
}

export function generateSignature({ secret, payload, timestamp }: WebhookSignatureConfig): string {
  const ts = timestamp || Date.now();
  const signedPayload = `${ts}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(signedPayload).digest('hex');
  return `t=${ts},v1=${signature}`;
}

export function verifySignature(
  header: string | null | undefined,
  secret: string,
  payload: string,
  maxAgeMs: number = 5 * 60 * 1000
): boolean {
  if (!header || typeof header !== 'string') return false;

  const parts = header.split(',');
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = parseInt(value ?? '', 10);
    }
    if (key === 'v1') {
      signature = value ?? null;
    }
  }

  if (!timestamp || !signature || isNaN(timestamp)) {
    return false;
  }

  const age = Date.now() - timestamp;
  if (age > maxAgeMs) {
    return false; // Stale request, prevent replay
  }

  const expectedSignatureHeader = generateSignature({ secret, payload, timestamp });
  const expectedSignature = expectedSignatureHeader.split('v1=')[1];

  if (!expectedSignature) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}
