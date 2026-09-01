import type { ReactNode } from "react";
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
}

export function Row({
  align = "start",
  children,
  gap = "sm",
  justify,
}: RowProps) {
  return (
    <Stack
      direction="horizontal"
      align={align}
      gap={gap}
      {...(justify === undefined ? {} : { justify })}
    >
      {children}
    </Stack>
  );
}
