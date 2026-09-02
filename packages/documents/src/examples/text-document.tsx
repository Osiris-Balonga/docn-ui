import { Document, Page } from "@react-pdf/renderer";
import { Text } from "../primitives/text";
import { PdfThemeProvider } from "../primitives/theme-context";
import { getPdfTheme } from "../themes/themes";

export function TextDocument() {
  return (
    <Document
      title="A source-owned Text component"
      creationDate={new Date("2026-01-15T12:00:00Z")}
      modificationDate={new Date("2026-01-15T12:00:00Z")}
    >
      <Page size="A4" style={{ padding: 36 }}>
        <PdfThemeProvider theme={getPdfTheme("neutral")}>
          <Text>Source-owned text. Bonjour Élodie.</Text>
        </PdfThemeProvider>
      </Page>
    </Document>
  );
}
