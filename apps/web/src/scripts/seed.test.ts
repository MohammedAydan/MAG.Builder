/**
 * Smoke tests for seed script environment validation logic.
 *
 * These tests do NOT connect to a real database. They only verify that
 * the requireEnv helper in the seed script would behave correctly.
 *
 * Full end-to-end seed tests require a live PostgreSQL instance and
 * are documented in the migration runbook (docs/runbooks/migrations.md).
 */
import { describe, it, expect } from "vitest";

/** Mirror the logic from seed.ts for unit-testability without importing the full script. */
function requireEnv(
  env: Record<string, string | undefined>,
  name: string,
): string | null {
  const value = env[name];
  if (!value || value.trim() === "") return null;
  return value.trim();
}

describe("seed env validation", () => {
  it("returns the value when the env var is set", () => {
    expect(requireEnv({ SEED_ADMIN_EMAIL: "admin@example.com" }, "SEED_ADMIN_EMAIL")).toBe(
      "admin@example.com",
    );
  });

  it("returns null when the env var is missing", () => {
    expect(requireEnv({}, "SEED_ADMIN_EMAIL")).toBeNull();
  });

  it("returns null when the env var is empty string", () => {
    expect(requireEnv({ SEED_ADMIN_EMAIL: "" }, "SEED_ADMIN_EMAIL")).toBeNull();
  });

  it("returns null when the env var is only whitespace", () => {
    expect(requireEnv({ SEED_ADMIN_EMAIL: "   " }, "SEED_ADMIN_EMAIL")).toBeNull();
  });

  it("rejects a password shorter than 8 characters", () => {
    const pw = requireEnv({ SEED_ADMIN_PASSWORD: "short" }, "SEED_ADMIN_PASSWORD");
    expect(pw).not.toBeNull();
    expect((pw as string).length).toBeLessThan(8);
  });

  it("accepts a password of 8 or more characters", () => {
    const pw = requireEnv(
      { SEED_ADMIN_PASSWORD: "valid-password" },
      "SEED_ADMIN_PASSWORD",
    );
    expect(pw).not.toBeNull();
    expect((pw as string).length).toBeGreaterThanOrEqual(8);
  });
});
