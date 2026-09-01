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

export interface QrPortraitBlueBadgeProps {
  backgroundSource: string;
  portraitSource: string;
  style?: TemplateStyleOverrides<typeof qrPortraitBlueBadgeStyle.slots>;
}

const resolved = resolveFormat("badge-54x86");
if (resolved.kind !== "fixed") throw new Error("Badge requires fixed format.");
const format = resolved;

export const qrPortraitBlueBadgeStyle = defineTemplateStyle(
  "neutral",
  {
    colors: {
      accent: "#2b20b7",
      border: "#d7d3ee",
      canvas: "#2b20b7",
      surface: "#ffffff",
      text: "#ffffff",
      mutedText: "#d8d4ff",
    },
    typeScale: { caption: 5.2, body: 6.8, label: 8, heading: 15, display: 21 },
  },
  {},
);

export function QrPortraitBlueBadge(props: QrPortraitBlueBadgeProps) {
  const style = resolveTemplateStyle(qrPortraitBlueBadgeStyle, props.style);
  return (
    <Document title="Blue QR portrait badge" language="en">
      <PageFrame
        format={format}
        theme={style.theme}
        backgroundColor={style.theme.colors.canvas}
      >
        <QrPortraitBadgeLayout
          backgroundSource={props.backgroundSource}
          format={format}
          portraitSource={props.portraitSource}
          variant="blue"
        />
      </PageFrame>
    </Document>
  );
}

export const qrPortraitBlueBadgeDefinition: TemplateDefinition = {
  id: "badge-qr-portrait-blue",
  slug: "badge-qr-portrait-blue",
  title: "Blue QR portrait badge",
  family: "badge",
  familyLabel: "Badges",
  description:
    "A portrait credential with a QR code and an original abstract background extending to every page edge.",
  supportedFormatIds: ["badge-54x86"],
  supportedThemeIds: ["neutral"],
  tags: ["badge", "employee", "portrait", "qr", "blue", "full-bleed"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: true, qr: true },
  renderSample: ({
    badgePatternSource,
    supportPortraitSource,
  }: TemplateSampleAssets) => (
    <QrPortraitBlueBadge
      backgroundSource={badgePatternSource}
      portraitSource={supportPortraitSource}
    />
  ),
};
