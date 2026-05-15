/**
 * Server-only analytics service instance for the web app.
 *
 * Phase 29 selects a persistent audit-log-backed adapter by default while
 * retaining a no-op fallback for tests or explicitly disabled deployments.
 */
import { AnalyticsService, NoopAnalyticsAdapter } from '@nexpress/analytics';
import type { AnalyticsEvent } from '@nexpress/analytics';
import { ANALYTICS_SCHEMA_VERSION } from '@nexpress/analytics';
import { AuditLogAnalyticsAdapter } from '@/lib/analytics/audit-log-adapter';
import { getRuntimeServicesConfig } from '@/lib/runtime-services/config';

function createAnalyticsAdapter() {
  const config = getRuntimeServicesConfig();
  return config.analytics.provider === 'noop'
    ? new NoopAnalyticsAdapter()
    : new AuditLogAnalyticsAdapter();
}

export const analyticsService = new AnalyticsService(createAnalyticsAdapter());

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
