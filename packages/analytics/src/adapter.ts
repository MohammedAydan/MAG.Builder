import type { AnalyticsAdapter, StoredAnalyticsEvent } from './types';

/**
 * No-op analytics adapter.
 *
 * Events are discarded (logged to console in dev; silently dropped in prod).
 *
 * PRODUCTION LIMITATION:
 *  - No events are persisted.
 *  - Aggregates always return empty.
 *  - Replace with a real adapter (PostHog, Plausible, DB table) for production.
 */
export class NoopAnalyticsAdapter implements AnalyticsAdapter {
  async capture(event: StoredAnalyticsEvent): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[analytics:noop] ${event.name}`, event.payload);
    }
  }

  async getAggregateCounts(_since?: string): Promise<Record<string, number>> {
    return {};
  }
}

export const defaultAnalyticsAdapter: AnalyticsAdapter = new NoopAnalyticsAdapter();
