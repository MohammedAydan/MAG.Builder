import type { AnalyticsAdapter, AnalyticsAggregateOptions, StoredAnalyticsEvent } from '@nexpress/analytics';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export class PayloadAnalyticsAdapter implements AnalyticsAdapter {
  async capture(event: StoredAnalyticsEvent): Promise<void> {
    const payload = await getPayload({ config: configPromise });
    
    await payload.create({
      collection: 'analytics-events',
      data: {
        siteId: event.meta.siteId as any,
        name: event.name,
        anonymousId: (event.meta.anonymousId as string) ?? null,
        sessionId: (event.meta.sessionId as string) ?? null,
        userId: (event.meta.userId as string) ?? null,
        path: (event.meta.path as string) ?? null,
        payload: event.payload as any,
        timestamp: event.occurredAt,
      },
      overrideAccess: true,
    });
  }

  async getAggregateCounts(options?: AnalyticsAggregateOptions): Promise<Record<string, number>> {
    const payload = await getPayload({ config: configPromise });
    
    const where: any = {
      and: [],
    };

    if (options?.siteId) {
      where.and.push({ siteId: { equals: options.siteId } });
    }

    if (options?.since) {
      where.and.push({ timestamp: { greater_than_equal: options.since } });
    }

    const result = await payload.find({
      collection: 'analytics-events',
      where,
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
