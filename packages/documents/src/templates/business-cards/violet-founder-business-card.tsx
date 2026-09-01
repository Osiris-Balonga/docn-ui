import { Document, Path, Svg } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
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
const Mark = ({ color, size = 55 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Path
      d="M27 2 L36 20 L57 12 L43 29 L58 42 L37 39 L30 58 L24 39 L3 46 L17 30 L2 17 L23 21 Z"
      fill={color}
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
        <Row
          justify="between"
          align="center"
          style={{ height: "100%", padding: 8 }}
        >
          <Stack gap="xs">
            <Text weight="strong" style={{ fontSize: 21 }}>
              NOVAARC
            </Text>
            <Text style={{ color: "#ffffff" }}>novaarc.example</Text>
          </Stack>
          <Mark color="#ffffff" size={72} />
        </Row>
      </PageFrame>
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
        <Row
          justify="between"
          align="center"
          style={{ height: "100%", padding: 10 }}
        >
          <Stack gap="xs">
            <Text style={{ fontSize: 12 }}>ROHIT VERMA</Text>
            <Text tone="muted">Founder</Text>
            <Stack gap="xs" style={{ marginTop: 20 }}>
              <Text>+91 67854 236712</Text>
              <Text>rohit@novaarc.example</Text>
            </Stack>
          </Stack>
          <Mark color={style.slots.violet} size={60} />
        </Row>
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
