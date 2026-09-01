import { Document, Rect, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Image } from "../../primitives/image";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";

export interface ProfileLanyardBadgeProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof profileLanyardBadgeStyle.slots>;
}

const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed") throw new Error("Badge requires fixed format.");
const format = resolved;

export const profileLanyardBadgeStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#111111",
      border: "#d9d9df",
      canvas: "#ffffff",
      surface: "#ffffff",
      text: "#171717",
      mutedText: "#66666f",
    },
    typeScale: { caption: 5.2, body: 6.8, label: 8, heading: 15, display: 20 },
  },
  { lavender: "#eeeafd" },
);

function LuminaMark({ inverse = false }: { inverse?: boolean }) {
  const dark = inverse ? "#ffffff" : "#111111";
  const violet = inverse ? "#a99cff" : "#6d5ce7";
  return (
    <Row gap="xs" align="center">
      <Svg width={13} height={13} viewBox="0 0 13 13">
        <Rect x={1} y={1} width={5} height={5} rx={1} fill={dark} />
        <Rect x={7} y={1} width={5} height={5} rx={1} fill={violet} />
        <Rect x={1} y={7} width={5} height={5} rx={1} fill={violet} />
        <Rect x={7} y={7} width={5} height={5} rx={1} fill={dark} />
      </Svg>
      <Text weight="strong" style={{ color: dark }}>
        LUMINA
      </Text>
    </Row>
  );
}

export function ProfileLanyardBadge(props: ProfileLanyardBadgeProps) {
  const style = resolveTemplateStyle(profileLanyardBadgeStyle, props.style);
  return (
    <Document title="Profile lanyard badge" language="en">
      <PageFrame format={format} theme={style.theme}>
        <Stack gap="md" style={{ height: "100%" }}>
          <Image
            alt="Fictional employee portrait"
            resolvedSource={props.portraitSource}
            fit="cover"
            width={136}
            height={118}
            borderRadius={5}
          />
          <Stack gap="xs">
            <Text weight="strong" style={{ fontSize: 12 }}>
              Daniel Thompson
            </Text>
            <Text tone="muted">Clinical Data Analyst</Text>
          </Stack>
          <View
            style={{
              backgroundColor: style.slots.lavender,
              borderRadius: 5,
              padding: 7,
            }}
          >
            <Text size="caption">AI & medical intelligence</Text>
          </View>
          <Row justify="between" align="center" style={{ marginTop: "auto" }}>
            <LuminaMark />
            <Text size="caption">ID 4925</Text>
          </Row>
        </Stack>
      </PageFrame>
      <PageFrame format={format} theme={style.theme} backgroundColor="#15151b">
        <View style={{ height: "100%", position: "relative" }}>
          <View
            style={{
              alignItems: "center",
              bottom: 0,
              justifyContent: "center",
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
            }}
          >
            <Text
              align="center"
              weight="strong"
              style={{
                color: "#ffffff",
                fontSize: 22,
                letterSpacing: 2,
                lineHeight: 1.25,
              }}
            >
              L{"\n"}U{"\n"}M{"\n"}I{"\n"}N{"\n"}A
            </Text>
          </View>
          <View style={{ bottom: 0, left: 0, position: "absolute" }}>
            <LuminaMark inverse />
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export const profileLanyardBadgeDefinition: TemplateDefinition = {
  id: "badge-profile-lanyard",
  slug: "badge-profile-lanyard",
  title: "Profile lanyard badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A two-sided portrait employee badge with a clean white face and a dedicated dark brand reverse.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "two-sided"],
  version: "1.0.0",
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: false },
  renderSample: ({ badgeDeveloperPortraitSource }: TemplateSampleAssets) => (
    <ProfileLanyardBadge portraitSource={badgeDeveloperPortraitSource} />
  ),
};
