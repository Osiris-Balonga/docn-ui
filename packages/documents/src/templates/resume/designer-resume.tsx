import { Circle, Document, Path, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme, type PdfTheme } from "../../themes/themes";
import type { TemplateDefinition } from "../types";

interface TimelineItem {
  date: string;
  location: string;
  meta: string;
  title: string;
}

interface SkillRating {
  label: string;
  rating: number;
}

export interface DesignerResumeProps {
  contact: readonly string[];
  education: readonly TimelineItem[];
  employment: readonly TimelineItem[];
  name: string;
  role: string;
  skills: readonly SkillRating[];
  summary: string;
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed")
  throw new Error("Designer resume requires A4.");
const format = resolvedFormat;
const green = "#67ad73";
const paleGreen = "#ddf4df";

const theme: PdfTheme = {
  ...getPdfTheme("neutral"),
  colors: {
    ...getPdfTheme("neutral").colors,
    accent: green,
    canvas: "#ffffff",
    surface: "#ffffff",
    text: "#171717",
    mutedText: "#737373",
  },
};

function Avatar() {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        border: `4 solid ${paleGreen}`,
        borderRadius: 48,
        height: 96,
        justifyContent: "center",
        overflow: "hidden",
        width: 96,
      }}
    >
      <Svg width={88} height={88} viewBox="0 0 88 88">
        <Circle cx="44" cy="33" r="17" fill="#2c2c2c" />
        <Path d="M18 88c2-23 11-35 26-35s24 12 26 35Z" fill="#353535" />
        <Path
          d="M26 59v29M35 54v34M44 53v35M53 54v34M62 59v29"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.8"
        />
        <Path
          d="M27 31c1-17 9-24 19-23 11 1 16 9 15 24-5-6-12-10-19-10-6 0-11 3-15 9Z"
          fill="#222222"
        />
      </Svg>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Stack style={{ gap: 5 }}>
      <Text weight="strong" style={{ fontSize: 13 }}>
        {children}
      </Text>
      <View style={{ borderTop: `0.8 solid ${green}`, width: "100%" }} />
    </Stack>
  );
}

function SmallIcon({ index }: { index: number }) {
  const paths = [
    "M2 4h12v8H2zM2.7 4.7 8 8.2l5.3-3.5",
    "M8 14S3.5 9.5 3.5 6a4.5 4.5 0 1 1 9 0C12.5 9.5 8 14 8 14Zm0-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
    "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Zm0 3v3l2 1.5",
    "M8 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3.5 14c.4-3.4 1.9-5.2 4.5-5.2s4.1 1.8 4.5 5.2",
    "M3 2l2.6-.8L7 4.3 5.5 5.5c1 2 2.5 3.5 4.5 4.5l1.2-1.5 3.1 1.4-.8 2.6c-.3.9-1.1 1.4-2 1.2C6.2 12.8 2.2 8.8 1.3 3.7 1.1 2.9 1.8 2.2 3 2Z",
    "M2 11 11 2l3 3-9 9-3 .5.5-3.5ZM9.8 3.2l3 3",
  ];
  return (
    <Svg width={10} height={10} viewBox="0 0 16 16">
      <Path
        d={paths[index] ?? paths[0] ?? ""}
        fill="none"
        stroke={green}
        strokeWidth={1.3}
      />
    </Svg>
  );
}

function Timeline({ item }: { item: TimelineItem }) {
  return (
    <Stack
      style={{ gap: 6, paddingVertical: 9, borderBottom: "0.35 solid #ececec" }}
    >
      <Row justify="between" style={{ alignItems: "baseline" }}>
        <Text weight="strong" style={{ fontSize: 8.3, width: "72%" }}>
          {item.title}
        </Text>
        <Text
          align="right"
          weight="strong"
          style={{ fontSize: 7.7, width: "25%" }}
        >
          {item.meta}
        </Text>
      </Row>
      <Row justify="between">
        <Row style={{ alignItems: "center", gap: 4, width: "58%" }}>
          <Svg width={6} height={6} viewBox="0 0 8 8">
            <Circle cx="4" cy="4" r="3" fill="none" stroke="#a0a0a0" />
            <Circle cx="4" cy="4" r="1" fill="#a0a0a0" />
          </Svg>
          <Text tone="muted" style={{ fontSize: 6.7 }}>
            {item.location}
          </Text>
        </Row>
        <Row
          justify="end"
          style={{ alignItems: "center", gap: 4, width: "40%" }}
        >
          <Svg width={6} height={6} viewBox="0 0 8 8">
            <Circle cx="4" cy="4" r="3" fill="none" stroke="#a0a0a0" />
            <Path d="M4 2.2V4l1.3.8" fill="none" stroke="#a0a0a0" />
          </Svg>
          <Text align="right" tone="muted" style={{ fontSize: 6.7 }}>
            {item.date}
          </Text>
        </Row>
      </Row>
    </Stack>
  );
}

export function DesignerResume(props: DesignerResumeProps) {
  return (
    <Document title={`${props.name} resume`} language="en">
      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <Row
          style={{
            alignItems: "flex-start",
            gap: 34,
            marginHorizontal: 19,
            marginTop: 18,
          }}
        >
          <Stack style={{ gap: 28, width: 126 }}>
            <Stack style={{ gap: 13 }}>
              <Avatar />
              <Text weight="strong" style={{ fontSize: 20, lineHeight: 1.16 }}>
                {props.name}
              </Text>
              <Text
                style={{ color: green, fontSize: 8.5, letterSpacing: 0.35 }}
              >
                {props.role.toUpperCase()}
              </Text>
            </Stack>

            <Stack style={{ gap: 12 }}>
              <SectionTitle>Contact</SectionTitle>
              <Stack style={{ gap: 10 }}>
                {props.contact.map((item, index) => (
                  <Row key={item} style={{ alignItems: "center", gap: 8 }}>
                    <SmallIcon index={index} />
                    <Text style={{ fontSize: 7.1 }}>{item}</Text>
                  </Row>
                ))}
              </Stack>
            </Stack>

            <Stack style={{ gap: 12, marginTop: 20 }}>
              <SectionTitle>Technical Skills</SectionTitle>
              <Stack style={{ gap: 10 }}>
                {props.skills.map((skill) => (
                  <Row
                    key={skill.label}
                    justify="between"
                    style={{ alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 7 }}>{skill.label}</Text>
                    <Row style={{ gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <View
                          key={level}
                          style={{
                            backgroundColor:
                              level <= skill.rating ? green : "#d7dfd8",
                            height: 4,
                            width: 4,
                          }}
                        />
                      ))}
                    </Row>
                  </Row>
                ))}
              </Stack>
            </Stack>
          </Stack>

          <Stack style={{ gap: 34, flexGrow: 1, width: 351 }}>
            <Stack style={{ gap: 12 }}>
              <SectionTitle>Professional Summary</SectionTitle>
              <Text style={{ fontSize: 7.5, lineHeight: 1.55 }}>
                {props.summary}
              </Text>
            </Stack>
            <Stack style={{ gap: 6 }}>
              <SectionTitle>Employment</SectionTitle>
              {props.employment.map((item) => (
                <Timeline key={`${item.title}-${item.date}`} item={item} />
              ))}
            </Stack>
            <Stack style={{ gap: 6, marginTop: 18 }}>
              <SectionTitle>Education</SectionTitle>
              {props.education.map((item) => (
                <Timeline key={`${item.title}-${item.date}`} item={item} />
              ))}
            </Stack>
          </Stack>
        </Row>
      </PageFrame>
    </Document>
  );
}

export const designerResumeExample: DesignerResumeProps = {
  name: "Markus\nJohnson",
  role: "Web Designer",
  contact: [
    "mark@gmail.com",
    "Los Angeles, CA",
    "Full Time",
    "UI Designer",
    "+1 129 888 7232",
    "mark.com",
  ],
  summary:
    "Graphic designer with eight years of experience in branding and print design. Skilled in Adobe Creative Suite and digital prototyping, with a focus on precise systems, useful interfaces and thoughtful visual craft.",
  employment: [
    {
      title: "Senior User Interface Designer",
      meta: "Full Time",
      location: "Market Studios  ·  New York",
      date: "19 Jan, 2020",
    },
    {
      title: "Middle User Interface Designer",
      meta: "Part Time",
      location: "FireWeb  ·  Los Angeles",
      date: "23 Feb, 2017",
    },
    {
      title: "Junior User Interface Designer",
      meta: "Full Time",
      location: "Craftwork  ·  Iowa",
      date: "07 Feb, 2015",
    },
    {
      title: "Intern UI/UX Designer",
      meta: "Part Time",
      location: "Google  ·  Los Angeles",
      date: "11 Jun, 2013",
    },
  ],
  education: [
    {
      title: "Master Degree in Interaction Design",
      meta: "",
      location: "California College of the Arts",
      date: "Sep 2014 – Jun 2015",
    },
    {
      title: "Bachelor Degree in Interaction Design",
      meta: "",
      location: "California College of the Arts",
      date: "Aug 2008 – Jun 2014",
    },
  ],
  skills: [
    { label: "Figma", rating: 5 },
    { label: "Sketch", rating: 5 },
    { label: "Illustrator", rating: 5 },
    { label: "Photoshop", rating: 4 },
    { label: "InDesign", rating: 3 },
    { label: "CSS", rating: 4 },
  ],
};

export const designerResumeDefinition: TemplateDefinition = {
  id: "resume-designer",
  slug: "resume-designer",
  title: "Green designer resume",
  family: "resume",
  familyLabel: "CVs",
  description:
    "A polished two-column creative resume with an illustrated profile, green accents and compact timelines.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["resume", "cv", "designer", "two-column"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <DesignerResume {...designerResumeExample} />,
};
