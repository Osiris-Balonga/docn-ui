import { View } from "@react-pdf/renderer";
import { assertPrintText } from "./printable-data";
import { Text } from "./text";
import { usePdfTheme } from "./theme-context";
export interface AlertProps {
  title: string;
  description?: string;
  status?: string;
}

export function Alert({ title, description, status = "Note" }: AlertProps) {
  const theme = usePdfTheme();
  assertPrintText(title, "title");
  assertPrintText(status, "status", 32);
  if (description !== undefined)
    assertPrintText(description, "description", 2000);
  return (
    <View
      style={{
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.text,
        paddingLeft: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <Text size="caption" weight="strong">
        {status}
      </Text>
      <Text size="label" weight="strong">
        {title}
      </Text>
      {description === undefined ? null : <Text>{description}</Text>}
    </View>
  );
}
