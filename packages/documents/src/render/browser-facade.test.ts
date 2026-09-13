import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defineTemplateDescriptor,
  parseLocalImageId,
} from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
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
});
