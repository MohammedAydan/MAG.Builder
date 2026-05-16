import { defaultAutomationEngine, AutomationEngine } from '@nexpress/automation';
import type { AutomationRule, AutomationTriggerPayload } from '@nexpress/automation';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { emitAnalyticsEvent, ANALYTICS_SCHEMA_VERSION } from '@/lib/analytics/service';

/**
 * Server-only automation service.
 * Connects the AutomationEngine to Payload for rule persistence and execution logging.
 */
export class AutomationService {
  constructor(private readonly engine: AutomationEngine) {
    // Register base action handlers
    this.engine.registerActionHandler('log', (async (config: any, trigger: any) => {
      console.log(`[automation:log] ${config.message || 'No message'}`, { trigger });
      return { action: 'log', status: 'success' };
    }) as any);

    this.engine.registerActionHandler('webhook', (async (config: any, trigger: any) => {
      const url = config.url;
      if (!url) return { action: 'webhook', status: 'failure', message: 'Missing URL' };
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger, config }),
        });
        
        return { 
          action: 'webhook', 
          status: response.ok ? 'success' : 'failure',
          message: `HTTP ${response.status}`
        };
      } catch (err) {
        return { action: 'webhook', status: 'failure', message: String(err) };
      }
    }) as any);
  }

  /**
   * Trigger automation rules for a given event.
   */
  async trigger(siteId: string, trigger: string, payload: any): Promise<void> {
    const cms = await getPayload({ config: configPromise });
    
    // 1. Fetch enabled rules for this site and trigger
    const rules = await cms.find({
      collection: 'automation-rules',
      where: {
        and: [
          { siteId: { equals: siteId } },
          { trigger: { equals: trigger } },
          { enabled: { equals: true } },
        ],
      },
      limit: 100,
      overrideAccess: true,
      depth: 0,
    });

    if (rules.docs.length === 0) return;

    // 2. Execute each rule
    for (const ruleDoc of rules.docs) {
      const rule: AutomationRule = {
        id: String(ruleDoc.id),
        name: ruleDoc.name,
        enabled: ruleDoc.enabled || false,
        trigger: ruleDoc.trigger as any,
        actions: (ruleDoc.actions || []).map((a: any) => ({
          action: a.type,
          config: a.config,
        })),
      };

      const startTime = Date.now();
      
      // Create execution record
      const execution = await cms.create({
        collection: 'automation-executions',
        data: {
          siteId: siteId as any,
          rule: ruleDoc.id,
          status: 'pending',
          triggerData: payload,
          startedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      });

      try {
        const result = await this.engine.execute(rule, { trigger: trigger as any, payload });
        
        await cms.update({
          collection: 'automation-executions',
          id: execution.id,
          data: {
            status: result.overallStatus === 'partial' ? 'success' : result.overallStatus as any,
            results: result.results as any,
            completedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
          },
          overrideAccess: true,
        });

        await emitAnalyticsEvent({
          schemaVersion: ANALYTICS_SCHEMA_VERSION,
          name: 'automation.executed',
          payload: {
            ruleId: rule.id,
            status: result.overallStatus,
          },
        });
      } catch (err) {
        await cms.update({
          collection: 'automation-executions',
          id: execution.id,
          data: {
            status: 'failure',
            error: String(err),
            completedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
          },
          overrideAccess: true,
        });
      }
    }
  }
}

export const automationService = new AutomationService(defaultAutomationEngine);
