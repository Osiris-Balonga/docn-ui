import type { ReactNode } from "react";
import { Stack, type SpacingToken } from "./stack";
import { Heading } from "./heading";
export interface SectionProps {
  /** Related PDF content in the section. */
  children: ReactNode;
  /** Optional level-three section heading. */
  title?: string;
  /** Theme spacing token between the heading and content. */
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
