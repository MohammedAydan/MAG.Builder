import { getRuntimeEnv } from '@/lib/env';
import { z } from 'zod';

const installRuntimeConfigSchema = z.object({
  NEXPRESS_INSTALLATION_MODE: z.enum(['wizard', 'locked']).default('wizard'),
  NEXPRESS_DEFAULT_SITE_NAME: z
    .string()
    .trim()
    .min(2, 'NEXPRESS_DEFAULT_SITE_NAME must be at least 2 characters')
    .max(80, 'NEXPRESS_DEFAULT_SITE_NAME must be 80 characters or fewer')
    .optional(),
});

export type InstallRuntimeConfig = z.infer<typeof installRuntimeConfigSchema>;

export function parseInstallRuntimeConfig(
  source: Record<string, string | undefined>,
): InstallRuntimeConfig {
  getRuntimeEnv();

  const parsed = installRuntimeConfigSchema.safeParse({
    NEXPRESS_INSTALLATION_MODE: source.NEXPRESS_INSTALLATION_MODE,
    NEXPRESS_DEFAULT_SITE_NAME: source.NEXPRESS_DEFAULT_SITE_NAME,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid install runtime configuration: ${details}`);
  }

  return parsed.data;
}

let cachedRuntimeConfig: InstallRuntimeConfig | undefined;

export function getInstallRuntimeConfig() {
  if (!cachedRuntimeConfig) {
    cachedRuntimeConfig = parseInstallRuntimeConfig(
      process.env as Record<string, string | undefined>,
    );
  }

  return cachedRuntimeConfig;
}
