import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
import { assertWithinSafeFrame, createSafeFrame } from "./measurement";

function runtimeSources(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return runtimeSources(path);
    return /\.(ts|tsx)$/.test(entry) && !entry.includes(".test.") ? [path] : [];
  });
}

describe("fixed PDF layout boundaries", () => {
  it("derives the safe frame from exact physical dimensions", () => {
    const format = resolveFormat("card-85x55");
    if (format.kind !== "fixed")
      throw new Error("Expected a fixed card format.");
    const frame = createSafeFrame(format);

    expect(frame.pageWidth).toBeCloseTo(240.944_881_889_8, 6);
    expect(frame.pageHeight).toBeCloseTo(155.905_511_811, 6);
    expect(frame.x).toBeCloseTo(8.503_937_007_87, 6);
    expect(frame.width).toBeCloseTo(223.937_007_874, 6);
  });

  it("returns a structured error when measured glyphs escape the safe area", () => {
    const format = resolveFormat("card-85x55");
    if (format.kind !== "fixed")
      throw new Error("Expected a fixed card format.");
    const frame = createSafeFrame(format);

    expect(() =>
      assertWithinSafeFrame(
        { x: frame.x, y: frame.y, width: frame.width + 1, height: 10 },
        frame,
        ["pages", 0, "text"],
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "LAYOUT_OVERFLOW",
        issues: [expect.objectContaining({ path: ["pages", 0, "text"] })],
      }),
    );
  });

  it("keeps document runtime sources independent from the website and DOM CSS", () => {
    const sourceRoot = fileURLToPath(new URL("../", import.meta.url));
    const content = runtimeSources(sourceRoot)
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(content).not.toMatch(
      /from\s+["'](?:next|@\/|.*apps\/www|.*components\/ui)/,
    );
    expect(content).not.toMatch(/className=|var\(--|tailwind/i);
  });
});
