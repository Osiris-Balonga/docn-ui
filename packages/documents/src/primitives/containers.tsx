import { View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { Stack, type SpacingToken } from "./layout";
import { Heading } from "./typography";
import { usePdfTheme } from "./theme-context";

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

export interface CardProps extends SectionProps {
  padding?: SpacingToken;
}

export function Card({ children, title, gap, padding = "md" }: CardProps) {
  const theme = usePdfTheme();
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 0.5,
        padding: theme.spacing[padding],
      }}
    >
      <Section
        {...(title === undefined ? {} : { title })}
        {...(gap === undefined ? {} : { gap })}
      >
        {children}
      </Section>
    </View>
  );
}
