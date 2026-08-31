import { Document, Page, Text, View } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import { millimetersToPoints } from "../core/units";
import { Barcode } from "../primitives/barcode";
import { PdfThemeProvider } from "../primitives/theme-context";
import type { FixedDocumentRenderPlan } from "../render/runtime";
import { getPdfTheme } from "../themes/themes";

// Short payloads are illustrative identifiers, not assigned GS1 product codes.
export const barcodeExamples = [
  { format: "code128", value: "DOCN-2026-0042", width: 240, showValue: true },
  { format: "ean13", value: "5901234123457", width: 120, showValue: true },
  {
    format: "code128",
    value: "001234567890",
    width: 121 * millimetersToPoints(0.25),
    showValue: false,
  },
  {
    format: "ean13",
    value: "0123456789012",
    width: 113 * millimetersToPoints(0.264),
    showValue: true,
  },
] as const;

export function createPrimitiveBarcodesPlan(): FixedDocumentRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  const theme = getPdfTheme("neutral");
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return {
    format,
    printProfile: { kind: "screen" },
    document: (
      <Document
        title="Vector barcode components"
        creationDate={fixedDate}
        modificationDate={fixedDate}
      >
        <Page
          size={[format.trim.widthPt, format.trim.heightPt]}
          style={{ padding: 36, fontFamily: theme.fonts.body, fontSize: 9 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 700 }}>Vector barcodes</Text>
          <Text style={{ marginTop: 8 }}>
            Black on white. Local encoding. Selectable readable values.
          </Text>
          <PdfThemeProvider theme={theme}>
            {barcodeExamples.map((example, index) => (
              <View
                key={example.value}
                style={{
                  position: "absolute",
                  left: 36,
                  top: 110 + index * 160,
                }}
              >
                <Text style={{ marginBottom: 10 }}>
                  {index + 1}.{" "}
                  {example.format === "code128" ? "Code 128" : "EAN-13"}
                  {index > 1 ? " / minimum module" : " / nominal"}
                </Text>
                <Barcode {...example} />
              </View>
            ))}
          </PdfThemeProvider>
        </Page>
      </Document>
    ),
  };
}
