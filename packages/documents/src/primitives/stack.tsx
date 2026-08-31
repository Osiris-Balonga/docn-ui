import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../themes/themes";
import { usePdfTheme } from "./theme-context";
export type SpacingToken = keyof PdfTheme["spacing"];
export type Alignment = "center" | "end" | "start" | "stretch";
export type Justification = "start" | "center" | "end" | "between";

export interface StackProps {
  children: ReactNode;
  gap?: SpacingToken;
  direction?: "vertical" | "horizontal";
  align?: Alignment;
  justify?: Justification;
}

export function Stack({
  children,
  gap = "md",
  direction = "vertical",
  align,
  justify,
}: StackProps) {
  const theme = usePdfTheme();
  return (
    <View
      style={{
        gap: theme.spacing[gap],
        ...(direction === "horizontal"
          ? { flexDirection: "row" as const }
          : {}),
        ...(align === undefined
          ? {}
          : {
              alignItems:
                align === "start"
                  ? ("flex-start" as const)
                  : align === "end"
                    ? ("flex-end" as const)
                    : align,
            }),
        ...(justify === undefined
          ? {}
          : {
              justifyContent:
                justify === "start"
                  ? ("flex-start" as const)
                  : justify === "end"
                    ? ("flex-end" as const)
                    : justify === "between"
                      ? ("space-between" as const)
                      : ("center" as const),
            }),
      }}
    >
      {children}
    </View>
  );
}
