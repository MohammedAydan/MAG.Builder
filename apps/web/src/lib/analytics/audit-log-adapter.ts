import type { AnalyticsAdapter, AnalyticsAggregateOptions, StoredAnalyticsEvent } from '@nexpress/analytics';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import { getPayloadClient } from '@/lib/payload';

type AuditLogRecord = {
  action?: string | null;
  metadata?: Record<string, unknown> | null;
};

type AuditPayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: <T>(args: Record<string, unknown>) => Promise<{ docs: T[] }>;
};

async function getAuditPayload() {
  return (await getPayloadClient()) as unknown as AuditPayloadClient;
}

export class AuditLogAnalyticsAdapter implements AnalyticsAdapter {
  async capture(event: StoredAnalyticsEvent): Promise<void> {
    const payload = await getAuditPayload();
    await writeAuditEntry(payload, {
      action: AUDIT_ACTIONS.analyticsEventCaptured,
      actor: { source: 'system' },
      metadata: {
        eventId: event.id,
        eventName: event.name,
        occurredAt: event.occurredAt,
        schemaVersion: event.schemaVersion,
        siteId: typeof event.meta.siteId === 'string' ? event.meta.siteId : undefined,
      },
      result: 'success',
      targetCollection: 'audit-logs',
      targetId: event.id,
    });
  }

  async getAggregateCounts(options?: AnalyticsAggregateOptions): Promise<Record<string, number>> {
    const payload = await getAuditPayload();
    const result = await payload.find<AuditLogRecord>({
      collection: 'audit-logs',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      sort: '-occurredAt',
      where: {
        action: {
          equals: AUDIT_ACTIONS.analyticsEventCaptured,
        },
      },
    });

    return result.docs.reduce<Record<string, number>>((counts, record) => {
      const metadata = record.metadata ?? {};
      const siteId = typeof metadata.siteId === 'string' ? metadata.siteId : undefined;
      const occurredAt = typeof metadata.occurredAt === 'string' ? metadata.occurredAt : undefined;
      const eventName = typeof metadata.eventName === 'string' ? metadata.eventName : undefined;

      if (!eventName) {
        return counts;
      }

      if (options?.siteId && siteId !== options.siteId) {
        return counts;
      }

      if (options?.since && occurredAt && occurredAt < options.since) {
        return counts;
      }

      counts[eventName] = (counts[eventName] ?? 0) + 1;
      return counts;
    }, {});
  }
}
