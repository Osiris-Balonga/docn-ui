import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
    expect(staticSecurityHeaders["Content-Security-Policy"]).toContain(
      "connect-src 'self' blob: https://eu.i.posthog.com",
    );
    expect(staticSecurityHeaders["Content-Security-Policy"]).not.toContain(
      "https://*.posthog.com",
    );
  });

  it("maps the portable policy to the Vercel static deployment", () => {
    const config = JSON.parse(
      readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
    ) as {
      buildCommand: string;
      installCommand: string;
      outputDirectory: string;
      headers: Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>;
    };
    const headersFor = (source: string) =>
      Object.fromEntries(
        config.headers
          .find((rule) => rule.source === source)!
          .headers.map(({ key, value }) => [key, value]),
      );

    expect(config.installCommand).toContain("pnpm@11.24.0");
    expect(config.buildCommand).toBe("corepack pnpm@11.24.0 build");
    expect(config.outputDirectory).toBe("apps/www/out");
    expect(headersFor("/(.*)")["Cache-Control"]).toBe(
      cacheControlForPath("/docs/installation/index.html"),
    );
    expect(headersFor("/r/dev/(.*)")["Cache-Control"]).toBe(
      cacheControlForPath("/r/dev/docn-text.json"),
    );
    expect(headersFor("/_next/static/(.*)")["Cache-Control"]).toBe(
      cacheControlForPath("/_next/static/chunks/app-a1b2.js"),
    );
    expect(
      headersFor("/r/v:major(\\d+).:minor(\\d+).:patch(\\d+)/(.*)")[
        "Cache-Control"
      ],
    ).toBe(cacheControlForPath("/r/v1.0.0/docn-text.json"));
    expect(headersFor("/(.*)")["Content-Security-Policy"]).toBe(
      staticSecurityHeaders["Content-Security-Policy"],
    );

    const ignored = readFileSync(
      new URL("../../.vercelignore", import.meta.url),
      "utf8",
    ).split(/\r?\n/);
    expect(ignored).toEqual(
      expect.arrayContaining([
        ".artifacts/",
        "tmp/",
        ".codex-remote-attachments/",
        "apps/www/out/",
      ]),
    );
  });
});
