import { View } from "@react-pdf/renderer";
import { assertPrintText, invalidPrintData } from "./printable-data";
import { Text } from "./text";
import { usePdfTheme } from "./theme-context";
export interface BadgeProps {
  /** Short printed status label. */
  label: string;
  /** Compact caption or regular body text size. */
  size?: "compact" | "regular";
  /** Filled-neutral or outline theme treatment. */
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
