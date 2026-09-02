import { Text, View } from "@react-pdf/renderer";
import { DocumentValidationError } from "../core/errors";
import type { SpacingToken } from "./stack";
import { usePdfTheme } from "./theme-context";
export { Separator as Divider };
export type DividerProps = SeparatorProps;

export type SeparatorVariant = "solid" | "dashed" | "dotted";
export type SeparatorThickness = "thin" | "medium" | "thick";
export type SeparatorTone = "accent" | "border" | "muted";

export interface SeparatorProps {
  /** Vertical space above and below the rule. */
  spacing?: SpacingToken;
  /** PDF-native border style. */
  variant?: SeparatorVariant;
  /** Theme-relative line weight. */
  thickness?: SeparatorThickness;
  /** Optional short label placed between two rules. */
  label?: string;
  /** Theme color role used by the rule and optional label. */
  tone?: SeparatorTone;
  /** Rule width in points or as a percentage of its container. */
  width?: number | `${number}%`;
}

function invalidSeparator(message: string, path: string) {
  throw new DocumentValidationError([
    { code: "INVALID_DATA", message, path: ["separator", path] },
  ]);
}

export function assertSeparatorProps({ label, width }: SeparatorProps) {
  if (
    label !== undefined &&
    (typeof label !== "string" ||
      label.trim().length === 0 ||
      label.length > 48 ||
      /[\r\n]/.test(label))
  )
    invalidSeparator(
      "Divider labels must contain 1–48 characters on one line.",
      "label",
    );
  if (
    width !== undefined &&
    !(
      (typeof width === "number" &&
        Number.isFinite(width) &&
        width >= 24 &&
        width <= 1000) ||
      (typeof width === "string" && /^(?:100|[1-9]?\d)%$/.test(width))
    )
  )
    invalidSeparator(
      "Divider width must be 24–1000 points or a percentage from 0% to 100%.",
      "width",
    );
}

export function Separator({
  spacing = "sm",
  variant = "solid",
  thickness = "thin",
  label,
  tone = "border",
  width,
}: SeparatorProps) {
  assertSeparatorProps({
    ...(label === undefined ? {} : { label }),
    ...(width === undefined ? {} : { width }),
  });
  const theme = usePdfTheme();
  const color =
    tone === "accent"
      ? theme.colors.accent
      : tone === "muted"
        ? theme.colors.mutedText
        : theme.colors.border;
  const borderBottomWidth =
    thickness === "thick" ? 2 : thickness === "medium" ? 1 : 0.5;
  const lineStyle = {
    flexGrow: 1,
    borderBottomColor: color,
    borderBottomStyle: variant,
    borderBottomWidth,
  } as const;
  const containerStyle = {
    marginVertical: theme.spacing[spacing],
    ...(width === undefined ? {} : { width }),
  };
  if (label !== undefined)
    return (
      <View
        style={{
          ...containerStyle,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={lineStyle} />
        <Text
          style={{
            paddingHorizontal: theme.spacing.sm,
            color,
            fontFamily: theme.fonts.body,
            fontSize: theme.typeScale.caption,
            fontWeight: theme.fonts.strongWeight,
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
        <View style={lineStyle} />
      </View>
    );
  return (
    <View
      style={{
        ...containerStyle,
        borderBottomColor: color,
        borderBottomStyle: variant,
        borderBottomWidth,
      }}
    />
  );
}
