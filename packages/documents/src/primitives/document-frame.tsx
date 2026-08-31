import { Page, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { ResolvedFixedFormat } from "../core/formats";
import type { PdfTheme } from "../themes/themes";
import type { LayoutBounds } from "./measurement";
import { createFlowFrame, type FlowRegionSpace } from "./flow-layout";
import { FlowFrameContext } from "./flow-context";
import { PdfThemeProvider } from "./theme-context";

export interface FlowRegion extends FlowRegionSpace {
  content: ReactNode;
}

export interface DocumentFrameProps {
  children: ReactNode;
  format: ResolvedFixedFormat;
  theme: PdfTheme;
  margin?: number;
  header?: FlowRegion;
  footer?: FlowRegion;
}

function RepeatedRegion({
  bounds,
  children,
}: {
  bounds: LayoutBounds;
  children: ReactNode;
}) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        top: bounds.y,
        left: bounds.x,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {children}
    </View>
  );
}

export function DocumentFrame({
  children,
  format,
  theme,
  ...regions
}: DocumentFrameProps) {
  const frame = createFlowFrame(format, regions);
  return (
    <Page
      wrap
      size={[frame.pageWidth, frame.pageHeight]}
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontWeight: theme.fonts.regularWeight,
        fontSize: theme.typeScale.body,
        paddingTop: frame.body.y,
        paddingBottom: frame.pageHeight - frame.body.y - frame.body.height,
        paddingLeft: frame.body.x,
        paddingRight: frame.pageWidth - frame.body.x - frame.body.width,
      }}
    >
      <PdfThemeProvider theme={theme}>
        <FlowFrameContext.Provider value={frame}>
          {regions.header ? (
            <RepeatedRegion bounds={frame.header}>
              {regions.header.content}
            </RepeatedRegion>
          ) : null}
          {regions.footer ? (
            <RepeatedRegion bounds={frame.footer}>
              {regions.footer.content}
            </RepeatedRegion>
          ) : null}
          {children}
        </FlowFrameContext.Provider>
      </PdfThemeProvider>
    </Page>
  );
}
