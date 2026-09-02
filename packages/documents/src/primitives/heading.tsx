import {
  Text as ReactPdfText,
  type TextProps as ReactPdfTextProps,
} from "@react-pdf/renderer";
import type { TextAlign } from "./text";
import { assertDestinationId } from "./link-validation";
import { usePdfTheme } from "./theme-context";
export interface HeadingProps {
  /** Selectable heading text. */
  children: string;
  /** Semantic hierarchy mapped to the qualified PDF type scale. */
  level?: "display" | "heading" | 1 | 2 | 3 | 4 | 5 | 6;
  /** Horizontal text alignment. */
  align?: TextAlign;
  /** Optional internal PDF destination identifier. */
  id?: string;
  /** Default or inverted theme text color. */
  tone?: "default" | "inverted";
  /** Optional React PDF style overrides for source-owned compositions. */
  style?: ReactPdfTextProps["style"];
}

export function Heading({
  children,
  level = "heading",
  tone = "default",
  align,
  id,
  style,
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
      style={[
        {
          ...(align === undefined ? {} : { textAlign: align }),
          color:
            tone === "inverted" ? theme.colors.invertedText : theme.colors.text,
          fontFamily: theme.fonts.heading,
          fontSize: theme.typeScale[scale],
          fontWeight: theme.fonts.strongWeight,
          lineHeight: 1.15,
        },
        style,
      ]}
    >
      {children}
    </ReactPdfText>
  );
}
