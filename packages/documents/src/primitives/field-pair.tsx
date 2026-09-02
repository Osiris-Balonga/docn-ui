import { View } from "@react-pdf/renderer";
import { Text } from "./text";
import { usePdfTheme } from "./theme-context";
export interface FieldPairProps {
  /** Short muted field label. */
  label: string;
  /** Readable field value. */
  value: string;
  /** Place the label above the value or in the first third of a row. */
  orientation?: "vertical" | "horizontal";
}

export function FieldPair({
  label,
  value,
  orientation = "vertical",
}: FieldPairProps) {
  const theme = usePdfTheme();
  if (orientation === "horizontal")
    return (
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Text size="caption" tone="muted">
            {label}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text size="label">{value}</Text>
        </View>
      </View>
    );
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text size="caption" tone="muted">
        {label}
      </Text>
      <Text size="label">{value}</Text>
    </View>
  );
}

export { FieldPair as KeyValue };
export type KeyValueProps = FieldPairProps;
