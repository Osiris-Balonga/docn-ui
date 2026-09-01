import { Document, Page, renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ComponentType, type ReactNode } from "react";
import { registerDocumentFonts } from "../../render/fonts";
import { createNodeAssetResolver } from "../../render/assets.node";
import { PdfThemeProvider } from "../../primitives/theme-context";
import { getPdfTheme } from "../../themes/themes";
import type { ThemeId } from "../../core/contracts";
import * as content from "./content";
import * as annotations from "./annotations";
import * as frames from "./frames";
import * as data from "./data";

const examples = { ...content, ...annotations, ...frames, ...data };

export function prepareExampleFonts(assetRoot: string) {
  registerDocumentFonts(createNodeAssetResolver(assetRoot));
}

export async function renderComponentExample({
  name,
  height,
  imageSource,
  themeId = "neutral",
}: {
  name: string;
  height: number;
  imageSource: string;
  themeId?: ThemeId;
}) {
  const Example = examples[name as keyof typeof examples] as
    ComponentType<{ source: string }> | undefined;
  if (!Example) throw new Error(`Missing example: ${name}`);
  const theme = getPdfTheme(themeId);
  const content: ReactNode = createElement(Example, { source: imageSource });
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return renderToBuffer(
    <Document
      title={name}
      language="en"
      creationDate={fixedDate}
      modificationDate={fixedDate}
    >
      {height ? (
        <Page
          size={[420, height]}
          style={{ padding: 24, backgroundColor: theme.colors.surface }}
        >
          <PdfThemeProvider theme={theme}>{content}</PdfThemeProvider>
        </Page>
      ) : (
        content
      )}
    </Document>,
  );
}
