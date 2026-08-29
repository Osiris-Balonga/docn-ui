import { Document, View } from "@react-pdf/renderer";
import type { RenderRequest } from "../../../core/contracts";
import type { ResolvedFixedFormat } from "../../../core/formats";
import { Heading, PageFrame, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import type { BusinessCardData } from "../schema";
import { createBusinessCardPlan } from "../plan";
import { businessCardMinimalMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function ContactRows({
  entries,
}: {
  entries: ReadonlyArray<readonly [string, string | undefined]>;
}) {
  const visibleEntries = entries.filter(
    (entry): entry is readonly [string, string] => Boolean(entry[1]),
  );
  if (visibleEntries.length === 0) return null;
  return (
    <View style={{ gap: 3 }}>
      {visibleEntries.map(([label, value]) => (
        <View
          key={label}
          style={{ alignItems: "flex-start", flexDirection: "row" }}
          wrap={false}
        >
          <View style={{ width: 48 }}>
            <Text size="caption" tone="muted">
              {label}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text size="label">{value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function BusinessCardMinimalDocument({
  data,
  format,
  locale,
  printProfile,
  themeId,
}: {
  data: BusinessCardData;
  format: ResolvedFixedFormat;
  locale: "en" | "fr";
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}) {
  const theme = getPdfTheme(themeId);
  const labels =
    locale === "fr"
      ? { address: "Adresse", phone: "Téléphone", website: "Site" }
      : { address: "Address", phone: "Phone", website: "Website" };
  const brand = data.organization ?? data.name;
  return (
    <Document
      title={`${data.name} — minimal business card`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-US"}
    >
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View
          style={{ height: "100%", justifyContent: "space-between" }}
          wrap={false}
        >
          <View>
            <View
              style={{
                backgroundColor: theme.colors.accent,
                height: 4,
                marginBottom: theme.spacing.md,
                width: 34,
              }}
            />
            <Heading level="display">{data.name}</Heading>
            {data.role ? <Text tone="muted">{data.role}</Text> : null}
            {data.organization ? <Text>{data.organization}</Text> : null}
          </View>
          <ContactRows
            entries={[
              ["Email", data.email],
              [labels.phone, data.phone],
              [labels.website, data.website?.replace(/^https?:\/\//, "")],
              [labels.address, data.address],
            ]}
          />
        </View>
      </PageFrame>
      <PageFrame
        backgroundColor={theme.colors.accent}
        format={format}
        printProfile={printProfile}
        theme={theme}
      >
        <View
          style={{
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
          }}
          wrap={false}
        >
          <Heading level="display" tone="inverted">
            {brand}
          </Heading>
          {data.website ? (
            <View style={{ marginTop: theme.spacing.md }}>
              <Text tone="inverted">
                {data.website.replace(/^https?:\/\//, "")}
              </Text>
            </View>
          ) : null}
        </View>
      </PageFrame>
    </Document>
  );
}

export function createBusinessCardMinimalPlan(input: unknown) {
  return createBusinessCardPlan(input, businessCardMinimalMetadata, (props) => (
    <BusinessCardMinimalDocument {...props} />
  ));
}
