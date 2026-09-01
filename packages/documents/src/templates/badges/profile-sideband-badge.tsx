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

export interface ProfileSidebandBadgeProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof profileSidebandBadgeStyle.slots>;
}

const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed") throw new Error("Badge requires fixed format.");
const format = resolved;

export const profileSidebandBadgeStyle = defineTemplateStyle(
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

function LuminaMark() {
  return (
    <Row gap="xs" align="center">
      <Svg width={13} height={13} viewBox="0 0 13 13">
        <Rect x={1} y={1} width={5} height={5} rx={1} fill="#111111" />
        <Rect x={7} y={1} width={5} height={5} rx={1} fill="#6d5ce7" />
        <Rect x={1} y={7} width={5} height={5} rx={1} fill="#6d5ce7" />
        <Rect x={7} y={7} width={5} height={5} rx={1} fill="#111111" />
      </Svg>
      <Text weight="strong">LUMINA</Text>
    </Row>
  );
}

export function ProfileSidebandBadge(props: ProfileSidebandBadgeProps) {
  const style = resolveTemplateStyle(profileSidebandBadgeStyle, props.style);
  return (
    <Document title="Profile sideband badge" language="en">
      <PageFrame format={format} theme={style.theme}>
        <View style={{ height: "100%", position: "relative" }}>
          <View
            style={{
              backgroundColor: "#15151b",
              bottom: 0,
              left: 0,
              position: "absolute",
              top: 0,
              width: 25,
            }}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 10,
              left: -15,
              letterSpacing: 1,
              position: "absolute",
              top: 50,
              transform: "rotate(-90deg)",
              width: 65,
            }}
          >
            LUMINA
          </Text>
          <Stack gap="md" style={{ height: "100%", marginLeft: 28 }}>
            <Image
              alt="Fictional employee portrait"
              resolvedSource={props.portraitSource}
              fit="cover"
              width={103}
              height={112}
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
        </View>
      </PageFrame>
    </Document>
  );
}

export const profileSidebandBadgeDefinition: TemplateDefinition = {
  id: "badge-profile-sideband",
  slug: "badge-profile-sideband",
  title: "Profile sideband badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A clean portrait employee badge with a black identity sideband and compact credential footer.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "sideband"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
  renderSample: ({ badgeDeveloperPortraitSource }: TemplateSampleAssets) => (
    <ProfileSidebandBadge portraitSource={badgeDeveloperPortraitSource} />
  ),
};
