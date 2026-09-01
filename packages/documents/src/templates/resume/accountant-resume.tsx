import { Document, Path, Svg, View } from "@react-pdf/renderer";
import { resolveFormat } from "../../core/formats";
import { PageFrame } from "../../primitives/page-frame";
import { Row } from "../../primitives/row";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { getPdfTheme, type PdfTheme } from "../../themes/themes";
import type { TemplateDefinition } from "../types";

interface ResumeItem {
  description: string;
  meta: string;
  title: string;
}

export interface AccountantResumeProps {
  about: string;
  contact: readonly string[];
  education: readonly ResumeItem[];
  experience: readonly ResumeItem[];
  name: string;
  role: string;
  skills: readonly string[];
}

const resolvedFormat = resolveFormat("a4");
if (resolvedFormat.kind !== "fixed")
  throw new Error("Accountant resume requires A4.");
const format = resolvedFormat;

const theme: PdfTheme = {
  ...getPdfTheme("neutral"),
  colors: {
    ...getPdfTheme("neutral").colors,
    canvas: "#ffffff",
    surface: "#ffffff",
    text: "#171717",
    mutedText: "#5f5f5f",
  },
};

function Rule() {
  return <View style={{ borderTop: "0.7 solid #303030", width: "100%" }} />;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      weight="strong"
      style={{ fontSize: 13, letterSpacing: 1.5, lineHeight: 1 }}
    >
      {children.toUpperCase()}
    </Text>
  );
}

function ContactIcon({ type }: { type: "email" | "location" | "phone" }) {
  const path =
    type === "phone"
      ? "M3 1.8 5.7 1 7.1 4.2 5.5 5.4c.9 2 2.5 3.6 4.6 4.6l1.3-1.6 3.2 1.5-.8 2.8c-.3.8-1 1.3-1.9 1.2C6.4 13 2.1 8.8 1.2 3.5 1 2.7 1.7 2 3 1.8Z"
      : type === "email"
        ? "M1.5 3.2h13v9h-13v-9Zm.8.8 5.7 4 5.7-4"
        : "M8 14S3.5 9.3 3.5 5.8a4.5 4.5 0 1 1 9 0C12.5 9.3 8 14 8 14Zm0-6.2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z";
  return (
    <Svg width={11} height={11} viewBox="0 0 16 16">
      <Path
        d={path}
        fill={type === "location" ? "#171717" : "none"}
        stroke="#171717"
        strokeWidth={1.2}
      />
    </Svg>
  );
}

function Entry({ description, meta, title }: ResumeItem) {
  return (
    <Stack style={{ gap: 3 }}>
      <Text tone="muted" style={{ fontSize: 9.2 }}>
        {meta}
      </Text>
      <Text weight="strong" style={{ fontSize: 9.5 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 8.8, lineHeight: 1.55 }}>{description}</Text>
    </Stack>
  );
}

export function AccountantResume(props: AccountantResumeProps) {
  return (
    <Document title={`${props.name} resume`} language="en">
      <PageFrame format={format} theme={theme} backgroundColor="#ffffff">
        <Stack
          style={{
            gap: 17,
            marginHorizontal: 31,
            marginTop: 31,
          }}
        >
          <Stack style={{ alignItems: "center", gap: 4 }}>
            <Text
              weight="strong"
              style={{ fontSize: 26, letterSpacing: 1.3, lineHeight: 1 }}
            >
              {props.name.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 14.5 }}>{props.role}</Text>
          </Stack>

          <Row justify="between" style={{ paddingHorizontal: 1 }}>
            {props.contact.map((item, index) => (
              <Row key={item} style={{ alignItems: "center", gap: 7 }}>
                <ContactIcon
                  type={
                    index === 0 ? "phone" : index === 1 ? "email" : "location"
                  }
                />
                <Text tone="muted" style={{ fontSize: 8.4 }}>
                  {item}
                </Text>
              </Row>
            ))}
          </Row>
          <Rule />

          <Stack style={{ gap: 10 }}>
            <SectionTitle>About me</SectionTitle>
            <Text style={{ fontSize: 8.8, lineHeight: 1.55 }}>
              {props.about}
            </Text>
          </Stack>
          <Rule />

          <Stack style={{ gap: 12 }}>
            <SectionTitle>Education</SectionTitle>
            {props.education.map((entry) => (
              <Entry key={`${entry.meta}-${entry.title}`} {...entry} />
            ))}
          </Stack>
          <Rule />

          <Stack style={{ gap: 12 }}>
            <SectionTitle>Work experience</SectionTitle>
            {props.experience.map((entry) => (
              <Entry key={`${entry.meta}-${entry.title}`} {...entry} />
            ))}
          </Stack>
          <Rule />

          <Stack style={{ gap: 10 }}>
            <SectionTitle>Skills</SectionTitle>
            <Row justify="between">
              {props.skills.map((skill) => (
                <Row
                  key={skill}
                  style={{ alignItems: "center", gap: 7, width: "31%" }}
                >
                  <Text style={{ fontSize: 8 }}>•</Text>
                  <Text style={{ fontSize: 8.8 }}>{skill}</Text>
                </Row>
              ))}
            </Row>
          </Stack>
        </Stack>
        <View
          style={{
            backgroundColor: "#6d6d6d",
            bottom: -28.35,
            height: 18,
            left: -28.35,
            position: "absolute",
            width: 595.28,
          }}
        />
      </PageFrame>
    </Document>
  );
}

export const accountantResumeExample: AccountantResumeProps = {
  name: "Sebastian Bennett",
  role: "Professional Accountant",
  contact: [
    "+123-456-7890",
    "hello@reallygreatsite.com",
    "123 Anywhere St., Any City",
  ],
  about:
    "Detail-oriented accountant with a strong record of improving reporting accuracy, streamlining month-end operations and translating financial information into clear business decisions.",
  education: [
    {
      meta: "Borcelle University | 2026–2030",
      title: "Master of Professional Accounting",
      description:
        "Advanced studies in financial reporting, audit strategy and corporate taxation, completed with a research project on operational controls.",
    },
    {
      meta: "Borcelle University | 2023–2026",
      title: "Bachelor of Accounting",
      description:
        "Coursework in management accounting, business law and financial analysis with practical case-based assessment.",
    },
  ],
  experience: [
    {
      meta: "Salford & Co. | 2033–2035",
      title: "Senior Accountant",
      description:
        "Led monthly close, prepared executive reporting packs and coordinated audit requests across a growing portfolio of client accounts.",
    },
    {
      meta: "Salford & Co. | 2030–2033",
      title: "Financial Accountant",
      description:
        "Reconciled complex ledgers, improved forecasting models and documented consistent controls for recurring finance workflows.",
    },
  ],
  skills: ["Auditing", "Financial Accounting", "Financial Reporting"],
};

export const accountantResumeDefinition: TemplateDefinition = {
  id: "resume-accountant",
  slug: "resume-accountant",
  title: "Structured accountant resume",
  family: "resume",
  familyLabel: "CVs",
  description:
    "A precise monochrome resume with centered identity, ruled sections and a compact skills row.",
  supportedFormatIds: ["a4"],
  supportedThemeIds: ["neutral"],
  tags: ["resume", "cv", "accounting", "monochrome"],
  version: "1.0.0",
  sides: 1,
  capabilities: { logo: false, printProfiles: false, qr: false },
  renderSample: () => <AccountantResume {...accountantResumeExample} />,
};
