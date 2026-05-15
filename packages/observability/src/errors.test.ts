import { describe, it, expect } from "vitest";
import { serializeError, safeClientError } from "./errors";

describe("errors", () => {
  it("serializes an Error object", () => {
    const err = new Error("Something went wrong");
    const result = serializeError(err);
    expect(result.message).toBe("Something went wrong");
    expect(result.name).toBe("Error");
    expect(result.stack).toBeDefined();
  });

  it("returns a safe client error", () => {
    const err = new Error("Database connection failed with password X");
    const safe = safeClientError(err);
    expect(safe.error).toBe("An unexpected error occurred");
    expect((safe as any).message).toBeUndefined();
    expect((safe as any).stack).toBeUndefined();
  });
});
