import { Document, Path, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition } from "../types";

export interface VioletFounderBusinessCardProps {
  style?: TemplateStyleOverrides<typeof violetFounderBusinessCardStyle.slots>;
}
const resolved = resolveFormat("card-85x55");
if (resolved.kind !== "fixed") throw new Error("Card requires fixed format.");
const format = resolved;
export const violetFounderBusinessCardStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#7b2cff",
      border: "#171717",
      canvas: "#0b0b0e",
      surface: "#0b0b0e",
      text: "#ffffff",
      mutedText: "#b8b4bf",
    },
    typeScale: {
      caption: 5.2,
      body: 6.5,
      label: 7.5,
      heading: 12,
      display: 22,
    },
  },
  { violet: "#7b2cff" },
);
const NovaarcMark = ({
  color,
  size = 55,
}: {
  color: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Path d="M10 56 V20 H21 L43 45 V20 H54 V56 H43 L21 31 V56 Z" fill={color} />
    <Path
      d="M8 14 C20 2 44 2 56 14"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={6}
    />
  </Svg>
);
export function VioletFounderBusinessCard(
  props: VioletFounderBusinessCardProps,
) {
  const style = resolveTemplateStyle(
    violetFounderBusinessCardStyle,
    props.style,
  );
  return (
    <Document title="Violet founder business card" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.slots.violet}
      >
        <View style={{ height: "100%", position: "relative" }}>
          <View style={{ position: "absolute", right: 8, top: 4 }}>
            <NovaarcMark color="#ffffff" size={82} />
          </View>
          <Stack gap="xs" style={{ bottom: 7, left: 6, position: "absolute" }}>
            <Text weight="strong" style={{ fontSize: 27, letterSpacing: -1.2 }}>
              novaarc
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 5.5 }}>
              novaarc.example
            </Text>
          </Stack>
        </View>
      </PageFrame>
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
        <View style={{ height: "100%", position: "relative" }}>
          <View style={{ position: "absolute", right: 6, top: 2 }}>
            <NovaarcMark color={style.slots.violet} size={64} />
          </View>
          <Stack gap="xs" style={{ left: 8, position: "absolute", top: 35 }}>
            <Text style={{ fontSize: 11 }}>ROHIT VERMA</Text>
            <Text tone="muted" style={{ fontSize: 5.5 }}>
              Founder
            </Text>
          </Stack>
          <Stack gap="xs" style={{ bottom: 7, left: 8, position: "absolute" }}>
            <Text style={{ fontSize: 5.5 }}>+91 67854 236712</Text>
            <Text style={{ fontSize: 5.5 }}>rohit@novaarc.example</Text>
          </Stack>
        </View>
      </PageFrame>
    </Document>
  );
}
export const violetFounderBusinessCardDefinition: TemplateDefinition = {
  id: "business-card-violet-founder",
  slug: "business-card-violet-founder",
  title: "Violet founder business card",
  family: "business-card",
  familyLabel: "Business Cards",
  description:
    "A two-sided founder card with a vivid violet brand face and restrained black contact reverse.",
  supportedFormatIds: ["card-85x55"],
  supportedThemeIds: ["neutral"],
  tags: ["business-card", "two-sided", "founder", "violet"],
  version: "1.0.0",
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: false },
  renderSample: () => <VioletFounderBusinessCard />,
};
