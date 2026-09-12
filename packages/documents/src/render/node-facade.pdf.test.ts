import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { renderPdf } from "@docn-ui/documents/node";
import { createComponentDocumentFlowEvidencePlan } from "../examples/renderable-plan-evidence";
import {
  defineTemplateDescriptor,
  parseLocalImageId,
  type TemplateRenderInput,
} from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import { createPdfTheme } from "../themes/themes";
import type { TemplatePlanContext } from "../renderable-template";

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
    const rootEntry = await import("../index");
    expect(rootEntry).not.toHaveProperty("normalizeTemplateInputForRender");

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

  it("captures explicit theme intent before awaiting runtime preparation", async () => {
    const imageId = parseLocalImageId("brand-mark");
    let projectedAccent: string | undefined;
    const imageTemplate = defineTemplateDescriptor({
      ...violetFounderBusinessCardRenderable,
      extractLocalImageIds: () => [imageId],
      createPlan(context: TemplatePlanContext<Record<string, never>>) {
        projectedAccent = context.legacyStyle?.colors?.accent;
        return violetFounderBusinessCardRenderable.createPlan(context);
      },
    });
    const input: TemplateRenderInput<Record<string, never>> = {
      data: {},
      theme: createPdfTheme({
        baseThemeId: "neutral",
        colors: { accent: "#6d28d9" },
      }),
    };

    await renderPdf(imageTemplate, input, {
      localImageResolver: async () => {
        delete input.theme;
        return {
          bytes: new Uint8Array(
            Buffer.from(
              "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAABlBMVEX/AAAAAP9sof2OAAAACklEQVR4nGNwAAAAQgBBKTf07wAAAABJRU5ErkJggg==",
              "base64",
            ),
          ),
          declaredMimeType: "image/png",
        };
      },
    });

    expect(projectedAccent).toBe("#6d28d9");
  });
});
