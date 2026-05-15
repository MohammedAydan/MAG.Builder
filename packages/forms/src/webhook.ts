/**
 * Webhook action foundation for NexPress forms workflows.
 *
 * SSRF Protection:
 * - Only https:// scheme is accepted in production. http:// is blocked.
 * - Localhost, loopback, link-local, private IP ranges, and cloud metadata
 *   service addresses are rejected.
 * - Redirects are disabled.
 * - Payload size is limited.
 * - Timeout is enforced.
 * - Webhook responses are never returned to clients.
 * - Secrets are never included in webhook payloads.
 */

/** Blocked IP ranges and hostnames for SSRF protection. */
const BLOCKED_HOSTS = new Set([
  'localhost',
  '0.0.0.0',
]);

/** Private/loopback/link-local IPv4 prefix matchers. */
function isPrivateIpv4(hostname: string): boolean {
  // Strip IPv6 brackets
  const h = hostname.replace(/^\[|\]$/g, '');

  if (h === '::1') return true; // IPv6 loopback

  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ipv4Regex.exec(h);

  if (!match) return false;

  const [, aStr, bStr] = match;
  const a = Number(aStr);
  const b = Number(bStr);

  // RFC1918 + loopback + link-local + CGNAT
  return (
    a === 10 ||                           // 10.0.0.0/8
    a === 127 ||                          // 127.0.0.0/8 loopback
    (a === 172 && b >= 16 && b <= 31) ||  // 172.16.0.0/12
    (a === 192 && b === 168) ||           // 192.168.0.0/16
    (a === 169 && b === 254) ||           // 169.254.0.0/16 link-local
    (a === 100 && b >= 64 && b <= 127)    // 100.64.0.0/10 CGNAT
  );
}

/** Cloud metadata service hostnames and IPs. */
const METADATA_ADDRESSES = new Set([
  '169.254.169.254',    // AWS/GCP/Azure metadata
  'fd00:ec2::254',      // AWS IPv6 metadata
  'metadata.google.internal',
  'metadata.goog',
]);

export type WebhookValidationResult =
  | { reason: string; success: false }
  | { success: true; url: URL };

/**
 * Validate a webhook destination URL against SSRF protections.
 * Returns a parsed URL on success so the caller can use the validated object.
 */
export function validateWebhookUrl(rawUrl: string): WebhookValidationResult {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { reason: 'Webhook URL is not a valid URL.', success: false };
  }

  const scheme = parsed.protocol;

  // Only https is allowed for production webhook endpoints
  if (scheme !== 'https:') {
    return {
      reason: 'Webhook URL must use the https:// scheme.',
      success: false,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(hostname)) {
    return { reason: 'Webhook destination is not allowed.', success: false };
  }

  if (METADATA_ADDRESSES.has(hostname)) {
    return { reason: 'Webhook destination is not allowed.', success: false };
  }

  if (isPrivateIpv4(hostname)) {
    return { reason: 'Webhook destination is not allowed.', success: false };
  }

  return { success: true, url: parsed };
}

export type WebhookPayload = {
  formSlug: string;
  /** Timestamp in ISO 8601. */
  submittedAt: string;
  /** Safe validated field values only — no secrets, no internal metadata. */
  fields: Record<string, boolean | null | string>;
};

export type WebhookExecutionResult =
  | { reason: string; success: false }
  | { httpStatus: number; success: true };

const WEBHOOK_TIMEOUT_MS = 10_000;
const WEBHOOK_MAX_PAYLOAD_BYTES = 32_768; // 32 KB

/**
 * Execute a webhook action for a form submission.
 *
 * Security:
 * - URL is validated before fetch.
 * - Redirects are disabled.
 * - A timeout is enforced.
 * - The webhook response body is never returned to callers.
 * - Only safe field values are included in the payload.
 */
export async function executeWebhookAction(
  rawUrl: string,
  payload: WebhookPayload,
): Promise<WebhookExecutionResult> {
  const urlResult = validateWebhookUrl(rawUrl);

  if (!urlResult.success) {
    return { reason: urlResult.reason, success: false };
  }

  const body = JSON.stringify(payload);

  const encoded = new TextEncoder().encode(body);
  if (encoded.byteLength > WEBHOOK_MAX_PAYLOAD_BYTES) {
    return { reason: 'Webhook payload is too large.', success: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    let httpStatus: number;

    try {
      const response = await fetch(urlResult.url.toString(), {
        body,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NexPress-Webhook/1.0',
        },
        method: 'POST',
        redirect: 'error', // Disable redirects to prevent SSRF bypass
        signal: controller.signal,
      });

      httpStatus = response.status;
    } finally {
      clearTimeout(timeoutId);
    }

    return { httpStatus, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Only log safe metadata, not the payload or response body
    console.error('[webhook] Webhook delivery failed:', message);
    return { reason: 'Webhook delivery failed.', success: false };
  }
}
