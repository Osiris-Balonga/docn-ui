import { Document, Page, Text } from "@react-pdf/renderer";
import { defineTemplateDescriptor } from "../template-contract";
import type {
  RenderableTemplate,
  TemplatePlanContext,
  TemplateRenderPlan,
} from "../renderable-template";
import { ReceiptDocument } from "../render/feasibility-fixtures";
import { createComponentDocumentFlowEvidencePlan } from "./renderable-plan-evidence";
import { getPdfTheme } from "../themes/themes";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";

const finalMarker = "DOCN_CONTINUOUS_FINAL_MARKER";

function continuousPlan(
  context: TemplatePlanContext<Record<string, never>>,
  overflow: boolean,
): TemplateRenderPlan {
  if (context.format.kind !== "continuous") {
    throw new Error("Expected a continuous receipt format.");
  }
  const format = context.format;
  return {
    kind: "continuous",
    plan: {
      createDocument(heightPt) {
        if (overflow) {
          return (
            <Document>
              <Page size={[format.widthPt, heightPt]}>
                <Text>Overflow probe page one</Text>
              </Page>
              <Page size={[format.widthPt, heightPt]}>
                <Text>{finalMarker}</Text>
              </Page>
            </Document>
          );
        }
        return (
          <ReceiptDocument
            finalText={finalMarker}
            height={heightPt}
            lineCount={3}
            theme={getPdfTheme("neutral")}
            width={format.widthPt}
          />
        );
      },
      finalMarker,
      format,
    },
  };
}

function evidenceRenderable(overflow: boolean) {
  return defineTemplateDescriptor<
    Record<string, never>,
    RenderableTemplate<Record<string, never>>
  >({
    ...violetFounderBusinessCardRenderable,
    defaultFormatId: "receipt-58",
    supportedFormatIds: ["receipt-58"],
    supportedPrintProfileKinds: ["screen"],
    defaultPrintProfile: { kind: "screen" },
    createPlan: (context) => continuousPlan(context, overflow),
  });
}

export const continuousFeasibilityRenderable = evidenceRenderable(false);
export const continuousOverflowRenderable = evidenceRenderable(true);

export const flowFeasibilityRenderable = defineTemplateDescriptor({
  ...violetFounderBusinessCardRenderable,
  defaultFormatId: "a4" as const,
  supportedFormatIds: ["a4"] as const,
  createPlan: createComponentDocumentFlowEvidencePlan,
});
