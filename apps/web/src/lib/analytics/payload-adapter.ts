import type { AnalyticsAdapter, AnalyticsAggregateOptions, StoredAnalyticsEvent } from '@nexpress/analytics';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export class PayloadAnalyticsAdapter implements AnalyticsAdapter {
  async capture(event: StoredAnalyticsEvent): Promise<void> {
    const payload = await getPayload({ config: configPromise });
    
    await payload.create({
      collection: 'analytics-events',
      data: {
        siteId: event.meta.siteId as unknown as number,
        name: event.name,
        anonymousId: (event.meta.anonymousId as string) ?? null,
        sessionId: (event.meta.sessionId as string) ?? null,
        userId: (event.meta.userId as string) ?? null,
        path: (event.meta.path as string) ?? null,
        payload: event.payload as Record<string, unknown>,
        timestamp: event.occurredAt,
      },
      overrideAccess: true,
    });
  }

  async getAggregateCounts(options?: AnalyticsAggregateOptions): Promise<Record<string, number>> {
    const payload = await getPayload({ config: configPromise });
    
    const conditions: Record<string, unknown>[] = [];
    if (options?.siteId) {
      conditions.push({ siteId: { equals: options.siteId } });
    }
    if (options?.since) {
      conditions.push({ timestamp: { greater_than_equal: options.since } });
    }

    const result = await payload.find({
      collection: 'analytics-events',
      ...(conditions.length > 0 ? { where: { and: conditions as any } } : {}),
      limit: 10000, // Reasonable limit for aggregate calculation in memory for now
      overrideAccess: true,
      depth: 0,
    });

    return result.docs.reduce<Record<string, number>>((counts, doc) => {
      const name = doc.name as string;
      counts[name] = (counts[name] ?? 0) + 1;
      return counts;
    }, {});
  }
}
