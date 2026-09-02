import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { useContext } from "react";
import { usePdfTheme } from "../primitives/theme-context";
import { assetManifest } from "../assets/manifest";
import { createBrowserAssetResolver } from "../render/assets.browser";
import { createNodeAssetResolver } from "../render/assets.node";
import { getPdfTheme, themes } from "./themes";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
} from "../templates/style-policy";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useContext: vi.fn(),
}));

describe("portable PDF themes and declared assets", () => {
  it("requires explicit theme context without depending on fixed page geometry", () => {
    vi.mocked(useContext).mockReturnValueOnce(null);
    expect(() => usePdfTheme()).toThrow(
      "PDF primitives require PageFrame, DocumentFrame or PdfThemeProvider.",
    );
    const theme = getPdfTheme("editorial");
    vi.mocked(useContext).mockReturnValueOnce(theme);
    expect(usePdfTheme()).toBe(theme);
  });
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

  it("keeps template defaults source-owned while resolving scoped overrides", () => {
    const base = defineTemplateStyle(
      "neutral",
      { colors: { accent: "#635bff" } },
      { accentSoft: "#eeeeff" },
    );
    const resolved = resolveTemplateStyle(base, {
      colors: { accent: "#0f766e" },
      fonts: { heading: "Noto Serif" },
      slots: { accentSoft: "#ccfbf1" },
    });
    expect(base.theme.colors.accent).toBe("#635bff");
    expect(base.slots.accentSoft).toBe("#eeeeff");
    expect(resolved.theme.colors.accent).toBe("#0f766e");
    expect(resolved.theme.fonts.heading).toBe("Noto Serif");
    expect(resolved.slots.accentSoft).toBe("#ccfbf1");
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
