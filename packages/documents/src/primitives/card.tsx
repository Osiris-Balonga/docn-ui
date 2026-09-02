import { View } from "@react-pdf/renderer";
import type { SpacingToken } from "./stack";
import { Section, type SectionProps } from "./section";
import { usePdfTheme } from "./theme-context";
export interface CardProps extends SectionProps {
  /** Theme spacing token applied inside the frame. */
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
