import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
  PDF_RENDER_PROTOCOL_VERSION,
  ClassicResume,
  VioletFounderBusinessCard,
  classicResumeExample,
  createPdfTheme,
  fingerprintRenderRequest,
  getPdfTheme,
  renderContinuousDocumentInNode,
  renderDocumentInNode,
  validateRenderRequest,
  type ContinuousDocumentRenderPlan,
  type FixedDocumentRenderPlan,
  type RenderRequest,
  type TemplateMetadata,
} from "./index";
import {
  createComponentDocumentFlowEvidencePlan,
  createContinuousFeasibilityEvidencePlan,
} from "./examples/renderable-plan-evidence";

describe("L17 compatibility boundaries", () => {
  it("keeps flattened template props and legacy style overrides callable", () => {
    const resume = createElement(ClassicResume, {
      ...classicResumeExample,
      style: { colors: { accent: "#0f766e" } },
    });
    const card = createElement(VioletFounderBusinessCard, {
      style: {
        colors: { accent: "#0f766e" },
        slots: { violet: "#5a35d6" },
      },
    });
    expect(resume.props.name).toBe(classicResumeExample.name);
    expect(resume.props.style?.colors?.accent).toBe("#0f766e");
    expect(card.props.style?.slots?.violet).toBe("#5a35d6");
  });

  it("keeps protocol V1 validation and fingerprinting unchanged", async () => {
    const request: RenderRequest<{ name: string }> = {
      assetIds: [],
      data: { name: "Ada" },
      formatId: "a4",
      locale: "en",
      overrides: {},
      printProfile: { kind: "screen" },
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
      revision: 4,
      templateId: "resume-classic",
      templateVersion: "1.0.0",
      themeId: "editorial",
    };
    const validated = validateRenderRequest<{ name: string }>(request, {
      supportedFormatIds: ["a4"],
      supportedThemeIds: ["editorial"],
    });
    expect(PDF_RENDER_PROTOCOL_VERSION).toBe(1);
    expect(validated.request).toEqual(request);
    expect(await fingerprintRenderRequest(validated.request)).toMatch(
      /^sha256:[a-f0-9]{64}$/,
    );
  });

  it("keeps legacy metadata and advanced theme calls source-compatible", () => {
    const historicalMetadata: TemplateMetadata = {
      family: "ticket",
      id: "ticket-sample",
      schemaVersion: 1,
      supportedFormatIds: ["ticket-a6"],
      supportedThemeIds: ["neutral"],
      version: "1.0.0",
    };
    const advancedTheme = createPdfTheme("neutral", {
      spacing: { md: 9 },
      typeScale: { body: 10 },
    });
    expect(historicalMetadata.family).toBe("ticket");
    expect(advancedTheme.spacing.md).toBe(9);
    expect(advancedTheme.typeScale.body).toBe(10);
    expect("baseThemeId" in advancedTheme).toBe(false);
    expect(getPdfTheme("neutral", "#0f766e").colors.accent).toBe("#0f766e");
  });

  it("keeps advanced plan types and Node renderer exports available", () => {
    const flowEvidence = createComponentDocumentFlowEvidencePlan();
    if (flowEvidence.kind !== "flow") throw new Error("Expected flow plan.");
    const fixedPlan: FixedDocumentRenderPlan = flowEvidence.plan;

    const continuousEvidence = createContinuousFeasibilityEvidencePlan();
    if (continuousEvidence.kind !== "continuous") {
      throw new Error("Expected continuous plan.");
    }
    const continuousPlan: ContinuousDocumentRenderPlan =
      continuousEvidence.plan;

    expect(fixedPlan.format.id).toBe("a4");
    expect(continuousPlan.format.id).toBe("receipt-58");
    expect(typeof renderDocumentInNode).toBe("function");
    expect(typeof renderContinuousDocumentInNode).toBe("function");
  });
});
