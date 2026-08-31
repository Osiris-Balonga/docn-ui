import { Text as ReactPdfText, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { assertDestinationId } from "./link-validation";
import { usePdfTheme } from "./theme-context";

export type TextSize = "body" | "caption" | "label";
export type TextAlign = "left" | "center" | "right" | "justify";

export interface TextProps {
  children: ReactNode;
  align?: TextAlign;
  weight?: "regular" | "strong";
  id?: string;
  size?: TextSize;
  tone?: "default" | "inverted" | "muted";
}

export function Text({
  children,
  size = "body",
  tone = "default",
  align,
  weight = "regular",
  id,
}: TextProps) {
  const theme = usePdfTheme();
  if (id !== undefined) assertDestinationId(id);
  return (
    <ReactPdfText
      {...(id === undefined ? {} : { id })}
      style={{
        ...(align === undefined ? {} : { textAlign: align }),
        color:
          tone === "muted"
            ? theme.colors.mutedText
            : tone === "inverted"
              ? theme.colors.invertedText
              : theme.colors.text,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale[size],
        fontWeight:
          weight === "strong"
            ? theme.fonts.strongWeight
            : theme.fonts.regularWeight,
        lineHeight: 1.35,
      }}
    >
      {children}
    </ReactPdfText>
  );
}

export interface HeadingProps {
  children: string;
  level?: "display" | "heading" | 1 | 2 | 3 | 4 | 5 | 6;
  align?: TextAlign;
  id?: string;
  tone?: "default" | "inverted";
}

export function Heading({
  children,
  level = "heading",
  tone = "default",
  align,
  id,
}: HeadingProps) {
  const theme = usePdfTheme();
  if (id !== undefined) assertDestinationId(id);
  const scale =
    typeof level === "number"
      ? (
          {
            1: "display",
            2: "heading",
            3: "label",
            4: "body",
            5: "caption",
            6: "caption",
          } as const
        )[level]
      : level;
  return (
    <ReactPdfText
      {...(id === undefined ? {} : { id })}
      style={{
        ...(align === undefined ? {} : { textAlign: align }),
        color:
          tone === "inverted" ? theme.colors.invertedText : theme.colors.text,
        fontFamily: theme.fonts.heading,
        fontSize: theme.typeScale[scale],
        fontWeight: theme.fonts.strongWeight,
        lineHeight: 1.15,
      }}
    >
      {children}
    </ReactPdfText>
  );
}

export interface FieldPairProps {
  label: string;
  value: string;
  orientation?: "vertical" | "horizontal";
}

export function FieldPair({
  label,
  value,
  orientation = "vertical",
}: FieldPairProps) {
  const theme = usePdfTheme();
  if (orientation === "horizontal")
    return (
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text size="caption" tone="muted">
            {label}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text size="label">{value}</Text>
        </View>
      </View>
    );
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text size="caption" tone="muted">
        {label}
      </Text>
      <Text size="label">{value}</Text>
    </View>
  );
}

export { FieldPair as KeyValue };
export type KeyValueProps = FieldPairProps;
