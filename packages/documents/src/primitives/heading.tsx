import { Text as ReactPdfText } from "@react-pdf/renderer";
import type { TextAlign } from "./text";
import { assertDestinationId } from "./link-validation";
import { usePdfTheme } from "./theme-context";
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
