import { Document, Rect, Svg } from "@react-pdf/renderer";
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

export interface CreativeTeamBadgeProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof creativeTeamBadgeStyle.slots>;
}
const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed")
  throw new Error("Badge requires a fixed format.");
const format = resolved;
export const creativeTeamBadgeStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#9be53b",
      border: "#25282c",
      canvas: "#9be53b",
      surface: "#34373c",
      text: "#ffffff",
      mutedText: "#d6d9db",
    },
    typeScale: { caption: 5.5, body: 7, label: 8, heading: 15, display: 21 },
  },
  { ink: "#34373c" },
);
export function CreativeTeamBadge(props: CreativeTeamBadgeProps) {
  const style = resolveTemplateStyle(creativeTeamBadgeStyle, props.style);
  return (
    <Document title="Creative team badge" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.accent}
      >
        <Stack gap="xs" style={{ gap: 0, height: "100%" }}>
          <Image
            alt="Fictional employee portrait"
            resolvedSource={props.portraitSource}
            fit="cover"
            width={136}
            height={145}
            borderRadius={5}
          />
          <Stack
            gap="xs"
            style={{
              backgroundColor: style.slots.ink,
              flexGrow: 1,
              marginHorizontal: -9,
              marginBottom: -9,
              paddingHorizontal: 13,
              paddingTop: 14,
            }}
          >
            <Row gap="xs" align="end">
              <Text weight="strong" style={{ fontSize: 16 }}>
                JAMES
              </Text>
              <Text
                weight="strong"
                style={{ color: style.theme.colors.accent, fontSize: 16 }}
              >
                BURNLEY
              </Text>
            </Row>
            <Text tone="muted">Head of Design</Text>
            <Row gap="sm" align="center" style={{ marginTop: 28 }}>
              <Svg width={17} height={17}>
                <Rect
                  x={1}
                  y={1}
                  width={7}
                  height={7}
                  fill={style.theme.colors.accent}
                />
                <Rect
                  x={9}
                  y={9}
                  width={7}
                  height={7}
                  fill={style.theme.colors.accent}
                />
              </Svg>
              <Text
                weight="strong"
                style={{ color: style.theme.colors.accent }}
              >
                KITE STUDIO
              </Text>
            </Row>
          </Stack>
        </Stack>
      </PageFrame>
    </Document>
  );
}
export const creativeTeamBadgeDefinition: TemplateDefinition = {
  id: "badge-creative-team",
  slug: "badge-creative-team",
  title: "Creative team badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A portrait employee badge with a lime identity field, large photograph and charcoal name panel.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "creative"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: false },
  renderSample: ({ badgeCreativePortraitSource }: TemplateSampleAssets) => (
    <CreativeTeamBadge portraitSource={badgeCreativePortraitSource} />
  ),
};
