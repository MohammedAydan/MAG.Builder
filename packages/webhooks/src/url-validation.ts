import { z } from 'zod';

export function isSafeWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow HTTP/HTTPS (HTTPS enforced in prod via other checks, but restrict scheme here)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname;

    // Check for IPv4 mapped / loopback / private
    if (
      hostname === 'localhost' ||
      hostname.match(/^127\.\d+\.\d+\.\d+$/) ||
      hostname.match(/^10\.\d+\.\d+\.\d+$/) ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/) ||
      hostname.match(/^192\.168\.\d+\.\d+$/) ||
      hostname === '::1' ||
      hostname.match(/^0\.0\.0\.0$/) ||
      hostname.match(/^169\.254\.\d+\.\d+$/) // Cloud metadata
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export const WebhookUrlSchema = z.string().url().refine(isSafeWebhookUrl, {
  message: 'Invalid or unsafe webhook URL',
});
