import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolveFormat } from "../core/formats";
import { assertWithinSafeFrame, createSafeFrame } from "./measurement";
import { assertFlowBlockFits, createFlowFrame } from "./flow-layout";

function runtimeSources(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return runtimeSources(path);
    return /\.(ts|tsx)$/.test(entry) && !entry.includes(".test.") ? [path] : [];
  });
}

describe("fixed PDF layout boundaries", () => {
  it("reserves repeated flow regions and bounds non-breaking blocks", () => {
    const format = resolveFormat("a4");
    if (format.kind !== "fixed") throw new Error("Expected a fixed format.");
    const frame = createFlowFrame(format, {
      margin: 36,
      header: { height: 24, gap: 12 },
      footer: { height: 18, gap: 12 },
    });
    expect(frame.body.x).toBe(36);
    expect(frame.body.y).toBe(72);
    expect(frame.body.width).toBeCloseTo(523.275590551, 6);
    expect(frame.body.height).toBeCloseTo(703.889763779, 6);
    expect(frame.footer.y).toBeCloseTo(787.889763779, 6);
    expect(() => assertFlowBlockFits(frame.body.height, frame)).not.toThrow();
    for (const height of [frame.body.height + 1, Infinity, NaN, 0, -1]) {
      expect(() =>
        assertFlowBlockFits(height, frame, ["data", "group"]),
      ).toThrowError(
        expect.objectContaining({
          code: "LAYOUT_OVERFLOW",
          issues: [expect.objectContaining({ path: ["data", "group"] })],
        }),
      );
    }
  });

  it("rejects unsupported flow formats and invalid or exhausted reservations", () => {
    const format = resolveFormat("letter");
    const card = resolveFormat("card-85x55");
    if (format.kind !== "fixed" || card.kind !== "fixed")
      throw new Error("Expected fixed formats.");
    expect(() => createFlowFrame(card)).toThrowError(
      expect.objectContaining({ code: "UNSUPPORTED_FORMAT" }),
    );
    for (const options of [
      { margin: NaN },
      { header: { height: -1 } },
      { footer: { height: 12, gap: Infinity } },
    ]) {
      expect(() => createFlowFrame(format, options)).toThrowError(
        expect.objectContaining({ code: "INVALID_DATA" }),
      );
    }
    for (const options of [
      { margin: 0 },
      { margin: 400 },
      { header: { height: 800 } },
    ]) {
      expect(() => createFlowFrame(format, options)).toThrowError(
        expect.objectContaining({ code: "LAYOUT_OVERFLOW" }),
      );
    }
    expect(createFlowFrame(format).body.height).toBeCloseTo(735.307086614, 6);
  });

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
