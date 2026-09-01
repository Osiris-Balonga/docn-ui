import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { DocumentValidationError } from "../core/errors";
import { useFlowFrame } from "./flow-context";
export interface PageBreakProps {
  /** Content that begins at the top of a new flowing page. */
  children: ReactNode;
}
export function PageBreak({ children }: PageBreakProps) {
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
