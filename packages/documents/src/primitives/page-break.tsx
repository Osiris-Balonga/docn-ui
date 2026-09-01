import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { DocumentValidationError } from "../core/errors";
import { useFlowFrame } from "./flow-context";
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
