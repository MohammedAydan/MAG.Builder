import { z } from 'zod';

const runtimeServicesSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  NEXPRESS_ANALYTICS_PROVIDER: z.enum(['audit-log', 'noop']).optional(),
  NEXPRESS_EMAIL_PROVIDER: z.enum(['resend', 'stub']).optional(),
  NEXPRESS_EMAIL_FROM: z.string().email().optional(),
  NEXPRESS_EMAIL_REPLY_TO: z.string().email().optional(),
  NEXPRESS_FORM_RATE_LIMIT_PROVIDER: z.enum(['memory', 'redis-compatible']).optional(),
  NEXPRESS_SEARCH_PROVIDER: z.enum(['database', 'memory']).optional(),
  NEXPRESS_WEBHOOK_BACKOFF_MS: z.coerce.number().int().min(1000).max(300_000).optional(),
  NEXPRESS_WEBHOOK_DELIVERY_MODE: z.enum(['in-process']).optional(),
  NEXPRESS_WEBHOOK_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
});

export type RuntimeServicesConfig = {
  analytics: {
    provider: 'audit-log' | 'noop';
  };
  email:
    | {
        provider: 'stub';
      }
    | {
        apiKey: string;
        from: string;
        provider: 'resend';
        replyTo?: string;
      };
  rateLimit: {
    provider: 'memory' | 'redis-compatible';
  };
  search: {
    provider: 'database' | 'memory';
  };
  webhooks: {
    backoffMs: number;
    deliveryMode: 'in-process';
    maxAttempts: number;
  };
};

export function parseRuntimeServicesConfig(source: Record<string, string | undefined>): RuntimeServicesConfig {
  const parsed = runtimeServicesSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid runtime services environment: ${details}`);
  }

  const env = parsed.data;
  const isTest = env.NODE_ENV === 'test';
  const emailProvider = env.NEXPRESS_EMAIL_PROVIDER ?? 'stub';

  if (emailProvider === 'resend') {
    if (!env.RESEND_API_KEY) {
      throw new Error('Invalid runtime services environment: RESEND_API_KEY is required.');
    }

    if (!env.NEXPRESS_EMAIL_FROM) {
      throw new Error('Invalid runtime services environment: NEXPRESS_EMAIL_FROM is required.');
    }
  }

  return {
    analytics: {
      provider: env.NEXPRESS_ANALYTICS_PROVIDER ?? (isTest ? 'noop' : 'audit-log'),
    },
    email:
      emailProvider === 'resend'
        ? {
            apiKey: env.RESEND_API_KEY!,
            from: env.NEXPRESS_EMAIL_FROM!,
            provider: 'resend',
            ...(env.NEXPRESS_EMAIL_REPLY_TO ? { replyTo: env.NEXPRESS_EMAIL_REPLY_TO } : {}),
          }
        : {
            provider: 'stub',
          },
    rateLimit: {
      provider: env.NEXPRESS_FORM_RATE_LIMIT_PROVIDER ?? 'memory',
    },
    search: {
      provider: env.NEXPRESS_SEARCH_PROVIDER ?? (isTest ? 'memory' : 'database'),
    },
    webhooks: {
      backoffMs: env.NEXPRESS_WEBHOOK_BACKOFF_MS ?? 30_000,
      deliveryMode: env.NEXPRESS_WEBHOOK_DELIVERY_MODE ?? 'in-process',
      maxAttempts: env.NEXPRESS_WEBHOOK_MAX_ATTEMPTS ?? 3,
    },
  };
}

let cachedRuntimeServicesConfig: RuntimeServicesConfig | undefined;

export function getRuntimeServicesConfig() {
  if (!cachedRuntimeServicesConfig) {
    cachedRuntimeServicesConfig = parseRuntimeServicesConfig(
      process.env as Record<string, string | undefined>,
    );
  }

  return cachedRuntimeServicesConfig;
}

export function redactRuntimeServicesConfig(config: RuntimeServicesConfig) {
  return {
    ...config,
    email:
      config.email.provider === 'resend'
        ? {
            from: config.email.from,
            provider: config.email.provider,
            ...(config.email.replyTo ? { replyTo: config.email.replyTo } : {}),
          }
        : config.email,
  };
}
