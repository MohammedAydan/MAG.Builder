/**
 * Server-only analytics service instance for the web app.
 *
 * Phase 22 uses the NoopAnalyticsAdapter (events are not persisted).
 * Replace the adapter argument here to switch to PostHog, Plausible, etc.
 */
import { AnalyticsService, NoopAnalyticsAdapter } from '@nexpress/analytics';
import type { AnalyticsEvent } from '@nexpress/analytics';
import { ANALYTICS_SCHEMA_VERSION } from '@nexpress/analytics';

export const analyticsService = new AnalyticsService(new NoopAnalyticsAdapter());

// Re-export types for callers
export type { AnalyticsEvent };
export { ANALYTICS_SCHEMA_VERSION };

/**
 * Helper: emit a typed analytics event server-side.
 * Wraps the service capture so callers do not need to import the service directly.
 * Returns true if accepted, false if rejected (invalid or sensitive).
 */
export async function emitAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  return analyticsService.capture(event);
}
