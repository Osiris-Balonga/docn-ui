import { Document, View } from "@react-pdf/renderer";
import type { RenderRequest, TemplateMetadata } from "../../core/contracts";
import { validateRenderRequest } from "../../core/contracts";
import { DocumentValidationError } from "../../core/errors";
import { resolveFormat, type ResolvedFixedFormat } from "../../core/formats";
import { imposeLabelSheet } from "../../core/imposition";
import { millimetersToPoints } from "../../core/units";
import { PageFrame } from "../../primitives";
import type {
  FixedDocumentRenderPlan,
  PdfDocumentElement,
} from "../../render/runtime";
import { getPdfTheme } from "../../themes/themes";
import {
  LabelBody,
  SheetPage,
  type LabelAssetSources,
  type LabelComposition,
} from "./layout";
import { parseLabelData, type LabelContent, type LabelData } from "./schema";

const fixedDate = new Date("2026-01-15T12:00:00.000Z");
const positionMmToPoints = (value: number) => (value * 72) / 25.4;

export interface LabelPlanOptions {
  assetSources?: LabelAssetSources;
}

function resolveLogoSource(
  label: LabelContent,
  sources: LabelAssetSources | undefined,
) {
  if (!label.logoAssetId) return undefined;
  const source = sources?.[label.logoAssetId];
  if (!source) {
    throw new DocumentValidationError([
      {
        code: "ASSET_REJECTED",
        message: "The selected label logo asset is unavailable.",
        path: ["data", "labels", label.id, "logoAssetId"],
      },
    ]);
  }
  return source;
}

function IndividualLabelDocument({
  composition,
  data,
  format,
  locale,
  overrides,
  printProfile,
  themeId,
  assetSources,
}: LabelDocumentProps) {
  const theme = getPdfTheme(themeId, overrides.accentColor);
  return (
    <Document
      title={`${data.labels[0]?.title ?? "Label"} - ${composition} label`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-US"}
    >
      {data.labels.map((label) => (
        <PageFrame
          key={label.id}
          format={format}
          printProfile={printProfile}
          theme={theme}
        >
          <LabelBody
            composition={composition}
            compact={format.trim.widthMm < 90}
            data={label}
            logoSource={resolveLogoSource(label, assetSources)}
            theme={theme}
          />
        </PageFrame>
      ))}
    </Document>
  );
}

function SheetLabelDocument({
  assetSources,
  composition,
  data,
  format,
  locale,
  overrides,
  sheetFormat,
  themeId,
}: LabelDocumentProps & { sheetFormat: ResolvedFixedFormat }) {
  if (data.export.mode !== "sheet")
    throw new Error("Sheet export data is required.");
  const theme = getPdfTheme(themeId, overrides.accentColor);
  const imposed = imposeLabelSheet({
    pageWidthMm: sheetFormat.trim.widthMm,
    pageHeightMm: sheetFormat.trim.heightMm,
    labelWidthMm: format.trim.widthMm,
    labelHeightMm: format.trim.heightMm,
    marginsMm: data.export.marginsMm,
    columnGapMm: data.export.columnGapMm,
    rowGapMm: data.export.rowGapMm,
    startingCell: data.export.startingCell,
    quantity: data.export.quantity,
  });
  return (
    <Document
      title={`${data.labels[0]?.title ?? "Labels"} - sheet`}
      creator="docn-ui"
      creationDate={fixedDate}
      modificationDate={fixedDate}
      language={locale === "fr" ? "fr-FR" : "en-US"}
    >
      {Array.from({ length: imposed.pageCount }, (_, pageIndex) => (
        <SheetPage
          key={pageIndex}
          widthMm={sheetFormat.trim.widthMm}
          heightMm={sheetFormat.trim.heightMm}
          theme={theme}
        >
          {imposed.placements
            .filter((placement) => placement.pageIndex === pageIndex)
            .map((placement) => {
              const sourceIndex =
                data.labels.length === 1 ? 0 : placement.itemIndex;
              const label = data.labels[sourceIndex];
              if (!label)
                throw new Error("A sheet placement has no ordered label data.");
              return (
                <View
                  key={`${placement.pageIndex}-${placement.cellIndex}`}
                  wrap={false}
                  style={{
                    backgroundColor: theme.colors.canvas,
                    height: millimetersToPoints(placement.heightMm),
                    left: positionMmToPoints(placement.xMm),
                    padding: millimetersToPoints(format.safeAreaMm),
                    position: "absolute",
                    top: positionMmToPoints(placement.yMm),
                    width: millimetersToPoints(placement.widthMm),
                  }}
                >
                  <LabelBody
                    composition={composition}
                    compact={format.trim.widthMm < 90}
                    data={label}
                    logoSource={resolveLogoSource(label, assetSources)}
                    theme={theme}
                  />
                </View>
              );
            })}
        </SheetPage>
      ))}
    </Document>
  );
}

interface LabelDocumentProps {
  assetSources?: LabelAssetSources;
  composition: LabelComposition;
  data: LabelData;
  format: ResolvedFixedFormat;
  locale: RenderRequest["locale"];
  overrides: NonNullable<RenderRequest["overrides"]>;
  printProfile: RenderRequest["printProfile"];
  themeId: RenderRequest["themeId"];
}

export function createLabelPlan(
  input: unknown,
  metadata: TemplateMetadata,
  composition: LabelComposition,
  options: LabelPlanOptions = {},
): { plan: FixedDocumentRenderPlan; request: RenderRequest<LabelData> } {
  const validated = validateRenderRequest(input, metadata);
  if (
    validated.request.templateId !== metadata.id ||
    validated.request.templateVersion !== metadata.version
  ) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: "The render request does not match the selected template.",
        path: ["templateId"],
      },
    ]);
  }
  if (validated.format.kind !== "fixed") {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message: "Labels require a fixed label format.",
        path: ["formatId"],
      },
    ]);
  }
  const data = parseLabelData(validated.request.data);
  const request = { ...validated.request, data };
  const props: LabelDocumentProps = {
    ...(options.assetSources ? { assetSources: options.assetSources } : {}),
    composition,
    data,
    format: validated.format,
    locale: request.locale,
    overrides: request.overrides ?? {},
    printProfile: request.printProfile,
    themeId: request.themeId,
  };
  let document: PdfDocumentElement;
  let outputFormat = validated.format;
  if (data.export.mode === "sheet") {
    if (request.printProfile.kind !== "screen") {
      throw new DocumentValidationError([
        {
          code: "UNSUPPORTED_FORMAT",
          message:
            "Label sheets use their configured page margins and do not add bleed or crop marks.",
          path: ["printProfile"],
        },
      ]);
    }
    const sheetFormat = resolveFormat(data.export.pageFormatId);
    if (sheetFormat.kind !== "fixed")
      throw new Error("Sheet pages must resolve to fixed formats.");
    outputFormat = sheetFormat;
    document = <SheetLabelDocument {...props} sheetFormat={sheetFormat} />;
  } else {
    document = <IndividualLabelDocument {...props} />;
  }
  return {
    request,
    plan: {
      document,
      format: outputFormat,
      printProfile: request.printProfile,
    },
  };
}
