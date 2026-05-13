import { describe, expect, it } from "vitest";
import { parseAppEnv } from "@/lib/env";

describe("parseAppEnv", () => {
  it("returns the typed environment when required values exist", () => {
    expect(parseAppEnv({ NODE_ENV: "production" })).toEqual({
      NODE_ENV: "production"
    });
  });

  it("fails safely when required values are missing", () => {
    expect(() => parseAppEnv({})).toThrowError(/Invalid application environment/);
  });
});
