import type { ReactNode } from "react";
import {
  Stack,
  type Alignment,
  type Justification,
  type SpacingToken,
} from "./stack";
export interface RowProps {
  align?: Alignment;
  children: ReactNode;
  gap?: SpacingToken;
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
