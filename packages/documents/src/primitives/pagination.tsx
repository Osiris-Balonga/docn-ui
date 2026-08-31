import { Text as ReactPdfText, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { DocumentValidationError } from "../core/errors";
import { assertFlowBlockFits } from "./flow-layout";
import { useFlowFrame } from "./flow-context";
import { usePdfTheme } from "./theme-context";
import type { TextAlign } from "./typography";

export interface KeepTogetherProps {
  children: ReactNode;
  measuredHeight: number;
}

export function KeepTogether({ children, measuredHeight }: KeepTogetherProps) {
  assertFlowBlockFits(measuredHeight, useFlowFrame());
  return (
    <View wrap={false} style={{ minHeight: measuredHeight }}>
      {children}
    </View>
  );
}

export function PageBreak({ children }: { children: ReactNode }) {
  useFlowFrame();
  if (
    children === undefined ||
    children === null ||
    typeof children === "boolean"
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "PageBreak requires following content, not an empty trailing marker.",
        path: ["pageBreak"],
      },
    ]);
  }
  return <View break>{children}</View>;
}

export interface PageNumberProps {
  format?: string;
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
