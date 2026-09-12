import { describe, expect, it } from "vitest";
import { templateCatalog } from "./catalog/manifest";
import {
  createComponentDocumentFlowEvidencePlan,
  createContinuousFeasibilityEvidencePlan,
} from "./examples/renderable-plan-evidence";
import { ReceiptDocument } from "./render/feasibility-fixtures";
import { ComponentDocument } from "./examples/component-document";
import {
  createLegacyTemplateStyleProjection,
  type TemplatePlanContext,
} from "./renderable-template";
import {
  createFontManifestIdentity,
  normalizeTemplateInput,
} from "./template-contract";
import { TEMPLATE_IDS, assertTemplateIdSubset } from "./template-ids";
import {
  getRenderableTemplate,
  renderableTemplates,
  violetFounderBusinessCardRenderable,
} from "./templates/renderable";
import { VioletFounderBusinessCard } from "./templates/business-cards/violet-founder-business-card";
import { createPdfTheme, getPdfTheme } from "./themes/themes";

async function createContext(
  theme?: ReturnType<typeof createPdfTheme>,
  themeWasExplicit = false,
): Promise<
  TemplatePlanContext<
    (typeof violetFounderBusinessCardRenderable)["defaultData"]
  >
> {
  const resolvedTheme = theme ?? getPdfTheme("neutral");
  const fontManifestIdentity = await createFontManifestIdentity(resolvedTheme);
  const normalized = normalizeTemplateInput(
    violetFounderBusinessCardRenderable,
    { data: {}, ...(theme ? { theme } : {}) },
    { fontManifestIdentity, localImageDescriptors: [] },
  );
  const legacyStyle = createLegacyTemplateStyleProjection(
    violetFounderBusinessCardRenderable,
    normalized.theme,
    themeWasExplicit,
  );
  return {
    data: normalized.data,
    format: normalized.format,
    ...(legacyStyle ? { legacyStyle } : {}),
    localImages: new Map(),
    locale: normalized.locale,
    printProfile: normalized.printProfile,
    resolvedTheme: normalized.theme,
  };
}

describe("renderable template contracts", () => {
  it("covers the canonical 18 IDs and six current catalog families", () => {
    expect(new Set(TEMPLATE_IDS)).toEqual(
      new Set(templateCatalog.map(({ id }) => id)),
    );
    expect(new Set(templateCatalog.map(({ family }) => family))).toEqual(
      new Set([
        "badge",
        "business-card",
        "invoice",
        "receipt",
        "report",
        "resume",
      ]),
    );
    expect(() =>
      assertTemplateIdSubset(Object.keys(renderableTemplates)),
    ).not.toThrow();
    for (const [id, template] of Object.entries(renderableTemplates)) {
      expect(template.id).toBe(id);
    }
    expect(() =>
      assertTemplateIdSubset([
        "business-card-violet-founder",
        "business-card-violet-founder",
      ]),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));
  });

  it("resolves only the static trusted fixed-template adapter", () => {
    expect(getRenderableTemplate("business-card-violet-founder")).toBe(
      violetFounderBusinessCardRenderable,
    );
    expect(getRenderableTemplate("resume-classic")).toBeUndefined();
  });

  it("preserves the fixed component and source-owned style when theme is omitted", async () => {
    const context = await createContext();
    expect(context.legacyStyle).toBeUndefined();
    expect(Object.isFrozen(context.resolvedTheme.theme)).toBe(true);
    const result = violetFounderBusinessCardRenderable.createPlan(context);
    expect(result.kind).toBe("fixed");
    if (result.kind !== "fixed") throw new Error("Expected fixed evidence.");
    expect(result.plan.document.type).toBe(VioletFounderBusinessCard);
    expect(result.plan.document.props).not.toHaveProperty("style");
    expect(result.plan.format.id).toBe("card-85x55");
  });

  it("projects only explicit color differences into the legacy style prop", async () => {
    const theme = createPdfTheme({
      baseThemeId: "neutral",
      colors: { accent: "#123456" },
    });
    const context = await createContext(theme, true);
    expect(context.legacyStyle).toEqual({ colors: { accent: "#123456" } });
    expect(context.legacyStyle).not.toHaveProperty("typeScale");
    expect(context.legacyStyle).not.toHaveProperty("spacing");
    const result = violetFounderBusinessCardRenderable.createPlan(context);
    if (result.kind !== "fixed") throw new Error("Expected fixed evidence.");
    expect(result.plan.document.props).toMatchObject({
      style: { colors: { accent: "#123456" } },
    });
  });

  it("wraps the existing flow and continuous specimens without catalog receipt migration", () => {
    const flow = createComponentDocumentFlowEvidencePlan();
    expect(flow.kind).toBe("flow");
    if (flow.kind !== "flow") throw new Error("Expected flow evidence.");
    expect(flow.plan.document.type).toBe(ComponentDocument);
    expect(flow.plan.format.kind).toBe("fixed");

    const continuous = createContinuousFeasibilityEvidencePlan();
    expect(continuous.kind).toBe("continuous");
    if (continuous.kind !== "continuous") {
      throw new Error("Expected continuous evidence.");
    }
    expect(continuous.plan.format.kind).toBe("continuous");
    expect(continuous.plan.createDocument(240).type).toBe(ReceiptDocument);
    expect(continuous.plan.finalMarker).toBe("DOCN_CONTINUOUS_FINAL_MARKER");
  });
});
