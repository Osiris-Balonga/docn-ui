import { resolveFormat } from "../../core/formats";
import { DocumentFrame } from "../../primitives/document-frame";
import { Heading } from "../../primitives/heading";
import { KeepTogether } from "../../primitives/keep-together";
import { PageBreak } from "../../primitives/page-break";
import { PageFooter } from "../../primitives/page-footer";
import { PageFrame } from "../../primitives/page-frame";
import { PageHeader } from "../../primitives/page-header";
import { PageNumber } from "../../primitives/page-number";
import { Stack } from "../../primitives/stack";
import { Text } from "../../primitives/text";
import { Watermark } from "../../primitives/watermark";
import { getPdfTheme } from "../../themes/themes";

const format = resolveFormat("a4");
const theme = getPdfTheme("neutral");

export function DocumentFrameExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={format}
      theme={theme}
      margin={36}
      footer={{
        height: 14,
        content: (
          <PageFooter>
            <Text size="caption">Studio North</Text>
          </PageFooter>
        ),
      }}
    >
      <Stack gap="lg">
        <Heading>Project notes</Heading>
        <Text>
          Content flows inside the page margins, with space reserved for the
          footer.
        </Text>
        {Array.from({ length: 55 }, (_, index) => (
          <Text key={index}>
            Section {index + 1}: a measured line of flowing content for a
            multipage document.
          </Text>
        ))}
      </Stack>
    </DocumentFrame>
  );
}
export function DocumentFrameReservedRegionsExample() {
  return <DocumentFrameExample />;
}
export function PageFrameExample() {
  const card = resolveFormat("card-85x55");
  const ticket = resolveFormat("ticket-150x70");
  if (card.kind !== "fixed") throw new Error("Expected a fixed page.");
  if (ticket.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <>
      <PageFrame format={card} theme={theme}>
        <Stack gap="lg">
          <Heading>Élodie Mbemba</Heading>
          <Text>Creative director</Text>
          <Text size="caption">hello@example.com</Text>
        </Stack>
      </PageFrame>
      <PageFrame format={ticket} theme={theme}>
        <Stack gap="lg">
          <Heading>Design systems live</Heading>
          <Text>22 January 2026 · Hall A</Text>
          <Text size="caption">Ticket DOCN-0042</Text>
        </Stack>
      </PageFrame>
    </>
  );
}
export function PageFrameCardExample() {
  const card = resolveFormat("card-85x55");
  if (card.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <PageFrame format={card} theme={theme}>
      <Heading>85 × 55 mm card</Heading>
    </PageFrame>
  );
}
export function PageFrameTicketExample() {
  const ticket = resolveFormat("ticket-150x70");
  if (ticket.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <PageFrame format={ticket} theme={theme}>
      <Heading>150 × 70 mm ticket</Heading>
    </PageFrame>
  );
}
export function KeepTogetherExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
      {Array.from({ length: 60 }, (_, index) => (
        <Text key={index}>Flow line {index + 1}</Text>
      ))}
      <KeepTogether measuredHeight={76}>
        <Stack gap="lg">
          <Heading>Keep these together</Heading>
          <Text>
            This heading and its supporting text stay on the same page.
          </Text>
        </Stack>
      </KeepTogether>
    </DocumentFrame>
  );
}
export function KeepTogetherMeasuredGroupExample() {
  return <KeepTogetherExample />;
}
export function PageBreakExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={format}
      theme={theme}
      margin={36}
      footer={{ height: 14, content: <PageNumber /> }}
    >
      <Heading>First page</Heading>
      <Text>The next section begins on a new page.</Text>
      <PageBreak>
        <Heading>Second page</Heading>
        <Text>An explicit break, within the same document.</Text>
      </PageBreak>
    </DocumentFrame>
  );
}
export function PageBreakSectionExample() {
  return <PageBreakExample />;
}
export function PageNumberExample() {
  return (
    <Stack gap="lg">
      <PageNumber format="Page {page} of {pages}" align="left" />
      <PageNumber format="{page} / {pages}" align="center" />
      <PageNumber format="Sheet {page}" align="right" />
    </Stack>
  );
}
export function PageNumberTotalExample() {
  return <PageNumber format="Page {page} of {pages}" />;
}
export function PageNumberCompactExample() {
  return <PageNumber format="{page} / {pages}" align="center" />;
}
export function PageHeaderExample({ logoSource }: { logoSource: string }) {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={format}
      theme={theme}
      margin={36}
      header={{
        height: 32,
        gap: 12,
        content: (
          <PageHeader
            logo={{
              resolvedSource: logoSource,
              alt: "Studio North mark",
              width: 20,
              height: 20,
            }}
          >
            <Heading>Studio North</Heading>
          </PageHeader>
        ),
      }}
    >
      <Text>
        The header occupies its own reserved region, separate from the flowing
        body.
      </Text>
    </DocumentFrame>
  );
}
export function PageHeaderLogoExample({ logoSource }: { logoSource: string }) {
  return <PageHeaderExample logoSource={logoSource} />;
}
export function PageFooterExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={format}
      theme={theme}
      margin={36}
      footer={{
        height: 18,
        gap: 12,
        content: (
          <PageFooter>
            <Text size="caption">hello@example.com</Text>
          </PageFooter>
        ),
      }}
    >
      <Heading>Delivery notes</Heading>
      <Text>
        The footer stays inside the page margin and includes the final page
        count.
      </Text>
    </DocumentFrame>
  );
}
export function PageFooterWithoutNumberExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame
      format={format}
      theme={theme}
      margin={36}
      footer={{
        height: 18,
        gap: 12,
        content: (
          <PageFooter pageNumber={false}>
            <Text size="caption">Confidential · Studio North</Text>
          </PageFooter>
        ),
      }}
    >
      <Heading>Internal brief</Heading>
    </DocumentFrame>
  );
}
export function WatermarkExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <>
      <DocumentFrame format={format} theme={theme} margin={36}>
        <Heading>Review copy</Heading>
        <Text>A centered mark repeats on every page by default.</Text>
        <Watermark
          text="CONFIDENTIAL"
          placement="center"
          fontSize={72}
          opacity={0.1}
          rotation={-38}
        />
      </DocumentFrame>
      <DocumentFrame format={format} theme={theme} margin={36}>
        <Heading>Horizontal review copy</Heading>
        <Text>The same full-page mark can remain horizontal.</Text>
        <Watermark
          text="CONFIDENTIAL"
          placement="center"
          fontSize={72}
          opacity={0.1}
          rotation={0}
        />
      </DocumentFrame>
      <DocumentFrame format={format} theme={theme} margin={36}>
        <Heading>Vertical review copy</Heading>
        <Text>The same full-page mark can run vertically.</Text>
        <Watermark
          text="CONFIDENTIAL"
          placement="center"
          fontSize={72}
          opacity={0.1}
          rotation={-90}
        />
      </DocumentFrame>
    </>
  );
}
export function WatermarkRepeatedExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
      <Heading>Review copy</Heading>
      <Watermark
        text="CONFIDENTIAL"
        fontSize={72}
        opacity={0.1}
        rotation={-38}
        repeat
      />
    </DocumentFrame>
  );
}
export function WatermarkHorizontalExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
      <Heading>Horizontal review copy</Heading>
      <Watermark text="CONFIDENTIAL" fontSize={72} opacity={0.1} />
    </DocumentFrame>
  );
}
export function WatermarkVerticalExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
      <Heading>Vertical review copy</Heading>
      <Watermark
        text="CONFIDENTIAL"
        fontSize={72}
        opacity={0.1}
        rotation={-90}
      />
    </DocumentFrame>
  );
}
