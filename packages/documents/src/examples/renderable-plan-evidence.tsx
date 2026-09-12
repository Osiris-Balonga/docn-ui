import { resolveFormat } from "../core/formats";
import { ComponentDocument } from "./component-document";
import { ReceiptDocument } from "../render/feasibility-fixtures";
import type { TemplateRenderPlan } from "../renderable-template";
import { getPdfTheme } from "../themes/themes";

export function createComponentDocumentFlowEvidencePlan(): TemplateRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected a fixed A4 format.");
  return {
    kind: "flow",
    plan: {
      document: <ComponentDocument />,
      format,
      printProfile: { kind: "screen" },
    },
  };
}

export function createContinuousFeasibilityEvidencePlan(): TemplateRenderPlan {
  const format = resolveFormat("receipt-58");
  if (format.kind !== "continuous") {
    throw new Error("Expected a continuous receipt format.");
  }
  const finalMarker = "DOCN_CONTINUOUS_FINAL_MARKER";
  return {
    kind: "continuous",
    plan: {
      createDocument: (heightPt) => (
        <ReceiptDocument
          finalText={finalMarker}
          height={heightPt}
          lineCount={3}
          theme={getPdfTheme("neutral")}
          width={format.widthPt}
        />
      ),
      finalMarker,
      format,
    },
  };
}
