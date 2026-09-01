import { Document, Circle, Svg } from "@react-pdf/renderer";
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

export interface DeveloperBadgeProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof developerBadgeStyle.slots>;
}
const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed")
  throw new Error("Badge requires a fixed format.");
const format = resolved;
export const developerBadgeStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#a69cf2",
      border: "#292632",
      canvas: "#201e26",
      surface: "#201e26",
      text: "#ffffff",
      mutedText: "#c6c1d1",
    },
    typeScale: { caption: 5.5, body: 7, label: 8, heading: 15, display: 21 },
  },
  { year: "#e8e5ee" },
);
export function DeveloperBadge(props: DeveloperBadgeProps) {
  const style = resolveTemplateStyle(developerBadgeStyle, props.style);
  return (
    <Document title="Developer badge" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
        <Stack gap="md" style={{ height: "100%", padding: 5 }}>
          <Row justify="between" align="start">
            <Stack gap="xs">
              <Text style={{ fontSize: 17 }}>Adam</Text>
              <Text style={{ color: style.theme.colors.accent, fontSize: 17 }}>
                Johanson
              </Text>
              <Text>Senior Programmer</Text>
            </Stack>
            <Text style={{ color: style.slots.year, fontSize: 8 }}>2026</Text>
          </Row>
          <Row justify="end">
            <Text style={{ color: style.slots.year, fontSize: 7 }}>DEVOPS</Text>
          </Row>
          <Image
            alt="Fictional developer portrait"
            resolvedSource={props.portraitSource}
            fit="cover"
            width={122}
            height={100}
            borderRadius={8}
          />
          <Row gap="sm" align="center">
            <Svg width={18} height={18}>
              <Circle
                cx={6}
                cy={6}
                r={4}
                fill="none"
                stroke={style.theme.colors.accent}
                strokeWidth={2}
              />
              <Circle
                cx={12}
                cy={12}
                r={4}
                fill="none"
                stroke={style.theme.colors.accent}
                strokeWidth={2}
              />
            </Svg>
            <Text style={{ color: style.theme.colors.accent, fontSize: 11 }}>
              ORBITSTACK
            </Text>
          </Row>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const developerBadgeDefinition: TemplateDefinition = {
  id: "badge-developer",
  slug: "badge-developer",
  title: "Developer badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A dark technical employee badge with lavender type, role metadata and a framed portrait.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "developer", "portrait"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
  renderSample: ({ badgeDeveloperPortraitSource }: TemplateSampleAssets) => (
    <DeveloperBadge portraitSource={badgeDeveloperPortraitSource} />
  ),
};
