import { Document } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import {
  defineTemplateStyle,
  resolveTemplateStyle,
  type TemplateStyleOverrides,
} from "../style-policy";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";
import { QrPortraitBadgeLayout } from "./qr-portrait-badge-layout";

export interface QrPortraitLightBadgeProps {
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof qrPortraitLightBadgeStyle.slots>;
}

const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed") throw new Error("Badge requires fixed format.");
const format = resolved;

export const qrPortraitLightBadgeStyle = defineTemplateStyle(
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
  {},
);

export function QrPortraitLightBadge(props: QrPortraitLightBadgeProps) {
  const style = resolveTemplateStyle(qrPortraitLightBadgeStyle, props.style);
  return (
    <Document title="Light QR portrait badge" language="en">
      <PageFrame format={format} theme={style.theme}>
        <QrPortraitBadgeLayout
          format={format}
          portraitSource={props.portraitSource}
          variant="light"
        />
      </PageFrame>
    </Document>
  );
}

export const qrPortraitLightBadgeDefinition: TemplateDefinition = {
  id: "badge-qr-portrait-light",
  slug: "badge-qr-portrait-light",
  title: "Light QR portrait badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A light portrait credential with a prominent QR code and an edge-to-edge header field.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "qr", "light"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: true },
  renderSample: ({ supportPortraitSource }: TemplateSampleAssets) => (
    <QrPortraitLightBadge portraitSource={supportPortraitSource} />
  ),
};
