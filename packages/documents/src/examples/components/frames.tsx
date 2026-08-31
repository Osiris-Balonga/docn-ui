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
      </Stack>
    </DocumentFrame>
  );
}
export function PageFrameExample() {
  const card = resolveFormat("card-85x55");
  if (card.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <PageFrame format={card} theme={theme}>
      <Stack gap="lg">
        <Heading>Élodie Mbemba</Heading>
        <Text>Creative director</Text>
        <Text size="caption">hello@example.com</Text>
      </Stack>
    </PageFrame>
  );
}
export function KeepTogetherExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
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
export function PageNumberExample() {
  return <PageNumber format="Page {page} of {pages}" align="center" />;
}
export function PageHeaderExample() {
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
          <PageHeader>
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
export function WatermarkExample() {
  if (format.kind !== "fixed") throw new Error("Expected a fixed page.");
  return (
    <DocumentFrame format={format} theme={theme} margin={36}>
      <Heading>Review copy</Heading>
      <Text>This document is awaiting approval.</Text>
      <Watermark text="DRAFT" opacity={0.12} />
    </DocumentFrame>
  );
}
