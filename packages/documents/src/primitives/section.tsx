import type { ReactNode } from "react";
import { Stack, type SpacingToken } from "./stack";
import { Heading } from "./heading";
export interface SectionProps {
  children: ReactNode;
  title?: string;
  gap?: SpacingToken;
}

export function Section({ children, title, gap = "md" }: SectionProps) {
  return (
    <Stack gap={gap}>
      {title ? <Heading level={3}>{title}</Heading> : null}
      {children}
    </Stack>
  );
}
