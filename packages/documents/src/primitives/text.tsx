import { Text as ReactPdfText } from "@react-pdf/renderer";
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
