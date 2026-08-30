import {
  Document,
  Line,
  Page,
  Rect,
  Svg,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ThemeId } from "../core/contracts";
import { resolveFormat, type PrintProfile } from "../core/formats";
import { DocumentValidationError } from "../core/errors";
import { millimetersToPoints } from "../core/units";
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
import { registerDocumentFonts } from "./fonts";
import { getPageGeometry } from "./print-profile";
import {
  renderContinuousDocument,
  renderFixedDocument,
  type DocumentRenderRuntime,
} from "./runtime";

export interface FeasibilityRenderOptions {
  fixture: "card" | "primitives" | "receipt" | "table";
  name?: string;
  printProfile?: PrintProfile;
  receipt?: {
    finalText: string;
    lineCount: number;
    maxHeightMm?: number;
    widthMm: 58 | 80;
  };
  themeId?: ThemeId;
}

export interface FeasibilityMeasurement {
  pageCount: number;
  usedHeight: number;
}

export type FeasibilityDocumentMeasurer = (
  bytes: Uint8Array,
  finalText: string,
) => Promise<FeasibilityMeasurement>;

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
const qualificationCardFormat = (() => {
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
      <PageFrame format={qualificationCardFormat} theme={theme}>
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
  profile: PrintProfile;
  theme: PdfTheme;
}) {
  const geometry = getPageGeometry(
    qualificationCardFormat.trim.widthPt,
    qualificationCardFormat.trim.heightPt,
    profile,
  );
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
  options: FeasibilityRenderOptions,
  theme: PdfTheme,
  runtime: DocumentRenderRuntime,
  measureDocument: FeasibilityDocumentMeasurer | undefined,
) {
  if (!options.receipt || !measureDocument) {
    throw new DocumentValidationError([
      {
        code: "RENDER_FAILED",
        message: "Receipt rendering requires measured PDF content.",
        path: ["data"],
      },
    ]);
  }
  const { finalText, lineCount, widthMm } = options.receipt;
  const maxHeightMm = options.receipt.maxHeightMm ?? MAX_RECEIPT_HEIGHT_MM;
  if (!Number.isSafeInteger(lineCount) || lineCount < 1 || lineCount > 300) {
    throw new DocumentValidationError([
      {
        code: "LIMIT_EXCEEDED",
        message: "Receipt content exceeds the qualified line limit.",
        path: ["data", "lines"],
      },
    ]);
  }
  const format = resolveFormat(widthMm === 58 ? "receipt-58" : "receipt-80");
  if (format.kind !== "continuous")
    throw new Error("Expected a continuous receipt format.");
  const constrainedFormat = {
    ...format,
    maxHeightMm,
    maxHeightPt: millimetersToPoints(maxHeightMm),
  };
  return renderContinuousDocument(
    {
      createDocument: (height) => (
        <ReceiptDocument
          finalText={finalText}
          height={height}
          lineCount={lineCount}
          theme={theme}
          width={format.widthPt}
        />
      ),
      finalMarker: finalText,
      format: constrainedFormat,
    },
    runtime,
    async (bytes, marker) => {
      const measurement = await measureDocument(bytes, marker);
      return {
        pageCount: measurement.pageCount,
        usedHeightPt: measurement.usedHeight,
      };
    },
  );
}

export async function renderFeasibilityFixture(
  options: FeasibilityRenderOptions,
  runtime: DocumentRenderRuntime,
  measureDocument?: FeasibilityDocumentMeasurer,
): Promise<Uint8Array> {
  registerDocumentFonts(runtime.assetResolver);
  const theme = getPdfTheme(options.themeId ?? "neutral");
  if (options.fixture === "primitives") {
    return renderFixedDocument(
      {
        document: <PrimitivesDocument theme={theme} />,
        format: qualificationCardFormat,
        printProfile: { kind: "screen" },
      },
      runtime,
    );
  }
  if (options.fixture === "table")
    return runtime.renderDocument(<TableDocument theme={theme} />);
  if (options.fixture === "receipt") {
    return renderMeasuredReceipt(options, theme, runtime, measureDocument);
  }
  const profile = options.printProfile ?? { kind: "screen" };
  return renderFixedDocument(
    {
      document: (
        <CardDocument
          name={options.name ?? "Élodie Mbemba"}
          profile={profile}
          theme={theme}
        />
      ),
      format: qualificationCardFormat,
      printProfile: profile,
    },
    runtime,
  );
}
