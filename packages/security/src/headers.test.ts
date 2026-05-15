import { describe, it, expect } from "vitest";
import { defaultSecurityHeaders, getCspHeader } from "./headers";

describe("security headers", () => {
  it("provides default security headers", () => {
    expect(defaultSecurityHeaders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "X-Frame-Options" })
      ])
    );
  });

  it("provides CSP header", () => {
    const csp = getCspHeader();
    expect(csp.key).toBe("Content-Security-Policy");
    expect(csp.value).toContain("default-src 'self'");
    expect(csp.value).toContain("unsafe-eval");
  });
});
