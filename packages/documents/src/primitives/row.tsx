import type { ReactNode } from "react";
import type { ViewProps } from "@react-pdf/renderer";
import {
  Stack,
  type Alignment,
  type Justification,
  type SpacingToken,
} from "./stack";
export interface RowProps {
  /** Cross-axis alignment of row children. */
  align?: Alignment;
  /** PDF content arranged horizontally. */
  children: ReactNode;
  /** Theme spacing token between direct children. */
  gap?: SpacingToken;
  /** Horizontal child distribution. */
  justify?: Justification;
  /** Optional React PDF style overrides for source-owned compositions. */
  style?: ViewProps["style"];
}

export function Row({
  align = "start",
  children,
  gap = "sm",
  justify,
  style,
}: RowProps) {
  return (
    <Stack
      direction="horizontal"
      align={align}
      gap={gap}
      {...(justify === undefined ? {} : { justify })}
      style={style}
    >
      {children}
    </Stack>
  );
}
