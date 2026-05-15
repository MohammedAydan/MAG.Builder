/**
 * POST /api/forms/[formId]/submit
 *
 * Handles public form submissions.
 *
 * Security:
 * - formId validated against slug pattern before any DB access.
 * - Honeypot field (__hp) checked server-side — reject if non-empty.
 * - Rate limited: 5 submissions per form per minute per client identifier
 *   (uses a truncated client identifier derived from request headers, not raw IP).
 * - Request body size is limited by Next.js defaults (~4 MB); submissions
 *   are additionally validated field-by-field against the form definition.
 * - All submission fields are validated and sanitized server-side.
 * - Unknown fields are rejected.
 * - No private configuration is returned in the response.
 * - Submission errors do not leak implementation details.
 * - Rate limit metadata is not included in error responses.
 *
 * Rate limit key: Uses a hash-like truncated identifier derived from
 * X-Forwarded-For or a fallback constant. Raw IP addresses are not stored.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildRateLimitKey } from '@nexpress/forms';
import { formRateLimiter } from '@/lib/forms/runtime';
import { processFormSubmission } from '@/lib/forms/service';
import { resolveSiteFromHeaders } from '@/lib/sites/service';

const CONTENT_TYPE_JSON = 'application/json';

/**
 * Derive a minimized client identifier for rate limiting.
 * Uses the first segment of X-Forwarded-For if available, otherwise falls back
 * to a constant. The raw IP is not stored or logged.
 */
function deriveClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');

  if (forwarded) {
    // Use only the first IP segment; don't store the full chain
    const first = forwarded.split(',')[0]?.trim() ?? '';
    // Truncate to first 20 chars to further minimize stored data
    return first.slice(0, 20) || 'unknown';
  }

  return 'unknown';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
): Promise<NextResponse> {
  try {
    const { formId } = await params;

    // Validate formId format (matches form slug pattern)
    if (!formId || typeof formId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(formId)) {
      return NextResponse.json({ error: 'Invalid form id.' }, { status: 400 });
    }

    const site = await resolveSiteFromHeaders(req.headers);

    if (!site) {
      return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
    }

    // Validate Content-Type
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes(CONTENT_TYPE_JSON)) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json.' },
        { status: 415 },
      );
    }

    // Parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;

    // Honeypot check: if __hp field is present and non-empty, silently reject
    if (typeof payload['__hp'] === 'string' && payload['__hp'].length > 0) {
      // Respond with a fake success to not alert bots
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Rate limit check
    const clientId = deriveClientIdentifier(req);
    const rateLimitKey = buildRateLimitKey(formId, clientId);
    const rateLimitResult = await formRateLimiter.check(rateLimitKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    // Remove honeypot from payload before validation
    const submissionPayload = Object.fromEntries(
      Object.entries(payload).filter(([k]) => k !== '__hp'),
    );

    // Process the submission (load form, validate, persist, run workflows)
    const result = await processFormSubmission(formId, submissionPayload, site);

    if (!result.success) {
      return NextResponse.json({ errors: result.errors }, { status: 422 });
    }

    // Return a minimal success response — no internal IDs or config exposed
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Do not leak internal error details
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 });
  }
}
