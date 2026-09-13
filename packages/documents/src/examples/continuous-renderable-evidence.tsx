import { Document, Page, Text, View } from "@react-pdf/renderer";
import { defineTemplateDescriptor } from "../template-contract";
import type {
  RenderableTemplate,
  TemplatePlanContext,
  TemplateRenderPlan,
} from "../renderable-template";
import { createComponentDocumentFlowEvidencePlan } from "./renderable-plan-evidence";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import type { PdfTheme } from "../themes/themes";

const finalMarker = "DOCN_CONTINUOUS_FINAL_MARKER";
const maximumLengthFinalMarker = "DOCN_CONTINUOUS_FINAL_MARKER_123";
const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function ContinuousEvidenceDocument({
  finalText,
  height,
  theme,
  width,
}: {
  finalText: string;
  height: number;
  theme: PdfTheme;
  width: number;
}) {
  const rows = Array.from({ length: 3 }, (_, index) => index + 1);
  return (
    <Document
      title="docn-ui continuous facade evidence"
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language="en-US"
    >
      <Page
        size={[width, height]}
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
          fontSize: 8,
          lineHeight: 1.3,
          padding: 12,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: 13,
            fontWeight: theme.fonts.strongWeight,
            marginBottom: 8,
          }}
        >
          Nzela Corner Store
        </Text>
        <Text
          style={{
            color: theme.colors.mutedText,
            fontSize: 7,
            marginBottom: 8,
          }}
        >
          Receipt Q-2026-0115 · 15 Jan 2026 · 13:00
        </Text>
        {rows.map((row) => (
          <View
            key={row}
            style={{
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 0.5,
              flexDirection: "row",
              gap: 5,
              paddingVertical: 3,
            }}
            wrap={false}
          >
            <Text style={{ flex: 1 }}>
              {row.toString().padStart(2, "0")} · Roasted cassava flour with
              spice blend
            </Text>
            <Text style={{ textAlign: "right", width: 34 }}>
              {(row * 1.25).toFixed(2)}
            </Text>
          </View>
        ))}
        <Text style={{ fontSize: 10, marginTop: 9, textAlign: "right" }}>
          TOTAL 18.75 USD
        </Text>
        <Text style={{ fontSize: 6, marginTop: 8 }} wrap={false}>
          {finalText}
        </Text>
      </Page>
    </Document>
  );
}

function continuousPlan(
  context: TemplatePlanContext<Record<string, never>>,
  overflow: boolean,
  marker = finalMarker,
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
                <Text wrap={false}>{marker}</Text>
              </Page>
            </Document>
          );
        }
        return (
          <ContinuousEvidenceDocument
            finalText={marker}
            height={heightPt}
            theme={context.resolvedTheme.theme}
            width={format.widthPt}
          />
        );
      },
      finalMarker: marker,
      format,
    },
  };
}

function evidenceRenderable(overflow: boolean, marker = finalMarker) {
  return defineTemplateDescriptor<
    Record<string, never>,
    RenderableTemplate<Record<string, never>>
  >({
    ...violetFounderBusinessCardRenderable,
    defaultFormatId: "receipt-58",
    supportedFormatIds: ["receipt-58"],
    supportedPrintProfileKinds: ["screen"],
    defaultPrintProfile: { kind: "screen" },
    createPlan: (context) => continuousPlan(context, overflow, marker),
  });
}

export const continuousFeasibilityRenderable = evidenceRenderable(false);
export const continuousMaximumMarkerRenderable = evidenceRenderable(
  false,
  maximumLengthFinalMarker,
);
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
