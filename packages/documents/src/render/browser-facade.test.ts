import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defineTemplateDescriptor,
  parseLocalImageId,
} from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import { continuousFeasibilityRenderable } from "../examples/continuous-renderable-evidence";
import type { TemplatePlanContext } from "../renderable-template";
import { renderPdf } from "./browser-facade";

vi.mock("./verified-assets.browser", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./verified-assets.browser")>();
  const { createBrowserAssetResolver } = await import("./assets.browser");
  return {
    ...actual,
    createVerifiedBrowserAssetResolver: async (baseUrl: string) =>
      createBrowserAssetResolver(baseUrl),
    withVerifiedBrowserFontPriority: async <T>(
      _resolver: unknown,
      render: () => Promise<T>,
    ) => render(),
  };
});

afterEach(() => vi.unstubAllGlobals());

describe("browser renderPdf facade boundaries", () => {
  it("rejects unknown options and cross-origin font bases", async () => {
    const browserEntry = await import("@docn-ui/documents/browser");
    expect(browserEntry.renderPdf).toBe(renderPdf);
    expect(typeof browserEntry.renderDocumentInBrowser).toBe("function");
    vi.stubGlobal("location", { origin: "https://documents.example" });

    await expect(
      renderPdf(violetFounderBusinessCardRenderable, { data: {} }, {
        unknown: true,
      } as never),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      issues: [{ path: ["runtimeOptions", "unknown"] }],
    });
    await expect(
      renderPdf(
        violetFounderBusinessCardRenderable,
        { data: {} },
        { fontAssetBaseUrl: "https://cdn.example/fonts/" },
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      issues: [{ path: ["runtimeOptions", "fontAssetBaseUrl"] }],
    });
    await expect(
      renderPdf(
        violetFounderBusinessCardRenderable,
        { data: {} },
        { fontAssetBaseUrl: "https://user:secret@documents.example/fonts/" },
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      issues: [{ path: ["runtimeOptions", "fontAssetBaseUrl"] }],
    });
  });

  it("requires the runtime-only resolver when validated data extracts an image", async () => {
    vi.stubGlobal("location", { origin: "https://documents.example" });
    const imageId = parseLocalImageId("brand-mark");
    const imageTemplate = defineTemplateDescriptor({
      ...violetFounderBusinessCardRenderable,
      extractLocalImageIds: () => [imageId],
    });

    await expect(renderPdf(imageTemplate, { data: {} })).rejects.toMatchObject({
      code: "ASSET_REJECTED",
      issues: [{ path: ["runtimeOptions", "localImageResolver"] }],
    });
  });

  it("maps unexpected plan failures without exposing their contents", async () => {
    vi.stubGlobal("location", { origin: "https://documents.example" });
    const privateValue = "PRIVATE CUSTOMER VALUE";
    const failingTemplate = defineTemplateDescriptor({
      ...violetFounderBusinessCardRenderable,
      createPlan() {
        throw new Error(privateValue);
      },
    });

    let failure: unknown;
    try {
      await renderPdf(failingTemplate, { data: {} });
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({
      code: "RENDER_FAILED",
      issues: [
        {
          message: "The PDF renderer could not complete the document.",
          path: ["document"],
        },
      ],
    });
    expect(String(failure)).not.toContain(privateValue);
  });

  it("rejects malformed continuous marker tokens before document rendering", async () => {
    vi.stubGlobal("location", { origin: "https://documents.example" });
    for (const finalMarker of [
      "",
      "A".repeat(33),
      "FINAL MARKER",
      "FINAL-MARKER",
      "final_marker",
      "É_FINAL_MARKER",
    ]) {
      const createDocument = vi.fn();
      const invalidMarkerTemplate = defineTemplateDescriptor({
        ...continuousFeasibilityRenderable,
        createPlan(context: TemplatePlanContext<Record<string, never>>) {
          const renderPlan =
            continuousFeasibilityRenderable.createPlan(context);
          if (renderPlan.kind !== "continuous")
            throw new Error("Expected continuous plan.");
          return {
            ...renderPlan,
            plan: { ...renderPlan.plan, createDocument, finalMarker },
          };
        },
      });

      await expect(
        renderPdf(invalidMarkerTemplate, { data: {} }),
      ).rejects.toMatchObject({
        code: "RENDER_FAILED",
        issues: [
          {
            path: ["template", "createPlan", "plan", "finalMarker"],
          },
        ],
      });
      expect(createDocument).not.toHaveBeenCalled();
    }
  });
});
