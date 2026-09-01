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
    <Stack gap="lg">
      <TextExampleHierarchy />
      <TextExampleAlignment />
    </Stack>
  );
}
export function TextExampleHierarchy() {
  return (
    <Stack gap="sm">
      <Text weight="strong">Documents that belong to your codebase.</Text>
      <Text size="label">A concise supporting label.</Text>
      <Text size="caption" tone="muted">
        Selectable text, including accents: Élodie Mbemba.
      </Text>
    </Stack>
  );
}
export function TextExampleAlignment() {
  return (
    <Stack gap="xs">
      <Text align="left">Left-aligned operational copy.</Text>
      <Text align="center">Centered confirmation copy.</Text>
      <Text align="right">Right-aligned reference DOC-0042.</Text>
    </Stack>
  );
}
export function HeadingExample() {
  return (
    <Stack gap="md">
      <Heading level="display">Annual report</Heading>
      <Heading level={2}>A clear hierarchy</Heading>
      <Heading level={3}>Built for the page</Heading>
      <Heading level={4}>Every detail matters</Heading>
      <Heading level={5}>Supporting section</Heading>
      <Heading level={6} align="right">
        Reference heading
      </Heading>
    </Stack>
  );
}
export function HeadingHierarchyExample() {
  return (
    <Stack gap="sm">
      <Heading level={1}>Document title</Heading>
      <Heading level={2}>Major section</Heading>
      <Heading level={3}>Supporting section</Heading>
    </Stack>
  );
}
export function HeadingAlignmentExample() {
  return (
    <Stack gap="sm">
      <Heading level={3}>Left aligned</Heading>
      <Heading level={3} align="center">
        Centered
      </Heading>
      <Heading level={3} align="right">
        Right aligned
      </Heading>
    </Stack>
  );
}
export function KeyValueExample() {
  return (
    <Stack gap="lg">
      <KeyValueVerticalExample />
      <KeyValueHorizontalExample />
    </Stack>
  );
}
export function KeyValueVerticalExample() {
  return <KeyValue label="Customer" value="Élodie Mbemba" />;
}
export function KeyValueHorizontalExample() {
  return (
    <Stack gap="sm">
      <KeyValue
        orientation="horizontal"
        label="Reference"
        value="DOC-2026-0042"
      />
      <KeyValue orientation="horizontal" label="Total" value="1,284.00 EUR" />
    </Stack>
  );
}
export function StackExample() {
  return (
    <Stack gap="xl">
      <StackSpacingExample />
      <StackAlignmentExample />
    </Stack>
  );
}
export function StackSpacingExample() {
  return (
    <Stack gap="xs">
      <Text weight="strong">Compact metadata</Text>
      <Text>Reference DOC-0042</Text>
      <Text>Approved 15 January 2026</Text>
    </Stack>
  );
}
export function StackAlignmentExample() {
  return (
    <Stack direction="horizontal" justify="between" align="center">
      <Text>Prepared</Text>
      <Text weight="strong">Ready to print</Text>
    </Stack>
  );
}
export function RowExample() {
  return (
    <Stack gap="lg">
      <Row justify="between" align="center">
        <Text weight="strong">Order 0042</Text>
        <Text size="caption" tone="muted">
          Ready to print
        </Text>
      </Row>
      <Row justify="center" gap="lg">
        <Text>Prepared</Text>
        <Text>Reviewed</Text>
        <Text>Approved</Text>
      </Row>
    </Stack>
  );
}
export function RowDistributionExample() {
  return (
    <Row justify="between" align="center">
      <Text weight="strong">Invoice DOC-0042</Text>
      <Text>1,284.00 EUR</Text>
    </Row>
  );
}
export function RowCenteredExample() {
  return (
    <Row justify="center" gap="lg">
      <Text>Prepared</Text>
      <Text>Reviewed</Text>
      <Text>Approved</Text>
    </Row>
  );
}
export function DividerExample() {
  return (
    <Stack gap="md">
      <Text weight="strong">Line styles</Text>
      <Divider />
      <Divider variant="dashed" />
      <Divider variant="dotted" />
      <Text weight="strong">Labels and emphasis</Text>
      <Divider label="OR" />
      <Divider label="APPROVED" tone="accent" thickness="medium" />
      <Text weight="strong">Spacing and width</Text>
      <Divider spacing="xs" width="60%" thickness="thick" />
    </Stack>
  );
}

export function DividerLineStylesExample() {
  return (
    <Stack gap="md">
      <Divider />
      <Divider variant="dashed" />
      <Divider variant="dotted" />
    </Stack>
  );
}

export function DividerLabelExample() {
  return <Divider label="OR" />;
}

export function DividerEmphasisExample() {
  return <Divider tone="accent" thickness="medium" width="60%" />;
}
export function SectionExample() {
  return (
    <Stack gap="xl">
      <Section title="Delivery details">
        <Text>Studio North</Text>
        <Text>24 Market Street</Text>
      </Section>
      <Section gap="xs">
        <Text weight="strong">Untitled compact section</Text>
        <Text tone="muted">Monday to Friday, 09:00-17:00</Text>
      </Section>
    </Stack>
  );
}
export function SectionTitledExample() {
  return (
    <Section title="Delivery details">
      <Text>24 Market Street</Text>
    </Section>
  );
}
export function SectionUntitledExample() {
  return (
    <Section gap="xs">
      <Text weight="strong">Internal note</Text>
      <Text>Print at actual size.</Text>
    </Section>
  );
}
export function CardExample() {
  return (
    <Stack gap="lg">
      <Card title="Project summary" padding="lg">
        <Text>A compact space for related information.</Text>
        <KeyValue orientation="horizontal" label="Status" value="Approved" />
      </Card>
      <Card padding="sm" gap="xs">
        <Text weight="strong">Amount due</Text>
        <Heading level={2}>1,284.00 EUR</Heading>
      </Card>
    </Stack>
  );
}
export function CardSummaryExample() {
  return (
    <Card title="Project summary" padding="lg">
      <Text>Source-owned and ready to print.</Text>
    </Card>
  );
}
export function CardAmountExample() {
  return (
    <Card padding="sm" gap="xs">
      <Text weight="strong">Amount due</Text>
      <Heading level={2}>1,284.00 EUR</Heading>
    </Card>
  );
}
export function LinkExample() {
  return (
    <Stack gap="md">
      <Link href="https://example.com">Visit the project website</Link>
      <Link href="mailto:hello@example.com">hello@example.com</Link>
      <Link href="tel:+33184201242" tone="accent">
        Accent-colored contact link
      </Link>
      <Text id="delivery-notes">Delivery notes destination</Text>
      <Link href="#delivery-notes" tone="text">
        Text-colored internal link
      </Link>
    </Stack>
  );
}
export function LinkExternalExample() {
  return <Link href="https://example.com">Visit the project website</Link>;
}
export function LinkContactExample() {
  return (
    <Stack gap="sm">
      <Link href="mailto:hello@example.com">Email the studio</Link>
      <Link href="tel:+33184201242">Call the studio</Link>
    </Stack>
  );
}
export function LinkInternalExample() {
  return (
    <Stack gap="sm">
      <Text id="terms">Terms destination</Text>
      <Link href="#terms">Jump to terms</Link>
    </Stack>
  );
}
export function ListExample() {
  return (
    <Stack gap="xl">
      <ListBulletExample />
      <ListNumberedExample />
      <ListChecklistExample />
    </Stack>
  );
}
export function ListBulletExample() {
  return (
    <List
      items={[
        {
          text: "Source-owned components",
          description: "Edit every installed file locally.",
        },
        {
          text: "PDF-native layout",
          children: [{ text: "Selectable text" }, { text: "Vector marks" }],
        },
      ]}
    />
  );
}
export function ListNumberedExample() {
  return (
    <List
      marker="numbered"
      items={[
        { text: "Review the content" },
        { text: "Confirm the page size" },
        { text: "Print at actual size" },
      ]}
    />
  );
}
export function ListChecklistExample() {
  return (
    <List
      marker="check"
      items={[
        { text: "Content reviewed", checked: true },
        { text: "Page size confirmed", checked: true },
        { text: "Print proof approved", checked: false },
      ]}
    />
  );
}
export function ImageExample({ source }: { source: string }) {
  return (
    <Stack gap="lg">
      <Row gap="xl" align="center">
        <ImageSquareExample source={source} />
        <ImageRoundedExample source={source} />
      </Row>
      <ImageCoveredExample source={source} />
    </Stack>
  );
}
export function ImageContainedExample({ source }: { source: string }) {
  return (
    <Image
      resolvedSource={source}
      width={108}
      height={108}
      fit="contain"
      align="start"
      alt="A real desk and computer workspace"
      caption="Square contain"
    />
  );
}
export function ImageSquareExample({ source }: { source: string }) {
  return <ImageContainedExample source={source} />;
}
export function ImageCoveredExample({ source }: { source: string }) {
  return (
    <Image
      resolvedSource={source}
      width={260}
      height={84}
      fit="cover"
      align="center"
      alt="A cropped desk and computer workspace"
      caption="Landscape cover"
    />
  );
}
export function ImageRoundedExample({ source }: { source: string }) {
  return (
    <Image
      resolvedSource={source}
      width={108}
      height={108}
      fit="cover"
      borderRadius={54}
      alt="A circular crop of a desk and computer workspace"
      caption="Circular crop"
    />
  );
}
export function QRCodeExample() {
  return (
    <Row gap="xl" align="center">
      <QRCodeUrlExample />
      <QRCodeReferenceExample />
    </Row>
  );
}
export function QRCodeUrlExample() {
  return (
    <Stack gap="sm" align="center">
      <QRCode payload="https://example.com" size={88} />
      <Text size="caption">Open the guide</Text>
    </Stack>
  );
}
export function QRCodeReferenceExample() {
  return (
    <Stack gap="sm" align="center">
      <QRCode payload="DOCN:ORDER:0042" size={72} minimumModuleSize={1.2} />
      <Text size="caption">Order DOC-0042</Text>
    </Stack>
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
