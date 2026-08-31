import { Document, View } from "@react-pdf/renderer";
import { resolveFormat } from "../core/formats";
import { Card, Section } from "../primitives/containers";
import { DocumentFrame } from "../primitives/document-frame";
import { Alert, Badge } from "../primitives/annotations";
import { Form } from "../primitives/form";
import { PageBreak } from "../primitives/pagination";
import { Signature } from "../primitives/signature";
import { Watermark } from "../primitives/watermark";
import { Image } from "../primitives/image";
import { Divider, Row, Stack } from "../primitives/layout";
import { Link } from "../primitives/link";
import { List, type ListItem } from "../primitives/list";
import { QRCode } from "../primitives/qr-code-view";
import { Heading, KeyValue, Text } from "../primitives/typography";
import type { FixedDocumentRenderPlan } from "../render/runtime";
import { getPdfTheme } from "../themes/themes";

export const preparationItems: readonly ListItem[] = [
  {
    text: "Prepare the document",
    description: "Keep content editable in your own source.",
    children: [
      {
        text: "Choose a print format",
        children: [{ text: "Reserve the safe area" }],
      },
    ],
  },
  { text: "Review the exported PDF" },
];

// Supply a PNG/JPEG already decoded and validated by the local asset boundary.
export function createPrimitiveContentPlan(
  resolvedSource: string,
): FixedDocumentRenderPlan {
  const format = resolveFormat("a4");
  if (format.kind !== "fixed") throw new Error("Expected A4.");
  const fixedDate = new Date("2026-01-15T12:00:00.000Z");
  return {
    format,
    printProfile: { kind: "screen" },
    document: (
      <Document
        title="Composable PDF content"
        creationDate={fixedDate}
        modificationDate={fixedDate}
        language="en-GB"
      >
        <DocumentFrame
          format={format}
          theme={getPdfTheme("neutral")}
          margin={36}
        >
          <Stack gap="lg">
            <Stack gap="sm">
              <Text size="caption" tone="muted">
                DOCN-UI / COMPONENT SPECIMEN
              </Text>
              <Heading level={1}>Core document components</Heading>
              <Text>
                Selectable text, <Text weight="strong">explicit emphasis</Text>,
                and{" "}
                <Link href="https://example.com/guide">a readable link</Link>{" "}
                share the same PDF theme.
              </Text>
            </Stack>
            <Divider />
            <Section title="Typography and metadata">
              <Heading level={2}>A neutral starting point</Heading>
              <Row justify="between">
                <Heading level={3}>Level three</Heading>
                <Heading level={4}>Level four</Heading>
                <Heading level={5}>Level five</Heading>
                <Heading level={6}>Level six</Heading>
              </Row>
              <Text align="right">Right-aligned detail</Text>
              <KeyValue label="Prepared for" value="Élodie Mbemba" />
              <KeyValue
                orientation="horizontal"
                label="Document purpose"
                value="Reusable print components with bounded inputs and owned source."
              />
            </Section>
            <Row gap="lg" align="stretch">
              <View style={{ flex: 1 }}>
                <Card title="Document outline" padding="md">
                  <List items={preparationItems} />
                </Card>
              </View>
              <View style={{ flex: 1 }}>
                <Card title="Review steps" padding="md">
                  <List
                    marker="numbered"
                    items={[
                      { text: "Read the source" },
                      { text: "Export and inspect" },
                    ]}
                  />
                  <List
                    marker="check"
                    items={[
                      { text: "Content checked", checked: true },
                      { text: "Print review pending", checked: false },
                    ]}
                  />
                </Card>
              </View>
            </Row>
            <Section title="Local media">
              <Row gap="lg" align="center">
                <View style={{ flex: 1 }}>
                  <Image
                    alt="Local monochrome geometry sample"
                    resolvedSource={resolvedSource}
                    width={140}
                    height={70}
                    fit="contain"
                    align="center"
                    caption="Local image with a readable caption."
                  />
                </View>
                <QRCode payload="https://example.com/docn" size={72} />
              </Row>
            </Section>
            <Section title="Document navigation">
              <Stack direction="horizontal" gap="lg" align="center">
                <Link href="mailto:hello@example.com">Email contact</Link>
                <Link href="tel:+242065550124">Phone contact</Link>
                <Link href="#end-note">Jump to end note</Link>
              </Stack>
              <Text id="end-note" size="caption" tone="muted">
                End note: links are native PDF annotations; check states are
                static print marks.
              </Text>
            </Section>
          </Stack>
          <PageBreak>
            <Stack gap="lg">
              <Stack gap="sm">
                <Text size="caption" tone="muted">
                  DOCN-UI / PRINTABLE ANNOTATIONS
                </Text>
                <Heading level={1}>Review and sign-off</Heading>
                <Text>
                  Static fields and signature lines. Edit the source to add your
                  own theme.
                </Text>
              </Stack>
              <Row gap="md" align="center">
                <Badge label="Draft" />
                <Badge label="Review pending" size="regular" tone="outline" />
              </Row>
              <Alert
                title="Complete before printing"
                description="Review the populated values and leave the blank fields for handwritten information."
              />
              <Form
                groups={[
                  {
                    id: "reference",
                    title: "Document reference",
                    fields: [
                      {
                        id: "purpose",
                        label: "Purpose",
                        value: "Proof approval for the community publication.",
                      },
                    ],
                  },
                  {
                    id: "contact",
                    title: "Contact information",
                    columns: 2,
                    fields: [
                      {
                        id: "name",
                        label: "Full name",
                        value: "Élodie Mbemba",
                        required: true,
                      },
                      {
                        id: "email",
                        label: "Email",
                        value: "elodie@example.com",
                      },
                      {
                        id: "address",
                        label: "Postal address",
                        value: "14 avenue des Arts\nBrazzaville",
                      },
                      { id: "phone", label: "Telephone" },
                    ],
                  },
                  {
                    id: "review",
                    title: "Review details",
                    columns: 3,
                    fields: [
                      {
                        id: "reference-id",
                        label: "Reference",
                        value: "DOC-026",
                      },
                      { id: "copies", label: "Copies", value: "25" },
                      { id: "date", label: "Review date", value: "" },
                      { id: "notes", label: "Review notes" },
                    ],
                  },
                ]}
              />
              <Signature
                signers={[
                  {
                    label: "Prepared by",
                    name: "Élodie Mbemba",
                    role: "Editor",
                    date: "15 January 2026",
                  },
                  {
                    label: "Approved by",
                    name: "Morgan Lee",
                    role: "Reviewer",
                  },
                ]}
              />
              <Signature
                space={24}
                signers={[{ label: "Witness signature" }]}
              />
              <Signature
                layout="inline"
                space={24}
                signers={[{ label: "Collected by" }]}
              />
              <Alert
                status="Important"
                title="Static print elements only"
                description="No interactive form fields, digital signatures or document protection are provided."
              />
            </Stack>
          </PageBreak>
          <Watermark text="DRAFT" placement="bottom" />
          <Watermark text="SAMPLE" fontSize={20} repeat={false} />
        </DocumentFrame>
      </Document>
    ),
  };
}
