import {
  createRateLimiter,
  InMemoryRateLimitStore,
  ResendEmailProvider,
  stubEmailProvider,
  type EmailProvider,
  type RateLimitStore,
} from '@nexpress/forms';
import { getRuntimeServicesConfig } from '@/lib/runtime-services/config';

let warnedDistributedRateLimitFallback = false;

function getRateLimitStore(): RateLimitStore {
  const config = getRuntimeServicesConfig();

  if (config.rateLimit.provider === 'redis-compatible' && !warnedDistributedRateLimitFallback) {
    warnedDistributedRateLimitFallback = true;
    console.warn(
      '[forms] Redis-compatible rate limiting is configured, but no client adapter is installed. Falling back to in-memory rate limiting.',
    );
  }

  return new InMemoryRateLimitStore();
}

export const formRateLimiter = createRateLimiter(
  {
    maxRequests: 5,
    windowMs: 60_000,
  },
  getRateLimitStore(),
);

let cachedEmailProvider: EmailProvider | undefined;

export function getFormEmailProvider(): EmailProvider {
  if (cachedEmailProvider) {
    return cachedEmailProvider;
  }

  const config = getRuntimeServicesConfig();
  cachedEmailProvider =
    config.email.provider === 'resend'
      ? new ResendEmailProvider(config.email)
      : stubEmailProvider;

  return cachedEmailProvider;
}
