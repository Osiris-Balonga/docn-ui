import { Document, Rect, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { createSafeFrame } from "../../primitives/measurement";
import { Image } from "../../primitives/image";
import { PageFrame } from "../../primitives/page-frame";
import { QRCode } from "../../primitives/qr-code-view";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";

export interface QrPortraitBadgeProps {
  backgroundSource: string;
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof qrPortraitBadgeStyle.slots>;
}

const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed") throw new Error("Badge requires fixed format.");
const format = resolved;
const frame = createSafeFrame(format);

export const qrPortraitBadgeStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#2b20b7",
      border: "#d7d3ee",
      canvas: "#f8f5ff",
      surface: "#ffffff",
      text: "#12121a",
      mutedText: "#5f5a6b",
    },
    typeScale: { caption: 5.2, body: 6.8, label: 8, heading: 15, display: 21 },
  },
  { lavender: "#e8ddff" },
);

function Brand({ inverse = false }: { inverse?: boolean }) {
  const color = inverse ? "#ffffff" : "#242033";
  return (
    <Row gap="xs" align="center">
      <Svg width={12} height={12} viewBox="0 0 12 12">
        <Rect x={1} y={5} width={10} height={2} rx={1} fill={color} />
        <Rect x={5} y={1} width={2} height={10} rx={1} fill={color} />
        <Rect
          x={3}
          y={3}
          width={6}
          height={6}
          rx={3}
          fill="none"
          stroke={color}
          strokeWidth={1}
        />
      </Svg>
      <Text weight="strong" style={{ color }}>
        NOVA HEALTH
      </Text>
    </Row>
  );
}

function BadgeFace({
  backgroundSource,
  inverse,
  portraitSource,
}: {
  backgroundSource?: string;
  inverse?: boolean;
  portraitSource: string;
}) {
  const textColor = inverse ? "#ffffff" : "#15131e";
  return (
    <View style={{ height: "100%", position: "relative" }}>
      {backgroundSource ? (
        <View style={{ left: 0, position: "absolute", top: 0 }}>
          <Image
            alt="Original abstract blue badge pattern"
            resolvedSource={backgroundSource}
            fit="cover"
            width={frame.width}
            height={frame.height}
          />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#eadfff",
            height: 28,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      )}
      <Stack gap="md" style={{ height: "100%", padding: 7 }}>
        <Row justify="between" align="start">
          <Stack gap="xs">
            <Text
              weight="strong"
              style={{ color: textColor, fontSize: 20, lineHeight: 0.92 }}
            >
              Celine{"\n"}Rose
            </Text>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: inverse ? "#ffffff" : "#ffffff",
                borderRadius: 5,
                paddingHorizontal: 5,
                paddingVertical: 2,
              }}
            >
              <Text size="caption" style={{ color: "#29223a" }}>
                Physician
              </Text>
            </View>
          </Stack>
          <View style={{ backgroundColor: "#ffffff", padding: 3 }}>
            <QRCode
              payload="https://nova.example/id/celine-rose"
              size={48}
              minimumModuleSize={0.8}
            />
          </View>
        </Row>
        <View style={{ alignItems: "center", marginTop: 3 }}>
          <Image
            alt="Fictional physician portrait"
            resolvedSource={portraitSource}
            fit="cover"
            width={112}
            height={118}
            borderRadius={3}
          />
        </View>
        <Row justify="between" align="end" style={{ marginTop: "auto" }}>
          <Brand {...(inverse ? { inverse: true } : {})} />
          <Stack gap="xs">
            <Text align="right" size="caption" style={{ color: textColor }}>
              EXP DATE
            </Text>
            <Text align="right" size="caption" style={{ color: textColor }}>
              01/05/2029
            </Text>
          </Stack>
        </Row>
      </Stack>
    </View>
  );
}

export function QrPortraitBadge(props: QrPortraitBadgeProps) {
  const style = resolveTemplateStyle(qrPortraitBadgeStyle, props.style);
  return (
    <Document title="QR portrait badge" language="en">
      <PageFrame format={format} theme={style.theme}>
        <BadgeFace portraitSource={props.portraitSource} />
      </PageFrame>
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.accent}
      >
        <BadgeFace
          backgroundSource={props.backgroundSource}
          inverse
          portraitSource={props.portraitSource}
        />
      </PageFrame>
    </Document>
  );
}

export const qrPortraitBadgeDefinition: TemplateDefinition = {
  id: "badge-qr-portrait",
  slug: "badge-qr-portrait",
  title: "QR portrait badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A two-sided portrait credential with a QR code, light face and original patterned blue variant.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "qr", "two-sided"],
  version: "1.0.0",
  sides: 2,
  capabilities: { logo: false, printProfiles: true, qr: true },
  renderSample: ({
    badgePatternSource,
    supportPortraitSource,
  }: TemplateSampleAssets) => (
    <QrPortraitBadge
      backgroundSource={badgePatternSource}
      portraitSource={supportPortraitSource}
    />
  ),
};
