import { describe, expect, it } from "vitest";
import {
  cacheControlForPath,
  staticSecurityHeaders,
} from "./static-policy.mjs";

describe("portable static hosting policy", () => {
  it("keeps current content fresh and only caches immutable paths long-term", () => {
    expect(cacheControlForPath("/docs/installation/index.html")).toBe(
      "public, max-age=0, must-revalidate",
    );
    expect(cacheControlForPath("/r/dev/docn-text.json")).toBe(
      "no-cache, no-store, must-revalidate",
    );
    expect(cacheControlForPath("/_next/static/chunks/app-a1b2.js")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(cacheControlForPath("/r/v1.0.0/docn-text.json")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(staticSecurityHeaders["X-Content-Type-Options"]).toBe("nosniff");
    expect(staticSecurityHeaders["Content-Security-Policy"]).toContain(
      "worker-src 'self' blob:",
    );
  });
});
