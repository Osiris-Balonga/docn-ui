import { Document, View } from "@react-pdf/renderer";
import { Heading, PageFrame, QRCode, Text } from "../../../primitives";
import { getPdfTheme } from "../../../themes/themes";
import {
  createBusinessCardPlan,
  type BusinessCardDocumentProps,
} from "../plan";
import { businessCardStudioMetadata } from "./metadata";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");

export function BusinessCardStudioDocument({
  data,
  format,
  locale,
  overrides,
  printProfile,
  themeId,
}: BusinessCardDocumentProps) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
  const brand = data.organization ?? "Independent studio";
  return (
    <Document
      title={`${data.name} — studio business card`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-US"}
    >
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View style={{ flexDirection: "row", height: "100%" }} wrap={false}>
          <View
            style={{
              backgroundColor: theme.colors.accent,
              justifyContent: "space-between",
              padding: 10,
              width: "42%",
            }}
          >
            <Text size="caption" tone="inverted">
              STUDIO / 01
            </Text>
            <Heading tone="inverted">{brand}</Heading>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingLeft: 14,
            }}
          >
            <View>
              <Heading level="display">{data.name}</Heading>
              {data.role ? <Text tone="muted">{data.role}</Text> : null}
            </View>
            <View style={{ gap: 3 }}>
              {data.email ? <Text size="caption">{data.email}</Text> : null}
              {data.phone ? <Text size="caption">{data.phone}</Text> : null}
            </View>
          </View>
        </View>
      </PageFrame>
      <PageFrame format={format} printProfile={printProfile} theme={theme}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            height: "100%",
            gap: 16,
          }}
          wrap={false}
        >
          {data.qrPayload ? (
            <QRCode
              payload={data.qrPayload}
              size={64}
              color={theme.colors.text}
            />
          ) : null}
          <View style={{ flex: 1 }}>
            <Heading>{data.name}</Heading>
            <Text tone="muted">{brand}</Text>
            {data.website ? (
              <View style={{ marginTop: 8 }}>
                <Text size="caption">
                  {data.website.replace(/^https?:\/\//, "")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}

export function createBusinessCardStudioPlan(
  input: unknown,
  options?: import("../plan").BusinessCardPlanOptions,
) {
  return createBusinessCardPlan(
    input,
    businessCardStudioMetadata,
    (props) => <BusinessCardStudioDocument {...props} />,
    options,
  );
}
