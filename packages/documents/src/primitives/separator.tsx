import { View } from "@react-pdf/renderer";
import type { SpacingToken } from "./stack";
import { usePdfTheme } from "./theme-context";
export { Separator as Divider };
export type DividerProps = SeparatorProps;

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
