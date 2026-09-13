import { createReadStream } from "node:fs";
import { readFile, rm, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { build } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { renderPdf as renderPdfInNode } from "../../packages/documents/src/render/node-entry";
import {
  continuousFeasibilityRenderable,
  continuousOverflowRenderable,
} from "../../packages/documents/src/examples/continuous-renderable-evidence";
import { violetFounderBusinessCardRenderable } from "../../packages/documents/src/templates/renderable";

const fixture = resolve("tests/fixtures/browser-render-facade");
const output = resolve(fixture, "dist");

beforeAll(async () => {
  await rm(output, { force: true, recursive: true });
  await build({ configFile: resolve(fixture, "vite.config.mjs") });
}, 120_000);

afterAll(() => rm(output, { force: true, recursive: true }));

describe("browser renderPdf package fixture", () => {
  it("builds and renders one same-origin PDF in Chromium", async () => {
    const server = createServer(async (request, response) => {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      const target = resolve(
        output,
        pathname === "/" ? "index.html" : `.${pathname}`,
      );
      if (!target.startsWith(output)) {
        response.writeHead(403).end();
        return;
      }
      try {
        await stat(target);
        response.setHeader(
          "content-type",
          target.endsWith(".js")
            ? "text/javascript"
            : target.endsWith(".woff")
              ? "font/woff"
              : "text/html",
        );
        createReadStream(target).pipe(response);
      } catch {
        response.writeHead(404).end();
      }
    });
    await new Promise<void>((resolveListen) =>
      server.listen(0, "127.0.0.1", resolveListen),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test port.");
    const origin = `http://127.0.0.1:${address.port}`;
    const browser = await chromium.launch({ headless: true });
    const requestedOrigins = new Set<string>();
    try {
      const page = await browser.newPage();
      page.on("request", (request) => {
        if (request.url().startsWith("http")) {
          requestedOrigins.add(new URL(request.url()).origin);
        }
      });
      await page.goto(origin);
      await expect
        .poll(() => page.locator("#status").textContent(), { timeout: 30_000 })
        .toBe("ready");
      const browserResult = await page.evaluate(
        () => window.__docnBrowserResult,
      );
      const nodeResult = await renderPdfInNode(
        violetFounderBusinessCardRenderable,
        { data: {}, revision: 23 },
      );
      const nodeContinuous = await renderPdfInNode(
        continuousFeasibilityRenderable,
        { data: {}, revision: 24 },
      );

      expect(browserResult).toMatchObject({
        firstCopyHeader: "%PDF",
        continuous: {
          fingerprint: nodeContinuous.fingerprint,
          pageCount: 1,
        },
        fingerprint: nodeResult.fingerprint,
        flow: { pageCount: 1 },
        fontSourceCounts: expect.any(Array),
        pageCount: 2,
        revision: 23,
        secondCopyHeader: "%PDF",
        worker: {
          latestRevision: 102,
          staleDuringReplacement: true,
          superseded: true,
          timedOut: true,
          terminatedOnNavigation: true,
        },
      });
      expect(browserResult?.sizes).toHaveLength(2);
      expect(browserResult?.fontSourceCounts).toHaveLength(5);
      expect(new Set(browserResult?.fontSourceCounts)).toEqual(new Set([8]));
      for (const size of browserResult?.sizes ?? []) {
        expect(size.widthMm).toBeCloseTo(85, 2);
        expect(size.heightMm).toBeCloseTo(55, 2);
      }
      expect(browserResult?.continuous.widthMm).toBeCloseTo(58, 2);
      expect(browserResult?.continuous.heightMm).toBeCloseTo(
        nodeContinuous.finalDimensions[0]!.heightMm,
        2,
      );
      expect(browserResult?.flow.widthMm).toBeCloseTo(210, 2);
      expect(browserResult?.flow.heightMm).toBeCloseTo(297, 2);
      await expect(
        renderPdfInNode(continuousOverflowRenderable, {
          data: {},
          revision: 25,
        }),
      ).rejects.toMatchObject({ code: "LAYOUT_OVERFLOW" });
      expect([...requestedOrigins]).toEqual([origin]);
      expect(
        (await readFile(resolve(output, "index.html"))).byteLength,
      ).toBeGreaterThan(0);
    } finally {
      await browser.close();
      await new Promise<void>((resolveClose, rejectClose) =>
        server.close((error) => (error ? rejectClose(error) : resolveClose())),
      );
    }
  });
});
