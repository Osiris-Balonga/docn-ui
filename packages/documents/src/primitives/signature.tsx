import { View } from "@react-pdf/renderer";
import { assertSignature, type SignatureProps } from "./printable-data";
import { usePdfTheme } from "./theme-context";
import { Text } from "./text";

export type { SignatureProps, Signer } from "./printable-data";

export function Signature({
  signers,
  layout = "stacked",
  space = 40,
}: SignatureProps) {
  const theme = usePdfTheme();
  assertSignature({ signers, layout, space });
  return (
    <View wrap={false} style={{ flexDirection: "row", gap: theme.spacing.xl }}>
      {signers.map((signer, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            minWidth: 0,
            flexDirection: layout === "inline" ? "row" : "column",
            gap: theme.spacing.sm,
          }}
        >
          <View
            style={
              layout === "inline"
                ? { height: space, justifyContent: "flex-end" }
                : {}
            }
          >
            <Text size="caption" weight="strong">
              {signer.label}
            </Text>
          </View>
          <View
            style={{
              ...(layout === "inline" ? { flex: 1 } : {}),
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                height: space,
                borderBottomColor: theme.colors.text,
                borderBottomWidth: 0.5,
              }}
            />
            {signer.name ? <Text>{signer.name}</Text> : null}
            {signer.role ? (
              <Text size="caption" tone="muted">
                {signer.role}
              </Text>
            ) : null}
            {signer.date ? <Text size="caption">{signer.date}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}
