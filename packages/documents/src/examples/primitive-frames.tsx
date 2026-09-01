import { Document, Text as PdfText } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import { DocumentFrame } from "../primitives/document-frame";
import { PageFrame } from "../primitives/page-frame";
import { FieldPair, Heading, Text } from "../primitives/typography";
import { Row, Separator, Stack } from "../primitives/layout";
import { PdfThemeProvider } from "../primitives/theme-context";
import type { FixedDocumentRenderPlan } from "../render/runtime";
import { getPdfTheme } from "../themes/themes";

function SharedContent() {
  return (
    <Stack gap="sm">
      <Heading>Shared component sample</Heading>
      <Row>
        <Text>One theme.</Text>
        <Text>Two page models.</Text>
      </Row>
      <FieldPair label="Contact" value="Élodie Mbemba" />
      <PdfThemeProvider theme={getPdfTheme("editorial")}>
        <Heading>Nested editorial typography.</Heading>
      </PdfThemeProvider>
      <Heading>Back to neutral typography.</Heading>
      <Separator />
    </Stack>
  );
}

export function createPrimitiveFramesPlan(): FixedDocumentRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  const theme = getPdfTheme("neutral");
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return {
    format,
    printProfile: { kind: "screen" },
    document: (
      <Document
        title="Shared PDF primitives"
        creationDate={fixedDate}
        modificationDate={fixedDate}
        language="en-GB"
      >
        <PageFrame format={format} theme={theme}>
          <SharedContent />
          <Text>Fixed page content.</Text>
        </PageFrame>
        <DocumentFrame
          format={format}
          theme={theme}
          margin={36}
          header={{
            height: 24,
            gap: 12,
            content: <Heading>Flow component specimen</Heading>,
          }}
          footer={{
            height: 18,
            gap: 12,
            content: (
              <PdfText
                style={{ fontSize: 7 }}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} of ${totalPages}`
                }
              />
            ),
          }}
        >
          <SharedContent />
          <Stack gap="sm">
            {Array.from({ length: 48 }, (_, index) => (
              <Text
                key={index}
              >{`Entry ${String(index + 1).padStart(2, "0")} - Shared body text remains inside the reserved flow area.`}</Text>
            ))}
            <Text>End of flow content.</Text>
          </Stack>
        </DocumentFrame>
      </Document>
    ),
  };
}
