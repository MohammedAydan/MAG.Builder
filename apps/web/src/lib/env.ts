import { z } from "zod";

const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"])
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function parseAppEnv(source: Record<string, string | undefined>): AppEnv {
  const parsed = appEnvSchema.safeParse({
    NODE_ENV: source.NODE_ENV
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid application environment: ${details}`);
  }

  return parsed.data;
}

export const env = parseAppEnv(process.env);
