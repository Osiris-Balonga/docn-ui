import {
  Document,
  type DocumentProps,
  Line,
  Page,
  Rect,
  Svg,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ThemeId } from "../core/contracts";
import { resolveFormat } from "../core/formats";
import { cardTrim, millimetersToPoints } from "../core/units";
import {
  FieldPair,
  Heading,
  PageFrame,
  Row,
  Separator,
  Stack,
  Text as DocumentText,
} from "../primitives";
import { getPdfTheme, type PdfTheme } from "../themes/themes";
import type { AssetResolver } from "./assets";
import { registerDocumentFonts } from "./fonts";
import {
  applyPrintBoxes,
  getPageGeometry,
  type QualificationPrintProfile,
} from "./print-profile";

export interface QualificationRenderOptions {
  assetResolver: AssetResolver;
  fixture: "card" | "primitives" | "receipt" | "table";
  name?: string;
  printProfile?: QualificationPrintProfile;
  receipt?: {
    finalText: string;
    lineCount: number;
    maxHeightMm?: number;
    widthMm: 58 | 80;
  };
  themeId?: ThemeId;
}

export type QualificationDocumentRenderer = (
  document: ReactElement<DocumentProps>,
) => Promise<Uint8Array>;

export interface QualificationMeasurement {
  pageCount: number;
  usedHeight: number;
}

export type QualificationDocumentMeasurer = (
  bytes: Uint8Array,
  finalText: string,
) => Promise<QualificationMeasurement>;

export class PdfQualificationError extends Error {
  constructor(
    readonly code: "RECEIPT_HEIGHT_LIMIT" | "RECEIPT_MEASUREMENT_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "PdfQualificationError";
  }
}

const fixedDate = new Date("2026-01-15T12:00:00.000Z");
const styles = StyleSheet.create({
  page: {},
  card: { position: "absolute" },
  accent: { height: 7, width: 44 },
  name: {},
  small: { fontSize: 7, lineHeight: 1.45 },
  tablePage: { padding: 28, fontSize: 9, lineHeight: 1.35 },
  tableHeader: { fontSize: 16, marginBottom: 12 },
  tableRow: {
    borderBottomColor: "#c7c2ba",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    paddingVertical: 4,
  },
  rowIndex: { width: 28 },
  receiptPage: {
    backgroundColor: "#ffffff",
    color: "#151515",
    fontSize: 8,
    lineHeight: 1.3,
    padding: 12,
  },
  receiptHeader: { fontSize: 13, marginBottom: 8 },
  receiptMeta: { color: "#555555", fontSize: 7, marginBottom: 8 },
  receiptRow: {
    borderBottomColor: "#d4d4d4",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    gap: 5,
    paddingVertical: 3,
  },
  receiptDescription: { flex: 1 },
  receiptPrice: { textAlign: "right", width: 34 },
  receiptTotal: { fontSize: 10, marginTop: 9, textAlign: "right" },
  receiptMarker: { fontSize: 6, marginTop: 8 },
});

const MAX_RECEIPT_HEIGHT_MM = 500;
const RECEIPT_HEIGHT_SAFETY_POINTS = 12;
const primitiveCardFormat = (() => {
  const format = resolveFormat("card-85x55");
  if (format.kind !== "fixed") {
    throw new Error(
      "The primitives qualification requires a fixed card format.",
    );
  }
  return format;
})();

function PrimitivesDocument({ theme }: { theme: PdfTheme }) {
  return (
    <Document
      title="docn-ui PDF primitives qualification"
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language="fr-FR"
    >
      <PageFrame format={primitiveCardFormat} theme={theme}>
        <Stack gap="sm">
          <Heading>Élodie Mbemba</Heading>
          <DocumentText tone="muted">
            Creative direction · Direction créative
          </DocumentText>
          <Separator spacing="xs" />
          <Row gap="lg">
            <FieldPair label="Email" value="bonjour@docn-ui.dev" />
            <FieldPair label="Location" value="Brazzaville" />
          </Row>
        </Stack>
      </PageFrame>
    </Document>
  );
}

function CropMarks({
  bleedInset,
  mediaHeight,
  mediaWidth,
  theme,
  trimInset,
}: ReturnType<typeof getPageGeometry> & { theme: PdfTheme }) {
  const gap = millimetersToPoints(1);
  const farX = mediaWidth - trimInset;
  const farY = mediaHeight - trimInset;
  const stroke = theme.colors.text;
  const strokeWidth = 0.5;
  const lines: Array<readonly [number, number, number, number]> = [
    [0, trimInset, trimInset - gap, trimInset],
    [farX + gap, trimInset, mediaWidth, trimInset],
    [0, farY, trimInset - gap, farY],
    [farX + gap, farY, mediaWidth, farY],
    [trimInset, 0, trimInset, trimInset - gap],
    [farX, 0, farX, trimInset - gap],
    [trimInset, farY + gap, trimInset, mediaHeight],
    [farX, farY + gap, farX, mediaHeight],
  ];
  return (
    <Svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={mediaWidth}
      height={mediaHeight}
    >
      <Rect
        x={bleedInset}
        y={bleedInset}
        width={mediaWidth - 2 * bleedInset}
        height={mediaHeight - 2 * bleedInset}
        fill={theme.colors.canvas}
      />
      {lines.map(([x1, y1, x2, y2], index) => (
        <Line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </Svg>
  );
}

function CardDocument({
  name,
  profile,
  theme,
}: {
  name: string;
  profile: QualificationPrintProfile;
  theme: PdfTheme;
}) {
  const geometry = getPageGeometry(cardTrim.width, cardTrim.height, profile);
  const contentInset = geometry.trimInset;
  const pageBackground =
    profile.kind === "print" && profile.cropMarks
      ? theme.colors.surface
      : theme.colors.canvas;
  const pageTheme = {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fonts.regularWeight,
  } as const;
  const nameTheme = {
    fontFamily: theme.fonts.heading,
    fontSize: theme.typeScale.display,
    fontWeight: theme.fonts.strongWeight,
  } as const;
  return (
    <Document
      title="docn-ui PDF qualification card"
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language="fr-FR"
    >
      <Page
        size={[geometry.mediaWidth, geometry.mediaHeight]}
        style={[
          styles.page,
          {
            backgroundColor: pageBackground,
            width: geometry.mediaWidth,
            height: geometry.mediaHeight,
          },
          pageTheme,
        ]}
      >
        {profile.kind === "print" && profile.cropMarks ? (
          <CropMarks {...geometry} theme={theme} />
        ) : null}
        <View
          wrap={false}
          style={[
            styles.card,
            {
              left: contentInset,
              top: contentInset,
              width: geometry.trimWidth,
              height: geometry.trimHeight,
            },
          ]}
        >
          <View
            style={[
              styles.accent,
              {
                backgroundColor: theme.colors.accent,
                position: "absolute",
                left: 18,
                top: 18,
              },
            ]}
          />
          <View style={{ position: "absolute", left: 18, bottom: 18 }}>
            <Text style={[styles.name, nameTheme]}>{name}</Text>
            <Text style={[styles.small, { fontSize: theme.typeScale.caption }]}>
              Direction créative · Brazzaville
            </Text>
            <Text style={[styles.small, { fontSize: theme.typeScale.caption }]}>
              bonjour@docn-ui.dev
            </Text>
          </View>
        </View>
      </Page>
      <Page
        size={[geometry.mediaWidth, geometry.mediaHeight]}
        style={[
          styles.page,
          {
            backgroundColor: pageBackground,
            width: geometry.mediaWidth,
            height: geometry.mediaHeight,
          },
          pageTheme,
        ]}
      >
        {profile.kind === "print" && profile.cropMarks ? (
          <CropMarks {...geometry} theme={theme} />
        ) : null}
        <View
          wrap={false}
          style={[
            styles.card,
            {
              left: contentInset,
              top: contentInset,
              width: geometry.trimWidth,
              height: geometry.trimHeight,
            },
          ]}
        >
          <Text
            style={[styles.small, { position: "absolute", left: 18, top: 18 }]}
          >
            Back side · 2 / 2
          </Text>
          <Text
            style={[
              styles.name,
              nameTheme,
              { fontSize: theme.typeScale.heading, lineHeight: 1.2 },
              {
                position: "absolute",
                left: 18,
                top: 57,
                width: geometry.trimWidth - 36,
              },
            ]}
          >
            Documents précis, sources ouvertes.
          </Text>
          <View
            style={[
              styles.accent,
              {
                backgroundColor: theme.colors.accent,
                position: "absolute",
                left: 18,
                bottom: 18,
              },
            ]}
          />
        </View>
      </Page>
    </Document>
  );
}

function TableDocument({ theme }: { theme: PdfTheme }) {
  const width = millimetersToPoints(105);
  const height = millimetersToPoints(148);
  const rows = Array.from({ length: 56 }, (_, index) => index + 1);
  return (
    <Document
      title="docn-ui pagination qualification"
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language="en-US"
    >
      <Page
        size={[width, height]}
        style={[
          styles.page,
          styles.tablePage,
          { color: theme.colors.text, fontFamily: theme.fonts.body },
        ]}
        wrap
      >
        <Text
          style={[
            styles.tableHeader,
            {
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fonts.strongWeight,
            },
          ]}
          fixed
        >
          Small multipage table
        </Text>
        {rows.map((row) => (
          <View
            key={row}
            style={[
              styles.tableRow,
              { borderBottomColor: theme.colors.border },
            ]}
            wrap={false}
          >
            <Text style={styles.rowIndex}>{String(row).padStart(2, "0")}</Text>
            <Text>Deterministic pagination row {row}</Text>
          </View>
        ))}
        <Text style={styles.small}>Final marker row 56</Text>
      </Page>
    </Document>
  );
}

function ReceiptDocument({
  finalText,
  height,
  lineCount,
  theme,
  width,
}: {
  finalText: string;
  height: number;
  lineCount: number;
  theme: PdfTheme;
  width: number;
}) {
  const rows = Array.from({ length: lineCount }, (_, index) => index + 1);
  return (
    <Document
      title="docn-ui roll receipt qualification"
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language="en-US"
    >
      <Page
        size={[width, height]}
        style={[
          styles.page,
          styles.receiptPage,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
          },
        ]}
      >
        <Text
          style={[
            styles.receiptHeader,
            {
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fonts.strongWeight,
            },
          ]}
        >
          Nzela Corner Store
        </Text>
        <Text style={[styles.receiptMeta, { color: theme.colors.mutedText }]}>
          Receipt Q-2026-0115 · 15 Jan 2026 · 13:00
        </Text>
        {rows.map((row) => (
          <View
            key={row}
            style={[
              styles.receiptRow,
              { borderBottomColor: theme.colors.border },
            ]}
            wrap={false}
          >
            <Text style={styles.receiptDescription}>
              {row.toString().padStart(2, "0")} · Roasted cassava flour with
              spice blend
            </Text>
            <Text style={styles.receiptPrice}>{(row * 1.25).toFixed(2)}</Text>
          </View>
        ))}
        <Text style={styles.receiptTotal}>
          TOTAL {(lineCount * 6.25).toFixed(2)} USD
        </Text>
        <Text style={styles.receiptMarker}>{finalText}</Text>
      </Page>
    </Document>
  );
}

async function renderMeasuredReceipt(
  options: QualificationRenderOptions,
  theme: PdfTheme,
  renderDocument: QualificationDocumentRenderer,
  measureDocument: QualificationDocumentMeasurer | undefined,
) {
  if (!options.receipt || !measureDocument) {
    throw new PdfQualificationError(
      "RECEIPT_MEASUREMENT_FAILED",
      "Receipt rendering requires measured PDF content.",
    );
  }
  const { finalText, lineCount, widthMm } = options.receipt;
  const maxHeightMm = options.receipt.maxHeightMm ?? MAX_RECEIPT_HEIGHT_MM;
  if (!Number.isSafeInteger(lineCount) || lineCount < 1 || lineCount > 300) {
    throw new PdfQualificationError(
      "RECEIPT_HEIGHT_LIMIT",
      "Receipt content exceeds the qualified line limit.",
    );
  }
  const width = millimetersToPoints(widthMm);
  const maxHeight = millimetersToPoints(maxHeightMm);
  const probe = await renderDocument(
    <ReceiptDocument
      finalText={finalText}
      height={maxHeight}
      lineCount={lineCount}
      theme={theme}
      width={width}
    />,
  );
  let measurement: QualificationMeasurement;
  try {
    measurement = await measureDocument(probe, finalText);
  } catch {
    throw new PdfQualificationError(
      "RECEIPT_MEASUREMENT_FAILED",
      "The rendered receipt content could not be measured.",
    );
  }
  const height = measurement.usedHeight + RECEIPT_HEIGHT_SAFETY_POINTS;
  if (measurement.pageCount !== 1 || height > maxHeight) {
    throw new PdfQualificationError(
      "RECEIPT_HEIGHT_LIMIT",
      `Receipt content exceeds the ${maxHeightMm} mm height limit.`,
    );
  }
  const raw = await renderDocument(
    <ReceiptDocument
      finalText={finalText}
      height={height}
      lineCount={lineCount}
      theme={theme}
      width={width}
    />,
  );
  return applyPrintBoxes(
    raw,
    getPageGeometry(width, height, { kind: "screen" }),
  );
}

export async function renderQualification(
  options: QualificationRenderOptions,
  renderDocument: QualificationDocumentRenderer,
  measureDocument?: QualificationDocumentMeasurer,
): Promise<Uint8Array> {
  registerDocumentFonts(options.assetResolver);
  const theme = getPdfTheme(options.themeId ?? "neutral");
  if (options.fixture === "primitives") {
    const raw = await renderDocument(<PrimitivesDocument theme={theme} />);
    return applyPrintBoxes(
      raw,
      getPageGeometry(
        primitiveCardFormat.trim.widthPt,
        primitiveCardFormat.trim.heightPt,
        { kind: "screen" },
      ),
    );
  }
  if (options.fixture === "table")
    return renderDocument(<TableDocument theme={theme} />);
  if (options.fixture === "receipt") {
    return renderMeasuredReceipt(
      options,
      theme,
      renderDocument,
      measureDocument,
    );
  }
  const profile = options.printProfile ?? { kind: "screen" };
  const geometry = getPageGeometry(cardTrim.width, cardTrim.height, profile);
  const raw = await renderDocument(
    <CardDocument
      name={options.name ?? "Élodie Mbemba"}
      profile={profile}
      theme={theme}
    />,
  );
  return applyPrintBoxes(raw, geometry);
}
