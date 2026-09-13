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
  const fontFamily = context.resolvedTheme.theme.fonts.body;
  return {
    kind: "continuous",
    plan: {
      createDocument(heightPt) {
        if (overflow) {
          return (
            <Document>
              <Page size={[format.widthPt, heightPt]} style={{ fontFamily }}>
                <Text>Overflow probe page one</Text>
              </Page>
              <Page size={[format.widthPt, heightPt]} style={{ fontFamily }}>
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

function finalFailureRenderable(
  mode: "missing-marker" | "non-terminal-marker" | "two-pages",
) {
  return defineTemplateDescriptor<
    Record<string, never>,
    RenderableTemplate<Record<string, never>>
  >({
    ...continuousFeasibilityRenderable,
    createPlan(context) {
      const renderPlan = continuousPlan(context, false);
      if (renderPlan.kind !== "continuous") {
        throw new Error("Expected a continuous evidence plan.");
      }
      const { format } = renderPlan.plan;
      const fontFamily = context.resolvedTheme.theme.fonts.body;
      return {
        ...renderPlan,
        plan: {
          ...renderPlan.plan,
          createDocument(heightPt) {
            if (Math.abs(heightPt - format.maxHeightPt) < 0.01) {
              return renderPlan.plan.createDocument(heightPt);
            }
            if (mode === "two-pages") {
              return (
                <Document>
                  <Page
                    size={[format.widthPt, heightPt]}
                    style={{ fontFamily }}
                  >
                    <Text>Final render page one</Text>
                  </Page>
                  <Page
                    size={[format.widthPt, heightPt]}
                    style={{ fontFamily }}
                  >
                    <Text>{finalMarker}</Text>
                  </Page>
                </Document>
              );
            }
            return (
              <Document>
                <Page
                  size={[format.widthPt, heightPt]}
                  style={{ fontFamily, padding: 12 }}
                  wrap={false}
                >
                  <Text>Final render content</Text>
                  {mode === "non-terminal-marker" ? (
                    <Text>{finalMarker}</Text>
                  ) : null}
                  <Text>Trailing final content</Text>
                </Page>
              </Document>
            );
          },
        },
      };
    },
  });
}

export const continuousFinalOverflowRenderable =
  finalFailureRenderable("two-pages");
export const continuousMissingFinalMarkerRenderable =
  finalFailureRenderable("missing-marker");
export const continuousNonTerminalMarkerRenderable = finalFailureRenderable(
  "non-terminal-marker",
);

export const flowFeasibilityRenderable = defineTemplateDescriptor({
  ...violetFounderBusinessCardRenderable,
  defaultFormatId: "a4" as const,
  supportedFormatIds: ["a4"] as const,
  createPlan: createComponentDocumentFlowEvidencePlan,
});
