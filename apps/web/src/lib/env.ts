import { z } from "zod";

// Always available — required at build time and runtime.
const buildEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
});

// Secrets required only at runtime (server request handling).
const runtimeEnvSchema = z.object({
  PAYLOAD_SECRET: z.string().min(1, "PAYLOAD_SECRET is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export type AppEnv = z.infer<typeof buildEnvSchema> &
  z.infer<typeof runtimeEnvSchema>;

export function parseAppEnv(source: Record<string, string | undefined>): AppEnv {
  const buildParsed = buildEnvSchema.safeParse({ NODE_ENV: source.NODE_ENV });
  if (!buildParsed.success) {
    const details = buildParsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid build environment: ${details}`);
  }

  const runtimeParsed = runtimeEnvSchema.safeParse({
    PAYLOAD_SECRET: source.PAYLOAD_SECRET,
    DATABASE_URL: source.DATABASE_URL,
  });
  if (!runtimeParsed.success) {
    const details = runtimeParsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid application environment: ${details}`);
  }

  return { ...buildParsed.data, ...runtimeParsed.data };
}

/**
 * Build-time env — always safe to access (includes only NODE_ENV).
 * Access runtime secrets via `runtimeEnv` inside request handlers.
 */
export const buildEnv = (() => {
  const parsed = buildEnvSchema.safeParse({ NODE_ENV: process.env.NODE_ENV });
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "env"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid build environment: ${details}`);
  }
  return parsed.data;
})();

/**
 * Runtime env — lazy, validated on first access inside a request.
 * Do NOT import this at module top level in components used for static rendering.
 */
let _runtimeEnv: (z.infer<typeof buildEnvSchema> & z.infer<typeof runtimeEnvSchema>) | undefined;

export function getRuntimeEnv() {
  if (!_runtimeEnv) {
    _runtimeEnv = parseAppEnv(process.env as Record<string, string | undefined>);
  }
  return _runtimeEnv;
}

/**
 * Legacy `env` export — uses lazy Proxy so build-time access to NODE_ENV
 * works without triggering runtime secret validation.
 */
export const env: AppEnv = new Proxy({} as AppEnv, {
  get(_target, prop: string) {
    const key = prop as keyof AppEnv;
    if (key === "NODE_ENV") {
      return buildEnv.NODE_ENV;
    }
    return getRuntimeEnv()[key];
  },
});

