import { View, type ViewProps } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../themes/themes";
import { usePdfTheme } from "./theme-context";
export type SpacingToken = keyof PdfTheme["spacing"];
export type Alignment = "center" | "end" | "start" | "stretch";
export type Justification = "start" | "center" | "end" | "between";

export interface StackProps {
  /** PDF content arranged by the stack. */
  children: ReactNode;
  /** Theme spacing token between direct children. */
  gap?: SpacingToken;
  /** Vertical flow by default, or an explicit horizontal row. */
  direction?: "vertical" | "horizontal";
  /** Cross-axis child alignment. */
  align?: Alignment;
  /** Main-axis child distribution. */
  justify?: Justification;
  /** Optional React PDF style overrides for source-owned compositions. */
  style?: ViewProps["style"];
}

export function Stack({
  children,
  gap = "md",
  direction = "vertical",
  align,
  justify,
  style,
}: StackProps) {
  const theme = usePdfTheme();
  return (
    <View
      style={[
        {
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
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
