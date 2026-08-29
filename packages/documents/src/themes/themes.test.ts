import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute } from "node:path";
import { describe, expect, it } from "vitest";
import { assetManifest } from "../assets/manifest";
import { createBrowserAssetResolver } from "../render/assets.browser";
import { createNodeAssetResolver } from "../render/assets.node";
import { getPdfTheme, themes } from "./themes";

describe("portable PDF themes and declared assets", () => {
  it("keeps all theme values bounded and engine-compatible", () => {
    expect(Object.keys(themes)).toEqual(["neutral", "editorial", "bold"]);
    const serialized = JSON.stringify(themes);
    expect(serialized).not.toMatch(/var\(|oklch|className|tailwind/i);
    expect(themes.editorial.fonts.heading).toBe("Noto Serif");
    expect(themes.bold.typeScale.display).toBeLessThanOrEqual(32);
    expect(getPdfTheme("neutral", "#0f766e").colors.accent).toBe("#0f766e");
    expect(() => getPdfTheme("website-dark")).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: ["themeId"] })],
      }),
    );
  });

  it("resolves only manifest IDs to controlled browser and Node sources", () => {
    const browser = createBrowserAssetResolver(
      "https://docs.example.test/path",
    );
    const node = createNodeAssetResolver();
    for (const asset of assetManifest.assets) {
      expect(browser.resolve(asset.id).source).toBe(
        `https://docs.example.test${asset.publicPath}`,
      );
      const nodeSource = node.resolve(asset.id).source;
      expect(isAbsolute(nodeSource)).toBe(true);
      const bytes = readFileSync(nodeSource);
      expect(bytes.byteLength).toBe(asset.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        asset.sha256,
      );
    }
    for (const rejected of [
      "https://example.test/font.woff",
      "../../secret",
      "C:\\secret.woff",
    ]) {
      expect(() => node.resolve(rejected)).toThrowError(
        expect.objectContaining({ code: "ASSET_REJECTED" }),
      );
    }
  });
});
