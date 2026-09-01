import { DocumentValidationError } from "../core/errors";
import type { ResolvedFixedFormat } from "../core/formats";
import { createSafeFrame, type LayoutBounds } from "./measurement";

export interface FlowRegionSpace {
  /** Reserved region height in PDF points. */
  height: number;
  /** Gap between the reserved region and flowing body. */
  gap?: number;
}

export interface FlowFrameOptions {
  margin?: number;
  header?: FlowRegionSpace;
  footer?: FlowRegionSpace;
}

export interface FlowFrame {
  pageWidth: number;
  pageHeight: number;
  body: LayoutBounds;
  header: LayoutBounds;
  footer: LayoutBounds;
}

function invalidDimension(
  value: number,
  path: readonly string[],
  positive = false,
) {
  if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message: `Expected a finite ${positive ? "positive" : "non-negative"} dimension in points.`,
        path: ["layout", ...path],
      },
    ]);
  }
}

function regionSpace(region: FlowRegionSpace | undefined, name: string) {
  if (!region) return { height: 0, gap: 0 };
  invalidDimension(region.height, [name, "height"], true);
  const gap = region.gap ?? 0;
  invalidDimension(gap, [name, "gap"]);
  return { height: region.height, gap };
}

export function createFlowFrame(
  format: ResolvedFixedFormat,
  options: FlowFrameOptions = {},
): FlowFrame {
  if (
    format.kind !== "fixed" ||
    !["a4", "letter"].includes(format.id) ||
    format.orientation !== "portrait"
  ) {
    throw new DocumentValidationError([
      {
        code: "UNSUPPORTED_FORMAT",
        message:
          "DocumentFrame requires a resolved portrait A4 or Letter format.",
        path: ["formatId"],
      },
    ]);
  }
  const safe = createSafeFrame(format);
  const margin = options.margin ?? safe.x;
  invalidDimension(margin, ["margin"]);
  if (margin < safe.x) {
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message: "Flow page margins must preserve the format safe area.",
        path: ["layout", "margin"],
      },
    ]);
  }
  const header = regionSpace(options.header, "header");
  const footer = regionSpace(options.footer, "footer");
  const width = safe.pageWidth - 2 * margin;
  const y = margin + header.height + header.gap;
  const height = safe.pageHeight - y - margin - footer.height - footer.gap;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message:
          "Flow page margins and repeated regions leave no usable body area.",
        path: ["layout"],
      },
    ]);
  }
  return {
    pageWidth: safe.pageWidth,
    pageHeight: safe.pageHeight,
    body: { x: margin, y, width, height },
    header: { x: margin, y: margin, width, height: header.height },
    footer: {
      x: margin,
      y: safe.pageHeight - margin - footer.height,
      width,
      height: footer.height,
    },
  };
}

export function assertFlowBlockFits(
  measuredHeight: number,
  frame: FlowFrame,
  path: readonly (number | string)[] = ["layout", "block"],
): void {
  if (
    !Number.isFinite(measuredHeight) ||
    measuredHeight <= 0 ||
    measuredHeight > frame.body.height
  ) {
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message:
          "A non-breaking block must have a finite positive measured height that fits the flow body. Split or shorten the content.",
        path,
      },
    ]);
  }
}
