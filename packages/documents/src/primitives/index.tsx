import {
  Image as ReactPdfImage,
  Page,
  Text as ReactPdfText,
  View,
} from "@react-pdf/renderer";
import { createContext, useContext, type ReactNode } from "react";
import type { ResolvedFixedFormat } from "../core/formats";
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
  theme: PdfTheme;
}

export function PageFrame({
  backgroundColor,
  children,
  format,
  theme,
}: PageFrameProps) {
  const frame = createSafeFrame(format);
  return (
    <Page
      size={[frame.pageWidth, frame.pageHeight]}
      style={{
        backgroundColor: backgroundColor ?? theme.colors.canvas,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontWeight: theme.fonts.regularWeight,
        height: frame.pageHeight,
        width: frame.pageWidth,
      }}
    >
      <FrameContext.Provider value={{ frame, theme }}>
        <View
          wrap={false}
          style={{
            height: frame.height,
            left: frame.x,
            position: "absolute",
            top: frame.y,
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
  tone?: "default" | "muted";
}

export function Text({ children, size = "body", tone = "default" }: TextProps) {
  const { theme } = useFrame();
  return (
    <ReactPdfText
      style={{
        color: tone === "muted" ? theme.colors.mutedText : theme.colors.text,
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
}

export function Heading({ children, level = "heading" }: HeadingProps) {
  const { theme } = useFrame();
  return (
    <ReactPdfText
      style={{
        color: theme.colors.text,
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
