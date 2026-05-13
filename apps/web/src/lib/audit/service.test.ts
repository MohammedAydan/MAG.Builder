import {
  AUDIT_ACTIONS,
  createAuditContext,
  getAuditActorFromRequest,
  sanitizeAuditMetadata,
  writeAuditEntry,
} from '@/lib/audit/service';
import { describe, expect, it, vi } from 'vitest';

describe('audit service', () => {
  it('sanitizes secrets from audit metadata', () => {
    expect(
      sanitizeAuditMetadata({
        databaseUrl: 'postgres://secret',
        nested: {
          password: 'secret-password',
          safe: 'ok',
        },
        payloadSecret: 'super-secret',
        siteName: 'NexPress',
      }),
    ).toEqual({
      nested: {
        safe: 'ok',
      },
      siteName: 'NexPress',
    });
  });

  it('prefers contextual actors and falls back to the request user', () => {
    const context = createAuditContext({
      actor: {
        email: 'bootstrap@example.com',
        role: 'super-admin',
        source: 'system',
      },
    });

    expect(
      getAuditActorFromRequest(
        {
          user: {
            email: 'ignored@example.com',
            id: '1',
            role: 'admin',
          },
        },
        context,
      ),
    ).toEqual({
      email: 'bootstrap@example.com',
      role: 'super-admin',
      source: 'system',
    });
  });

  it('swallows audit write failures without leaking entry details', async () => {
    const payload = {
      create: vi.fn(async () => {
        throw new Error('db failed');
      }),
    };

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      writeAuditEntry(payload, {
        action: AUDIT_ACTIONS.installCompleted,
        metadata: {
          password: 'should-not-log',
          siteName: 'NexPress',
        },
        result: 'success',
      }),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith('[audit] Failed to write audit entry.');
    consoleError.mockRestore();
  });
});
