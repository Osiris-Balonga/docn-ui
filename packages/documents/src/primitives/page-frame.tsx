import { Line, Page, Svg, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PrintProfile, ResolvedFixedFormat } from "../core/formats";
import { millimetersToPoints } from "../core/units";
import { getPageGeometry } from "../core/page-geometry";
import type { PdfTheme } from "../themes/themes";
import { createSafeFrame } from "./measurement";
import { PdfThemeProvider } from "./theme-context";

export interface PageFrameProps {
  /** Optional PDF background color replacing the theme canvas. */
  backgroundColor?: string;
  /** Fixed-format document content. */
  children: ReactNode;
  /** Resolved physical format and orientation. */
  format: ResolvedFixedFormat;
  /** Screen or bounded print profile with optional bleed and crop marks. */
  printProfile?: PrintProfile;
  /** Qualified PDF theme used by all child primitives. */
  theme: PdfTheme;
}

function CropMarks({
  mediaHeight,
  mediaWidth,
  stroke,
  trimInset,
}: {
  mediaHeight: number;
  mediaWidth: number;
  stroke: string;
  trimInset: number;
}) {
  const gap = millimetersToPoints(1);
  const farX = mediaWidth - trimInset;
  const farY = mediaHeight - trimInset;
  const lines: Array<readonly [number, number, number, number]> = [
    [0, trimInset, trimInset - gap, trimInset],
    [farX + gap, trimInset, mediaWidth, trimInset],
    [0, farY, trimInset - gap, farY],
    [farX + gap, farY, mediaWidth, farY],
    [trimInset, 0, trimInset, trimInset - gap],
    [farX, 0, farX, trimInset - gap],
    [trimInset, farY + gap, trimInset, mediaHeight],
    [farX, farY + gap, farX, mediaHeight],
  ];
  return (
    <Svg
      style={{ left: 0, position: "absolute", top: 0 }}
      width={mediaWidth}
      height={mediaHeight}
    >
      {lines.map(([x1, y1, x2, y2], index) => (
        <Line
          key={index}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          stroke={stroke}
          strokeWidth={0.5}
        />
      ))}
    </Svg>
  );
}

export function PageFrame({
  backgroundColor,
  children,
  format,
  printProfile = { kind: "screen" },
  theme,
}: PageFrameProps) {
  const frame = createSafeFrame(format);
  const geometry = getPageGeometry(
    format.trim.widthPt,
    format.trim.heightPt,
    printProfile,
  );
  const showCropMarks = printProfile.kind === "print" && printProfile.cropMarks;
  return (
    <Page
      size={[geometry.mediaWidth, geometry.mediaHeight]}
      style={{
        backgroundColor: showCropMarks
          ? theme.colors.surface
          : (backgroundColor ?? theme.colors.canvas),
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontWeight: theme.fonts.regularWeight,
        height: geometry.mediaHeight,
        width: geometry.mediaWidth,
      }}
    >
      <View
        style={{
          backgroundColor: backgroundColor ?? theme.colors.canvas,
          height: geometry.mediaHeight - 2 * geometry.bleedInset,
          left: geometry.bleedInset,
          position: "absolute",
          top: geometry.bleedInset,
          width: geometry.mediaWidth - 2 * geometry.bleedInset,
        }}
      />
      {showCropMarks ? (
        <CropMarks
          mediaHeight={geometry.mediaHeight}
          mediaWidth={geometry.mediaWidth}
          stroke={theme.colors.text}
          trimInset={geometry.trimInset}
        />
      ) : null}
      <PdfThemeProvider theme={theme}>
        <View
          wrap={false}
          style={{
            height: frame.height,
            left: geometry.trimInset + frame.x,
            position: "absolute",
            top: geometry.trimInset + frame.y,
            width: frame.width,
          }}
        >
          {children}
        </View>
      </PdfThemeProvider>
    </Page>
  );
}
