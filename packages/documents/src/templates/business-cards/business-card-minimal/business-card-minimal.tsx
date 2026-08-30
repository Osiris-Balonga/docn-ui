import { Document, View } from "@react-pdf/renderer";
import type { RenderRequest } from "../../../core/contracts";
import type { ResolvedFixedFormat } from "../../../core/formats";
import { Heading, Image, PageFrame, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import type { BusinessCardData } from "../schema";
import { createBusinessCardPlan } from "../plan";
import { businessCardMinimalMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

function ContactColumn({
  values,
}: {
  values: readonly (string | undefined)[];
}) {
  const visibleValues = values.filter((value): value is string =>
    Boolean(value),
  );
  if (visibleValues.length === 0) return null;
  return (
    <View style={{ flex: 1, gap: 3 }}>
      {visibleValues.map((value, index) => (
        <Text key={`${index}:${value}`} size="caption">
          {value}
        </Text>
      ))}
    </View>
  );
}

export function BusinessCardMinimalDocument({
  data,
  format,
  locale,
  logoSource,
  overrides,
  printProfile,
  themeId,
}: {
  data: BusinessCardData;
  format: ResolvedFixedFormat;
  locale: "en" | "fr";
  logoSource?: string | undefined;
  overrides: NonNullable<RenderRequest["overrides"]>;
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
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
          <View
            style={{
              alignItems: "flex-start",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text size="caption" tone="muted">
              {data.organization ??
                (locale === "fr"
                  ? "Activité indépendante"
                  : "Independent practice")}
            </Text>
            {logoSource ? (
              <Image
                alt="Imported logo"
                height={14}
                resolvedSource={logoSource}
                width={28}
              />
            ) : null}
          </View>
          <View>
            <Heading level="display">{data.name}</Heading>
            {data.role ? <Text tone="muted">{data.role}</Text> : null}
          </View>
          <View
            style={{
              borderTopColor: theme.colors.border,
              borderTopWidth: 0.75,
              flexDirection: "row",
              gap: 12,
              paddingTop: 7,
            }}
          >
            <ContactColumn values={[data.email, data.phone]} />
            <ContactColumn
              values={[data.website?.replace(/^https?:\/\//, ""), data.address]}
            />
          </View>
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
          {logoSource ? (
            <View style={{ marginBottom: theme.spacing.md }}>
              <Image
                alt="Imported logo"
                height={24}
                resolvedSource={logoSource}
                width={48}
              />
            </View>
          ) : null}
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

export function createBusinessCardMinimalPlan(
  input: unknown,
  options?: import("../plan").BusinessCardPlanOptions,
) {
  return createBusinessCardPlan(
    input,
    businessCardMinimalMetadata,
    (props) => <BusinessCardMinimalDocument {...props} />,
    options,
  );
}
