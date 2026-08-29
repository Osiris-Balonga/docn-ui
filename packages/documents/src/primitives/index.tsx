import {
  Image as ReactPdfImage,
  Line,
  Page,
  Rect,
  Svg,
  Text as ReactPdfText,
  View,
} from "@react-pdf/renderer";
import { createContext, useContext, type ReactNode } from "react";
import QRCodeEncoder from "qrcode";
import { DocumentValidationError } from "../core/errors";
import type { PrintProfile, ResolvedFixedFormat } from "../core/formats";
import { millimetersToPoints } from "../core/units";
import { getPageGeometry } from "../render/print-profile";
import type { PdfTheme } from "../themes/themes";
import { createSafeFrame, type SafeFrame } from "./measurement";

type SpacingToken = keyof PdfTheme["spacing"];
type TextSize = "body" | "caption" | "label";

interface FrameContextValue {
  frame: SafeFrame;
  theme: PdfTheme;
}

const FrameContext = createContext<FrameContextValue | null>(null);

function useFrame(): FrameContextValue {
  const context = useContext(FrameContext);
  if (!context)
    throw new Error("PDF primitives must be composed inside PageFrame.");
  return context;
}

export interface PageFrameProps {
  backgroundColor?: string;
  children: ReactNode;
  format: ResolvedFixedFormat;
  printProfile?: PrintProfile;
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
      <FrameContext.Provider value={{ frame, theme }}>
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
      </FrameContext.Provider>
    </Page>
  );
}

export interface TextProps {
  children: string;
  size?: TextSize;
  tone?: "default" | "inverted" | "muted";
}

export function Text({ children, size = "body", tone = "default" }: TextProps) {
  const { theme } = useFrame();
  return (
    <ReactPdfText
      style={{
        color:
          tone === "muted"
            ? theme.colors.mutedText
            : tone === "inverted"
              ? theme.colors.invertedText
              : theme.colors.text,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale[size],
        fontWeight: theme.fonts.regularWeight,
        lineHeight: 1.35,
      }}
    >
      {children}
    </ReactPdfText>
  );
}

export interface HeadingProps {
  children: string;
  level?: "display" | "heading";
  tone?: "default" | "inverted";
}

export function Heading({
  children,
  level = "heading",
  tone = "default",
}: HeadingProps) {
  const { theme } = useFrame();
  return (
    <ReactPdfText
      style={{
        color:
          tone === "inverted" ? theme.colors.invertedText : theme.colors.text,
        fontFamily: theme.fonts.heading,
        fontSize: theme.typeScale[level],
        fontWeight: theme.fonts.strongWeight,
        lineHeight: 1.15,
      }}
    >
      {children}
    </ReactPdfText>
  );
}

export interface StackProps {
  children: ReactNode;
  gap?: SpacingToken;
}

export function Stack({ children, gap = "md" }: StackProps) {
  const { theme } = useFrame();
  return <View style={{ gap: theme.spacing[gap] }}>{children}</View>;
}

export interface RowProps {
  align?: "center" | "end" | "start";
  children: ReactNode;
  gap?: SpacingToken;
}

export function Row({ align = "start", children, gap = "sm" }: RowProps) {
  const { theme } = useFrame();
  const alignItems =
    align === "end" ? "flex-end" : align === "start" ? "flex-start" : "center";
  return (
    <View style={{ alignItems, flexDirection: "row", gap: theme.spacing[gap] }}>
      {children}
    </View>
  );
}

export interface SeparatorProps {
  spacing?: SpacingToken;
}

export function Separator({ spacing = "sm" }: SeparatorProps) {
  const { theme } = useFrame();
  return (
    <View
      style={{
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 0.5,
        marginVertical: theme.spacing[spacing],
      }}
    />
  );
}

export interface ImageProps {
  alt: string;
  height: number;
  resolvedSource: string;
  width: number;
}

export interface QRCodeProps {
  backgroundColor?: string;
  color?: string;
  payload: string;
  size: number;
}

export function QRCode({
  backgroundColor = "#ffffff",
  color = "#111111",
  payload,
  size,
}: QRCodeProps) {
  if (new TextEncoder().encode(payload).byteLength > 512) {
    throw new DocumentValidationError([
      {
        code: "LIMIT_EXCEEDED",
        message: "QR payload exceeds 512 UTF-8 bytes.",
        path: ["data", "qrPayload"],
      },
    ]);
  }
  const code = QRCodeEncoder.create(payload, { errorCorrectionLevel: "M" });
  const quietZone = 4;
  const matrixSize = code.modules.size;
  const totalModules = matrixSize + quietZone * 2;
  if (size / totalModules < 1) {
    throw new DocumentValidationError([
      {
        code: "QR_TOO_DENSE",
        message: "QR content is too dense for the selected card layout.",
        path: ["data", "qrPayload"],
      },
    ]);
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalModules} ${totalModules}`}
    >
      <Rect width={totalModules} height={totalModules} fill={backgroundColor} />
      {Array.from({ length: matrixSize }, (_, row) =>
        Array.from({ length: matrixSize }, (_, column) =>
          code.modules.get(row, column) ? (
            <Rect
              key={`${row}-${column}`}
              x={column + quietZone}
              y={row + quietZone}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

export function Image({ alt, height, resolvedSource, width }: ImageProps) {
  return (
    <ReactPdfImage
      src={{ uri: resolvedSource }}
      style={{ height, objectFit: "contain", width }}
      aria-label={alt}
    />
  );
}

export interface FieldPairProps {
  label: string;
  value: string;
}

export function FieldPair({ label, value }: FieldPairProps) {
  const { theme } = useFrame();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text size="caption" tone="muted">
        {label}
      </Text>
      <Text size="label">{value}</Text>
    </View>
  );
}

export { assertWithinSafeFrame, createSafeFrame } from "./measurement";
export type { LayoutBounds, SafeFrame } from "./measurement";
