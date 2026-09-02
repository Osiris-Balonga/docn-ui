import { Page, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { millimetersToPoints } from "../core/units";
import type { PdfTheme } from "../themes/themes";
import { PdfThemeProvider } from "./theme-context";

export interface ReceiptFrameProps {
  children: ReactNode;
  heightMm: number;
  theme: PdfTheme;
  widthMm: 58 | 80;
}

export function ReceiptFrame({
  children,
  heightMm,
  theme,
  widthMm,
}: ReceiptFrameProps) {
  const width = millimetersToPoints(widthMm);
  const height = millimetersToPoints(heightMm);
  const inset = millimetersToPoints(widthMm === 58 ? 4 : 6);
  return (
    <Page
      size={[width, height]}
      style={{
        backgroundColor: theme.colors.canvas,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale.body,
      }}
    >
      <PdfThemeProvider theme={theme}>
        <View style={{ padding: inset }}>{children}</View>
      </PdfThemeProvider>
    </Page>
  );
}
