import { describe, it, expect } from "vitest";
import { redactSensitiveFields } from "./redaction";

describe("redaction", () => {
  it("redacts default sensitive fields", () => {
    const data = {
      name: "John",
      password: "secretpassword123",
      nested: {
        token: "abcdef12345",
        age: 30
      }
    };

    const result = redactSensitiveFields(data) as any;

    expect(result.name).toBe("John");
    expect(result.password).toBe("[REDACTED]");
    expect(result.nested.token).toBe("[REDACTED]");
    expect(result.nested.age).toBe(30);
  });

  it("handles null and arrays safely", () => {
    const data = {
      list: [{ API_KEY: "secret" }, null, "string"]
    };

    const result = redactSensitiveFields(data) as any;

    expect(result.list[0].API_KEY).toBe("[REDACTED]");
    expect(result.list[1]).toBeNull();
    expect(result.list[2]).toBe("string");
  });
});
