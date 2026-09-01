import { Document } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { Heading } from "../../primitives/heading";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme, type PdfTheme } from "../../themes/themes";
import type { TemplateDefinition } from "../types";

interface ResumeEntry {
  description: string;
  meta?: string;
  title: string;
}

export interface ClassicResumeProps {
  contact: readonly string[];
  education: readonly ResumeEntry[];
  experience: readonly ResumeEntry[];
  highlights: readonly string[];
  languages: readonly string[];
  name: string;
  projects: readonly ResumeEntry[];
  skills: readonly string[];
  summary: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed")
  throw new Error("Classic resume requires A4.");
const format = resolvedFormat;

const theme: PdfTheme = {
  ...getPdfTheme("editorial"),
  colors: {
    ...getPdfTheme("editorial").colors,
    accent: "#0869b2",
    canvas: "#ffffff",
    surface: "#ffffff",
    text: "#111111",
    mutedText: "#676767",
  },
  typeScale: { caption: 6.5, body: 7.2, label: 8.5, heading: 13, display: 28 },
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      weight="strong"
      style={{ color: theme.colors.accent, fontSize: 7, letterSpacing: 0.25 }}
    >
      {children.toUpperCase()}
    </Text>
  );
}

function Entry({ description, meta, title }: ResumeEntry) {
  return (
    <Stack gap="xs" style={{ gap: 4 }}>
      <Text
        weight="strong"
        style={{ fontFamily: "Noto Serif", fontSize: 8.3, lineHeight: 1.2 }}
      >
        {title}
      </Text>
      {meta ? (
        <Text
          tone="muted"
          style={{
            fontSize: 5.8,
            letterSpacing: 0.15,
            textTransform: "uppercase",
          }}
        >
          {meta}
        </Text>
      ) : null}
      <Text
        style={{ fontFamily: "Noto Serif", fontSize: 6.8, lineHeight: 1.38 }}
      >
        {description}
      </Text>
    </Stack>
  );
}

function TextList({ items }: { items: readonly string[] }) {
  return (
    <Stack gap="sm" style={{ gap: 9 }}>
      {items.map((item) => (
        <Text
          key={item}
          style={{ fontFamily: "Noto Serif", fontSize: 6.8, lineHeight: 1.35 }}
        >
          {item}
        </Text>
      ))}
    </Stack>
  );
}

export function ClassicResume(props: ClassicResumeProps) {
  return (
    <Document title={`${props.name} resume`} language="en">
      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <Stack
          gap="lg"
          style={{ gap: 28, paddingHorizontal: 19, paddingTop: 3 }}
        >
          <Row justify="between" style={{ alignItems: "flex-start" }}>
            <Stack gap="xs" style={{ width: "64%" }}>
              <Heading
                level="display"
                style={{
                  fontFamily: "Noto Serif",
                  fontSize: 27,
                  lineHeight: 1,
                }}
              >
                {props.name}
              </Heading>
              <Text
                tone="muted"
                style={{ fontFamily: "Noto Serif", fontSize: 6.4 }}
              >
                {props.summary}
              </Text>
            </Stack>
            <Stack gap="xs" style={{ width: "28%", paddingTop: 1 }}>
              {props.contact.map((line) => (
                <Text
                  key={line}
                  style={{ fontFamily: "Noto Serif", fontSize: 6.5 }}
                >
                  {line}
                </Text>
              ))}
            </Stack>
          </Row>

          <Row gap="lg" style={{ alignItems: "flex-start" }}>
            <Stack gap="xl" style={{ gap: 34, width: "63%" }}>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Experience</SectionTitle>
                {props.experience.map((entry) => (
                  <Entry key={entry.title} {...entry} />
                ))}
              </Stack>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Education</SectionTitle>
                {props.education.map((entry) => (
                  <Entry key={entry.title} {...entry} />
                ))}
              </Stack>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Projects</SectionTitle>
                {props.projects.map((entry) => (
                  <Entry key={entry.title} {...entry} />
                ))}
              </Stack>
            </Stack>
            <Stack gap="xl" style={{ gap: 40, width: "29%" }}>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Skills</SectionTitle>
                <TextList items={props.skills} />
              </Stack>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Highlights</SectionTitle>
                <TextList items={props.highlights} />
              </Stack>
              <Stack gap="md" style={{ gap: 12 }}>
                <SectionTitle>Languages</SectionTitle>
                <TextList items={props.languages} />
              </Stack>
            </Stack>
          </Row>
        </Stack>
      </PageFrame>
    </Document>
  );
}

export const classicResumeExample: ClassicResumeProps = {
  name: "Your name",
  summary: "Product designer focused on clear systems and useful details.",
  contact: ["123 Your Street", "(000) 000 0000", "hello@example.com"],
  experience: [
    {
      title: "Company, City — Senior Designer",
      meta: "May 2023 to present",
      description:
        "Led a small product team and designed accessible workflows for complex customer operations across several markets.",
    },
    {
      title: "Company, City — Product Designer",
      meta: "March 2020 to May 2023",
      description:
        "Created reusable patterns, research plans and production-ready interface specifications for web and print.",
    },
    {
      title: "Studio, City — Designer",
      meta: "August 2018 to March 2020",
      description:
        "Delivered identity, editorial and digital projects for independent organizations and cultural teams.",
    },
  ],
  education: [
    {
      title: "School name, City — Master degree",
      meta: "August 2016 to May 2018",
      description:
        "Advanced study in interaction design, typography and information architecture with a final editorial project.",
    },
    {
      title: "School name, City — Bachelor degree",
      meta: "August 2013 to May 2016",
      description:
        "Foundation in visual communication, layout systems and accessible digital publishing.",
    },
  ],
  projects: [
    {
      title: "Project name — Details",
      description:
        "A source-owned document system for reusable printed output.",
    },
  ],
  skills: [
    "Product strategy and research",
    "Design systems",
    "Prototyping and facilitation",
  ],
  highlights: [
    "Built a multi-team design system",
    "Mentored junior designers",
    "Presented at community events",
  ],
  languages: ["English — fluent", "French — professional"],
};

export const classicResumeDefinition: TemplateDefinition = {
  id: "resume-classic",
  slug: "resume-classic",
  title: "Classic two-column resume",
  family: "resume",
  familyLabel: "CVs",
  description:
    "A restrained two-column resume with serif hierarchy and blue section labels.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["editorial"],
  tags: ["resume", "cv", "two-column", "editorial"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <ClassicResume {...classicResumeExample} />,
};
