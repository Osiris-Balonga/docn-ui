import { Card } from "../../primitives/card";
import { Divider } from "../../primitives/separator";
import { Heading } from "../../primitives/heading";
import { Image } from "../../primitives/image";
import { KeyValue } from "../../primitives/field-pair";
import { Link } from "../../primitives/link";
import { List } from "../../primitives/list";
import { QRCode } from "../../primitives/qr-code-view";
import { Row } from "../../primitives/row";
import { Section } from "../../primitives/section";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";

export function TextExample() {
  return (
    <Stack>
      <Text>Documents that belong to your codebase.</Text>
      <Text weight="strong">An important detail.</Text>
      <Text size="caption" tone="muted">
        Selectable text, including accents: Élodie Mbemba.
      </Text>
    </Stack>
  );
}
export function HeadingExample() {
  return (
    <Stack gap="lg">
      <Heading level={1}>A clear hierarchy.</Heading>
      <Heading level={2}>Built for the page.</Heading>
      <Heading level={3}>Every detail matters.</Heading>
    </Stack>
  );
}
export function KeyValueExample() {
  return (
    <Stack gap="lg">
      <KeyValue label="Customer" value="Élodie Mbemba" />
      <KeyValue
        orientation="horizontal"
        label="Reference"
        value="DOC-2026-0042"
      />
    </Stack>
  );
}
export function StackExample() {
  return (
    <Stack gap="lg">
      <Text weight="strong">Production notes</Text>
      <Text>Confirm the content.</Text>
      <Text>Check the paper size.</Text>
      <Text>Print at actual size.</Text>
    </Stack>
  );
}
export function RowExample() {
  return (
    <Row justify="between" align="center">
      <Text weight="strong">Order 0042</Text>
      <Text size="caption" tone="muted">
        Ready to print
      </Text>
    </Row>
  );
}
export function DividerExample() {
  return (
    <Stack gap="lg">
      <Text>Document preparation</Text>
      <Divider />
      <Text tone="muted">Review before printing.</Text>
    </Stack>
  );
}
export function SectionExample() {
  return (
    <Section title="Delivery details">
      <Text>Studio North</Text>
      <Text>24 Market Street</Text>
      <Text tone="muted">Monday to Friday, 09:00-17:00</Text>
    </Section>
  );
}
export function CardExample() {
  return (
    <Card title="Project summary" padding="lg">
      <Text>A compact space for related information.</Text>
      <KeyValue orientation="horizontal" label="Status" value="Approved" />
    </Card>
  );
}
export function LinkExample() {
  return (
    <Stack gap="lg">
      <Link href="https://example.com">Visit the project website</Link>
      <Link href="mailto:hello@example.com">hello@example.com</Link>
    </Stack>
  );
}
export function ListExample() {
  return (
    <List
      marker="check"
      items={[
        { text: "Content reviewed", checked: true },
        {
          text: "Page size confirmed",
          checked: true,
          description: "Use the document's physical dimensions.",
        },
        { text: "Print proof approved", checked: false },
      ]}
    />
  );
}
export function ImageExample({ source }: { source: string }) {
  return (
    <Image
      resolvedSource={source}
      width={210}
      height={105}
      alt="A neutral geometric sample"
      caption="A permitted local image, fitted without distortion."
    />
  );
}
export function QRCodeExample() {
  return (
    <Row gap="lg" align="center">
      <QRCode payload="https://example.com" size={96} />
      <Stack>
        <Text weight="strong">Find out more</Text>
        <Text size="caption" tone="muted">
          example.com
        </Text>
      </Stack>
    </Row>
  );
}
export function ThemeExample() {
  return (
    <Stack gap="lg">
      <Heading level={1}>Studio North</Heading>
      <Text>A document built with shared type, spacing and color tokens.</Text>
      <Divider />
      <KeyValue
        orientation="horizontal"
        label="Project"
        value="Annual report"
      />
      <KeyValue
        orientation="horizontal"
        label="Reference"
        value="DOC-2026-0042"
      />
      <Card title="A considered detail">
        <Text>The content stays the same. Only the PDF theme changes.</Text>
      </Card>
    </Stack>
  );
}
