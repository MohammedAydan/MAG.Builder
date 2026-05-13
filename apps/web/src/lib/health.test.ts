import { describe, expect, it } from "vitest";
import { buildHealthPayload } from "@/lib/health";

describe("buildHealthPayload", () => {
  it("returns a valid health payload shape", () => {
    const payload = buildHealthPayload();

    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("web");
    expect(payload.environment).toBe(process.env.NODE_ENV ?? "test");
    expect(() => new Date(payload.timestamp)).not.toThrow();
  });
});
