import { Image, Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { QRCode } from "../../primitives";
import { millimetersToPoints } from "../../core/units";
import type { PdfTheme } from "../../themes/themes";
import type { LabelContent } from "./schema";

export type LabelComposition = "address" | "inventory" | "product";

export interface LabelAssetSources {
  readonly [assetId: string]: string;
}

const bodyText = (theme: PdfTheme) => ({
  color: theme.colors.text,
  fontFamily: theme.fonts.body,
  fontSize: theme.typeScale.body,
  fontWeight: theme.fonts.regularWeight,
  lineHeight: 1.28,
});

const mutedText = (theme: PdfTheme) => ({
  ...bodyText(theme),
  color: theme.colors.mutedText,
  fontSize: theme.typeScale.caption,
});

const headingText = (theme: PdfTheme, compact: boolean) => ({
  color: theme.colors.text,
  fontFamily: theme.fonts.heading,
  fontSize: compact ? theme.typeScale.heading : theme.typeScale.display,
  fontWeight: theme.fonts.strongWeight,
  lineHeight: 1.08,
});

function Logo({ source }: { source?: string | undefined }) {
  return source ? (
    <Image
      src={{ uri: source }}
      style={{ height: 18, objectFit: "contain", width: 42 }}
    />
  ) : null;
}

function ProductLabel({ compact, data, logoSource, theme }: LabelBodyProps) {
  const qrSize = compact ? 42 : 50;
  return (
    <View
      style={{
        flexDirection: "row",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{ flex: 1, justifyContent: "space-between", paddingRight: 8 }}
      >
        <View style={{ gap: 3 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {data.reference ? (
              <Text style={mutedText(theme)}>{data.reference}</Text>
            ) : (
              <View />
            )}
            <Logo source={logoSource} />
          </View>
          <Text style={headingText(theme, compact)}>{data.title}</Text>
          {data.subtitle ? (
            <Text style={mutedText(theme)}>{data.subtitle}</Text>
          ) : null}
        </View>
        {data.lines.length > 0 ? (
          <Text style={bodyText(theme)}>{data.lines.join(" · ")}</Text>
        ) : null}
      </View>
      {data.qrPayload ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <QRCode
            payload={data.qrPayload}
            size={qrSize}
            minimumModuleSize={0.75}
          />
        </View>
      ) : null}
    </View>
  );
}

function AddressLabel({ data, logoSource, theme }: LabelBodyProps) {
  return (
    <View style={{ height: "100%", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={mutedText(theme)}>{data.reference ?? "DELIVER TO"}</Text>
        <Logo source={logoSource} />
      </View>
      <View style={{ gap: 3 }}>
        <Text style={headingText(theme, true)}>{data.title}</Text>
        {data.lines.map((line) => (
          <Text key={line} style={bodyText(theme)}>
            {line}
          </Text>
        ))}
      </View>
      {data.subtitle ? (
        <Text style={mutedText(theme)}>{data.subtitle}</Text>
      ) : null}
    </View>
  );
}

function InventoryLabel({ compact, data, theme }: LabelBodyProps) {
  const qrSize = compact ? 43 : 58;
  return (
    <View style={{ flexDirection: "row", height: "100%" }}>
      <View
        style={{
          backgroundColor: theme.colors.accent,
          marginRight: 9,
          width: 6,
        }}
      />
      <View
        style={{ flex: 1, justifyContent: "space-between", paddingRight: 8 }}
      >
        <Text style={mutedText(theme)}>INVENTORY</Text>
        <Text style={headingText(theme, compact)}>
          {data.reference ?? data.title}
        </Text>
        <View>
          {data.reference ? (
            <Text style={bodyText(theme)}>{data.title}</Text>
          ) : null}
          {data.lines.map((line) => (
            <Text key={line} style={mutedText(theme)}>
              {line}
            </Text>
          ))}
        </View>
      </View>
      {data.qrPayload ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <QRCode
            payload={data.qrPayload}
            size={qrSize}
            minimumModuleSize={0.75}
          />
        </View>
      ) : null}
    </View>
  );
}

interface LabelBodyProps {
  compact: boolean;
  data: LabelContent;
  logoSource?: string | undefined;
  theme: PdfTheme;
}

export function LabelBody({
  composition,
  ...props
}: LabelBodyProps & { composition: LabelComposition }) {
  if (composition === "address") return <AddressLabel {...props} />;
  if (composition === "inventory") return <InventoryLabel {...props} />;
  return <ProductLabel {...props} />;
}

export function SheetPage({
  children,
  heightMm,
  theme,
  widthMm,
}: {
  children: ReactNode;
  heightMm: number;
  theme: PdfTheme;
  widthMm: number;
}) {
  return (
    <Page
      size={[millimetersToPoints(widthMm), millimetersToPoints(heightMm)]}
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        height: millimetersToPoints(heightMm),
        width: millimetersToPoints(widthMm),
      }}
    >
      {children}
    </Page>
  );
}
