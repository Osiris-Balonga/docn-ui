import {
  Text as ReactPdfText,
  type TextProps as ReactPdfTextProps,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { assertDestinationId } from "./link-validation";
import { usePdfTheme } from "./theme-context";
export type TextSize = "body" | "caption" | "label";
export type TextAlign = "left" | "center" | "right" | "justify";

export interface TextProps {
  /** Selectable PDF content. */
  children: ReactNode;
  /** Horizontal text alignment. */
  align?: TextAlign;
  /** Qualified regular or strong font weight. */
  weight?: "regular" | "strong";
  /** Optional internal PDF destination identifier. */
  id?: string;
  /** Theme typography scale. */
  size?: TextSize;
  /** Theme-relative text color role. */
  tone?: "default" | "inverted" | "muted";
  /** Optional React PDF style overrides for source-owned compositions. */
  style?: ReactPdfTextProps["style"];
}

export function Text({
  children,
  size = "body",
  tone = "default",
  align,
  weight = "regular",
  id,
  style,
}: TextProps) {
  const theme = usePdfTheme();
  if (id !== undefined) assertDestinationId(id);
  return (
    <ReactPdfText
      {...(id === undefined ? {} : { id })}
      style={[
        {
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
        },
        style,
      ]}
    >
      {children}
    </ReactPdfText>
  );
}
