import {
  Document,
  type DocumentProps,
  Font,
  Line,
  Page,
  Rect,
  Svg,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { cardTrim, millimetersToPoints } from "../core/units";
import {
  applyPrintBoxes,
  getPageGeometry,
  type QualificationPrintProfile,
} from "./print-profile";

export interface QualificationRenderOptions {
  fixture: "card" | "table";
  fontSource: string;
  name?: string;
  printProfile?: QualificationPrintProfile;
}

export type QualificationDocumentRenderer = (
  document: ReactElement<DocumentProps>,
) => Promise<Uint8Array>;

const fixedDate = new Date("2026-01-15T12:00:00.000Z");
const styles = StyleSheet.create({
  page: {
    color: "#17212b",
    fontFamily: "NotoSansQualification",
  },
  card: { position: "absolute" },
  accent: { backgroundColor: "#e45835", height: 7, width: 44 },
  name: { fontSize: 19 },
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
});

function registerFont(source: string) {
  Font.register({
    family: "NotoSansQualification",
    src: source,
    fontWeight: 400,
  });
  Font.registerHyphenationCallback((word) => [word]);
}

function CropMarks({
  bleedInset,
  mediaHeight,
  mediaWidth,
  trimInset,
}: ReturnType<typeof getPageGeometry>) {
  const gap = millimetersToPoints(1);
  const farX = mediaWidth - trimInset;
  const farY = mediaHeight - trimInset;
  const stroke = "#17212b";
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
        fill="#f7f3ec"
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
}: {
  name: string;
  profile: QualificationPrintProfile;
}) {
  const geometry = getPageGeometry(cardTrim.width, cardTrim.height, profile);
  const contentInset = geometry.trimInset;
  const pageBackground =
    profile.kind === "print" && profile.cropMarks ? "#ffffff" : "#f7f3ec";
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
        ]}
      >
        {profile.kind === "print" && profile.cropMarks ? (
          <CropMarks {...geometry} />
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
            style={[styles.accent, { position: "absolute", left: 18, top: 18 }]}
          />
          <View style={{ position: "absolute", left: 18, bottom: 18 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.small}>Direction créative · Brazzaville</Text>
            <Text style={styles.small}>bonjour@docn-ui.dev</Text>
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
        ]}
      >
        {profile.kind === "print" && profile.cropMarks ? (
          <CropMarks {...geometry} />
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
              { position: "absolute", left: 18, bottom: 18 },
            ]}
          />
        </View>
      </Page>
    </Document>
  );
}

function TableDocument() {
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
      <Page size={[width, height]} style={[styles.page, styles.tablePage]} wrap>
        <Text style={styles.tableHeader} fixed>
          Small multipage table
        </Text>
        {rows.map((row) => (
          <View key={row} style={styles.tableRow} wrap={false}>
            <Text style={styles.rowIndex}>{String(row).padStart(2, "0")}</Text>
            <Text>Deterministic pagination row {row}</Text>
          </View>
        ))}
        <Text style={styles.small}>Final marker row 56</Text>
      </Page>
    </Document>
  );
}

export async function renderQualification(
  options: QualificationRenderOptions,
  renderDocument: QualificationDocumentRenderer,
): Promise<Uint8Array> {
  registerFont(options.fontSource);
  if (options.fixture === "table") return renderDocument(<TableDocument />);
  const profile = options.printProfile ?? { kind: "screen" };
  const geometry = getPageGeometry(cardTrim.width, cardTrim.height, profile);
  const raw = await renderDocument(
    <CardDocument name={options.name ?? "Élodie Mbemba"} profile={profile} />,
  );
  return applyPrintBoxes(raw, geometry);
}
