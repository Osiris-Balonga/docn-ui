import { Text as ReactPdfText } from "@react-pdf/renderer";
import { DocumentValidationError } from "../core/errors";
import { usePdfTheme } from "./theme-context";
import type { TextAlign } from "./text";
export interface PageNumberProps {
  /** Printed string containing {page} and optional {pages} placeholders. */
  format?: string;
  /** Horizontal alignment inside the available region. */
  align?: TextAlign;
}

export function assertPageNumberFormat(format: string): void {
  if (
    typeof format !== "string" ||
    format.length > 120 ||
    !format.includes("{page}") ||
    /[{}]/.test(format.replaceAll("{page}", "").replaceAll("{pages}", ""))
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "Use a page-number format of at most 120 characters with {page} and optional {pages} placeholders.",
        path: ["pageNumber", "format"],
      },
    ]);
  }
}

export function PageNumber({
  format = "Page {page} of {pages}",
  align = "right",
}: PageNumberProps) {
  const theme = usePdfTheme();
  assertPageNumberFormat(format);
  return (
    <ReactPdfText
      style={{
        color: theme.colors.mutedText,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale.caption,
        // Numeric lineHeight is multiplied again on each dynamic relayout in renderer 4.9.0.
        textAlign: align,
      }}
      render={({ pageNumber, totalPages }) =>
        format
          .replaceAll("{page}", String(pageNumber))
          .replaceAll("{pages}", String(totalPages ?? pageNumber))
      }
    />
  );
}
