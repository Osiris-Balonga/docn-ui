import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createComponentDocumentFlowEvidencePlan } from "../examples/renderable-plan-evidence";
import { defineTemplateDescriptor } from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import { renderPdf } from "./node";

const temporaryDirectories: string[] = [];
const flowEvidenceRenderable = defineTemplateDescriptor({
  ...violetFounderBusinessCardRenderable,
  defaultFormatId: "a4" as const,
  supportedFormatIds: ["a4"] as const,
  createPlan: createComponentDocumentFlowEvidencePlan,
});

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("Node renderPdf facade", () => {
  it("returns the exact structured result for a fixed template", async () => {
    const result = await renderPdf(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 17,
    });

    expect(Object.keys(result).sort()).toEqual([
      "diagnostics",
      "finalDimensions",
      "fingerprint",
      "pageCount",
      "pdfBytes",
      "revision",
    ]);
    expect(result.revision).toBe(17);
    expect(result.pageCount).toBe(2);
    expect(result.finalDimensions).toHaveLength(2);
    for (const dimensions of result.finalDimensions) {
      expect(dimensions.widthMm).toBeCloseTo(85, 2);
      expect(dimensions.heightMm).toBeCloseTo(55, 2);
    }
    expect(result.diagnostics).toEqual([]);
    expect(result.fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(new TextDecoder().decode(result.pdfBytes.slice(0, 4))).toBe("%PDF");
  });

  it("defaults a one-shot revision and renders the existing flow specimen", async () => {
    const fixed = await renderPdf(violetFounderBusinessCardRenderable, {
      data: {},
    });
    expect(fixed.revision).toBe(1);

    const flow = await renderPdf(flowEvidenceRenderable, { data: {} });
    expect(flow.pageCount).toBe(1);
    expect(new TextDecoder().decode(flow.pdfBytes.slice(0, 4))).toBe("%PDF");
  });

  it("rejects invalid runtime options and missing qualified fonts", async () => {
    await expect(
      renderPdf(violetFounderBusinessCardRenderable, { data: {} }, {
        unknown: true,
      } as never),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      issues: [{ path: ["runtimeOptions", "unknown"] }],
    });

    const emptyDirectory = await mkdtemp(join(tmpdir(), "docn-l18-fonts-"));
    temporaryDirectories.push(emptyDirectory);
    await expect(
      renderPdf(
        violetFounderBusinessCardRenderable,
        { data: {} },
        { fontAssetDirectory: emptyDirectory },
      ),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });
});
