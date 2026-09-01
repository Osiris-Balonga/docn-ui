import { View } from "@react-pdf/renderer";
import { assertPrintText, invalidPrintData } from "./printable-data";
import { usePdfTheme } from "./theme-context";
import { Text } from "./typography";

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

export interface BadgeProps {
  label: string;
  size?: "compact" | "regular";
  tone?: "neutral" | "outline";
}

export function Badge({
  label,
  size = "compact",
  tone = "neutral",
}: BadgeProps) {
  const theme = usePdfTheme();
  assertPrintText(label, "label", 48);
  if (
    !["compact", "regular"].includes(size) ||
    !["neutral", "outline"].includes(tone)
  )
    invalidPrintData("Unknown badge size or tone.", "badge");
  return (
    <View
      wrap={false}
      style={{
        alignSelf: "flex-start",
        borderWidth: 0.5,
        borderColor: theme.colors.border,
        borderRadius: 3,
        backgroundColor:
          tone === "neutral" ? theme.colors.canvas : theme.colors.surface,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text size={size === "compact" ? "caption" : "body"} weight="strong">
        {label}
      </Text>
    </View>
  );
}
