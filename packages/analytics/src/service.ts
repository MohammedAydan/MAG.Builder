import { randomUUID } from 'crypto';
import type { AnalyticsAdapter, StoredAnalyticsEvent } from './types';
import { AnalyticsEventSchema, hasSensitiveFields } from './types';

/**
 * AnalyticsService — server-side only.
 *
 * Responsibilities:
 *  1. Validate incoming event payloads (Zod schema enforcement)
 *  2. Reject events with sensitive field names
 *  3. Enrich events with a server-assigned ID and timestamp
 *  4. Delegate storage to the configured AnalyticsAdapter
 *  5. Fail silently — analytics must never break application flow
 */
export class AnalyticsService {
  constructor(private readonly adapter: AnalyticsAdapter) {}

  /**
   * Capture a single analytics event.
   *
   * @param rawEvent - Unvalidated event (from client or server hooks)
   * @returns true if event was accepted and forwarded; false if rejected
   */
  async capture(rawEvent: unknown): Promise<boolean> {
    // Step 1: Validate against the allowlisted discriminated union schema
    const parsed = AnalyticsEventSchema.safeParse(rawEvent);
    if (!parsed.success) {
      return false;
    }

    const event = parsed.data;

    // Step 2: Reject if payload contains sensitive field names
    const payloadObj =
      typeof event.payload === 'object' && event.payload !== null
        ? (event.payload as Record<string, unknown>)
        : {};

    if (hasSensitiveFields(payloadObj)) {
      console.warn('[analytics] Rejected event with sensitive fields:', event.name);
      return false;
    }

    // Step 3: Enrich with server-assigned ID and timestamp
    const stored: StoredAnalyticsEvent = {
      id: randomUUID(),
      name: event.name,
      schemaVersion: event.schemaVersion,
      payload: payloadObj,
      meta: (event.meta ?? {}) as Record<string, unknown>,
      occurredAt: new Date().toISOString(),
    };

    // Step 4: Delegate to adapter (fail silently)
    try {
      await this.adapter.capture(stored);
    } catch {
      console.error('[analytics] Failed to capture event:', event.name);
    }

    return true;
  }

  /**
   * Get aggregated event counts — admin-only endpoint helper.
   * Returns safe summary data; never raw events.
   */
  async getAggregateCounts(since?: string): Promise<Record<string, number>> {
    try {
      return await this.adapter.getAggregateCounts(since);
    } catch {
      return {};
    }
  }
}
