import { describe, expect, it } from "vitest";
import { parseAppEnv } from "@/lib/env";

describe("parseAppEnv", () => {
  it("returns the typed environment when required values exist", () => {
    expect(
      parseAppEnv({
        NODE_ENV: "production",
        PAYLOAD_SECRET: "test-secret-value",
        DATABASE_URL: "postgres://localhost:5432/nexpress",
      })
    ).toEqual({
      NODE_ENV: "production",
      PAYLOAD_SECRET: "test-secret-value",
      DATABASE_URL: "postgres://localhost:5432/nexpress",
    });
  });

  it("fails safely when required values are missing", () => {
    expect(() => parseAppEnv({})).toThrowError(/Invalid (build|application) environment/);
  });

  it("fails when PAYLOAD_SECRET is missing", () => {
    expect(() =>
      parseAppEnv({
        NODE_ENV: "development",
        DATABASE_URL: "postgres://localhost:5432/nexpress",
      })
    ).toThrowError(/PAYLOAD_SECRET/);
  });

  it("fails when DATABASE_URL is missing", () => {
    expect(() =>
      parseAppEnv({
        NODE_ENV: "development",
        PAYLOAD_SECRET: "test-secret-value",
      })
    ).toThrowError(/DATABASE_URL/);
  });
});
