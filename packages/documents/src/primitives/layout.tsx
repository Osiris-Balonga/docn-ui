import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import type { PdfTheme } from "../themes/themes";
import { usePdfTheme } from "./theme-context";

type SpacingToken = keyof PdfTheme["spacing"];

export interface StackProps {
  children: ReactNode;
  gap?: SpacingToken;
}

export function Stack({ children, gap = "md" }: StackProps) {
  const theme = usePdfTheme();
  return <View style={{ gap: theme.spacing[gap] }}>{children}</View>;
}

export interface RowProps {
  align?: "center" | "end" | "start";
  children: ReactNode;
  gap?: SpacingToken;
}

export function Row({ align = "start", children, gap = "sm" }: RowProps) {
  const theme = usePdfTheme();
  const alignItems =
    align === "end" ? "flex-end" : align === "start" ? "flex-start" : "center";
  return (
    <View style={{ alignItems, flexDirection: "row", gap: theme.spacing[gap] }}>
      {children}
    </View>
  );
}

export interface SeparatorProps {
  spacing?: SpacingToken;
}

export function Separator({ spacing = "sm" }: SeparatorProps) {
  const theme = usePdfTheme();
  return (
    <View
      style={{
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 0.5,
        marginVertical: theme.spacing[spacing],
      }}
    />
  );
}
