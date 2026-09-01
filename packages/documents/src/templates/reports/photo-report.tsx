import { Document, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Heading } from "../../primitives/heading";
import { Image } from "../../primitives/image";
import { PageFrame } from "../../primitives/page-frame";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme, type PdfTheme } from "../../themes/themes";
import type { TemplateDefinition, TemplateSampleAssets } from "../types";

export interface PhotoReportProps {
  author: string;
  coverImageSource: string;
  introduction: string;
  sections: readonly { body: readonly string[]; title: string }[];
  subtitle: string;
  title: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed")
  throw new Error("Photo report requires A4.");
const format = resolvedFormat;

const theme: PdfTheme = {
  ...getPdfTheme("neutral"),
  colors: {
    ...getPdfTheme("neutral").colors,
    accent: "#b47a32",
    canvas: "#ffffff",
    surface: "#ffffff",
    text: "#111111",
    mutedText: "#555555",
  },
  typeScale: { caption: 6.5, body: 8, label: 10, heading: 18, display: 23 },
};

function Footer({ page }: { page: number }) {
  return (
    <View
      style={{
        bottom: 4,
        left: 40,
        position: "absolute",
        right: 40,
      }}
    >
      <View
        style={{ borderTopColor: theme.colors.accent, borderTopWidth: 1 }}
      />
      {page > 1 ? (
        <Text style={{ fontSize: 6, marginTop: 4 }}>{page}</Text>
      ) : null}
    </View>
  );
}

export function PhotoReport(props: PhotoReportProps) {
  return (
    <Document title={props.title} author={props.author} language="en">
      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <Stack gap="md" style={{ paddingHorizontal: 40, paddingTop: 2 }}>
          <Stack gap="xs">
            <Text
              tone="muted"
              style={{
                fontSize: 6.2,
                letterSpacing: 0.35,
                textTransform: "uppercase",
              }}
            >
              {props.author}
            </Text>
            <Heading
              level="display"
              style={{ fontSize: 22, letterSpacing: -0.45, lineHeight: 1 }}
            >
              {props.title.toUpperCase()}
            </Heading>
            <Text
              style={{ fontSize: 15.5, letterSpacing: -0.25, lineHeight: 1.1 }}
            >
              {props.subtitle.toUpperCase()}
            </Text>
          </Stack>
          <View
            style={{ borderTopColor: theme.colors.accent, borderTopWidth: 1 }}
          />
          <Image
            alt="Report cover photograph"
            fit="cover"
            height={326}
            resolvedSource={props.coverImageSource}
            width={458}
          />
          <Stack gap="sm">
            <Heading
              level={3}
              style={{ fontFamily: "Noto Serif", fontSize: 11 }}
            >
              Introduction
            </Heading>
            <Text style={{ fontSize: 7.2, lineHeight: 1.55 }}>
              {props.introduction}
            </Text>
          </Stack>
        </Stack>
        <Footer page={1} />
      </PageFrame>

      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <Stack gap="lg" style={{ paddingHorizontal: 40, paddingTop: 6 }}>
          <View
            style={{ borderTopColor: theme.colors.accent, borderTopWidth: 1 }}
          />
          {props.sections.map((section, sectionIndex) => (
            <Stack key={`${section.title}-${sectionIndex}`} gap="sm">
              <Heading level={3} style={{ fontSize: 9.5 }}>
                {section.title}
              </Heading>
              {section.body.map((paragraph) => (
                <Text
                  key={paragraph}
                  style={{ fontSize: 7.2, lineHeight: 1.55 }}
                >
                  {paragraph}
                </Text>
              ))}
            </Stack>
          ))}
        </Stack>
        <Footer page={2} />
      </PageFrame>
    </Document>
  );
}

export const photoReportExample = (
  coverImageSource: string,
): PhotoReportProps => ({
  author: "Your name",
  title: "Report title",
  subtitle: "A concise supporting line",
  coverImageSource,
  introduction:
    "This opening section introduces the subject in a compact paragraph. The restrained type, wide image and ochre rule preserve the clear editorial rhythm of the reference document. Additional context continues across several short lines so the opening page keeps the same text density and visual balance.",
  sections: [
    {
      title: "Insert your heading here",
      body: [
        "The first section uses a long readable measure with compact leading. Its paragraphs align to the same grid as the cover image and leave deliberate space below for continuation. The body is intentionally long enough to demonstrate a realistic report page rather than a placeholder paragraph.",
        "The second paragraph extends the narrative without changing the page structure. Content may vary while the document keeps the reference proportions, hierarchy and repeated horizontal rules. This additional copy preserves the visual density of the supplied example.",
        "A third paragraph demonstrates sustained reading across the page. It remains compact, selectable and fully rendered by the same PDF component system.",
        "The report then develops its evidence in a consistent measure. Short sentences alternate with longer explanations so the page remains readable while still showing how a realistic amount of source-owned content behaves.",
        "Supporting observations can continue without introducing another visual system. The same typography, margins and controlled line length carry the reader through the document.",
        "A final paragraph closes the first section and creates a clear pause before the next heading. No text is rasterized and every line remains selectable in the generated PDF.",
      ],
    },
    {
      title: "Insert your heading here",
      body: [
        "A second section demonstrates how additional content fits the same report system while preserving the fixed footer and page number. The shorter closing block creates the same alternating rhythm between dense and open areas.",
        "The page closes with enough space for later additions without moving the footer or changing the established measure.",
        "Because the composition is built from shared components, the author can replace this copy while keeping the same page geometry and hierarchy.",
        "Longer conclusions can be added here, with the footer remaining anchored to the physical page rather than following the final text block.",
      ],
    },
  ],
});

export const photoReportDefinition: TemplateDefinition = {
  id: "report-photo",
  slug: "report-photo",
  title: "Photo-led report",
  family: "report",
  familyLabel: "Reports",
  description:
    "A two-page editorial report with a large cover image and restrained continuation page.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["report", "editorial", "photo", "multipage"],
  version: "1.0.0",
  sides: 2,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: ({ imageSource }: TemplateSampleAssets) => (
    <PhotoReport {...photoReportExample(imageSource)} />
  ),
};
