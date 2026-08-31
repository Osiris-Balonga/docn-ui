import { Text as ReactPdfText, View } from "@react-pdf/renderer";
import { usePdfTheme } from "./theme-context";

type TextSize = "body" | "caption" | "label";

export interface TextProps {
  children: string;
  size?: TextSize;
  tone?: "default" | "inverted" | "muted";
}

export function Text({ children, size = "body", tone = "default" }: TextProps) {
  const theme = usePdfTheme();
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
  const theme = usePdfTheme();
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

export interface FieldPairProps {
  label: string;
  value: string;
}

export function FieldPair({ label, value }: FieldPairProps) {
  const theme = usePdfTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text size="caption" tone="muted">
        {label}
      </Text>
      <Text size="label">{value}</Text>
    </View>
  );
}
