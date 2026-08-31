import JsBarcode from "jsbarcode";
import { DocumentValidationError } from "../core/errors";
import { millimetersToPoints } from "../core/units";

export type BarcodeFormat = "code128" | "ean13";

export interface BarcodeProps {
  format: BarcodeFormat;
  value: string;
  /** Total width in points, including the protected quiet zones. */
  width?: number;
  /** Data-bar height in points, excluding guard extensions and readable text. */
  barHeight?: number;
  showValue?: boolean;
}

function invalid(path: string, message: string): never {
  throw new DocumentValidationError([
    { code: "INVALID_DATA", message, path: ["barcode", path] },
  ]);
}

function tooDense(message: string): never {
  throw new DocumentValidationError([
    { code: "LAYOUT_OVERFLOW", message, path: ["barcode", "width"] },
  ]);
}

export function ean13CheckDigit(value: string): string {
  if (
    typeof value !== "string" ||
    value.length !== 12 ||
    !/^\d{12}$/.test(value)
  )
    invalid(
      "value",
      "EAN-13 check digit calculation requires 12 ASCII digits.",
    );
  const sum = [...value].reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );
  return String((10 - (sum % 10)) % 10);
}

export function resolveBarcode(props: BarcodeProps) {
  const { format, value } = props;
  if (format !== "code128" && format !== "ean13")
    invalid("format", "Only code128 and ean13 barcodes are supported.");
  if (typeof value !== "string")
    invalid("value", "Barcode value must be a string.");
  if (
    format === "code128" &&
    (value.length < 1 || value.length > 80 || /[^\x20-\x7e]/.test(value))
  )
    invalid(
      "value",
      "Code 128 requires 1–80 printable ASCII characters, without FNC codes.",
    );
  if (
    format === "ean13" &&
    (value.length !== 13 ||
      !/^\d{13}$/.test(value) ||
      ean13CheckDigit(value.slice(0, 12)) !== value[12])
  )
    invalid(
      "value",
      "EAN-13 requires 13 ASCII digits with a valid supplied check digit.",
    );
  if (props.showValue !== undefined && typeof props.showValue !== "boolean")
    invalid("showValue", "showValue must be a boolean.");
  const width =
    props.width === undefined
      ? format === "code128"
        ? 240
        : 120
      : props.width;
  if (!Number.isFinite(width) || width <= 0 || width > 720)
    invalid(
      "width",
      "Barcode width must be a positive finite number no greater than 720 pt.",
    );

  const output: { encodings?: { data: string }[] } = {};
  JsBarcode(output, value, {
    format: format === "code128" ? "CODE128" : "EAN13",
    displayValue: false,
    flat: true,
  });
  const bits = output.encodings?.map((encoding) => encoding.data).join("");
  if (
    !bits ||
    !/^[01]+$/.test(bits) ||
    (format === "ean13" && bits.length !== 95)
  )
    throw new Error("The barcode encoder returned an unexpected pattern.");

  const quietLeft = format === "code128" ? 10 : 11;
  const quietRight = format === "code128" ? 10 : 7;
  const moduleWidth = width / (bits.length + quietLeft + quietRight);
  const minimumModule = millimetersToPoints(
    format === "code128" ? 0.25 : 0.264,
  );
  const maximumModule = millimetersToPoints(
    format === "code128" ? 1.016 : 0.66,
  );
  if (moduleWidth < minimumModule - 1e-9 || moduleWidth > maximumModule + 1e-9)
    tooDense(
      "The requested width produces modules outside the qualified physical size range. Change the width or payload.",
    );
  const minimumHeight =
    format === "code128"
      ? Math.max(millimetersToPoints(15), bits.length * moduleWidth * 0.15)
      : moduleWidth * (22.85 / 0.33);
  const barHeight =
    props.barHeight === undefined ? minimumHeight : props.barHeight;
  if (
    !Number.isFinite(barHeight) ||
    barHeight < minimumHeight - 1e-9 ||
    barHeight > 144
  )
    invalid(
      "barHeight",
      `Barcode bars must be at least ${minimumHeight.toFixed(2)} pt and at most 144 pt high.`,
    );
  const guardHeight = format === "ean13" ? 5 * moduleWidth : 0;
  const bars: { x: number; width: number; height: number }[] = [];
  for (let start = 0; start < bits.length;) {
    if (bits[start] !== "1") {
      start++;
      continue;
    }
    let end = start + 1;
    while (bits[end] === "1") end++;
    const guard =
      format === "ean13" &&
      (start < 3 || (start >= 45 && start < 50) || start >= 92);
    bars.push({
      x: (quietLeft + start) * moduleWidth,
      width: (end - start) * moduleWidth,
      height: barHeight + (guard ? guardHeight : 0),
    });
    start = end;
  }
  return {
    format,
    value,
    width,
    barHeight,
    guardHeight,
    moduleWidth,
    quietLeft,
    quietRight,
    bars,
    showValue: props.showValue ?? true,
  };
}

export function barcodeTextHeight(
  value: string,
  width: number,
  fontSize: number,
): number {
  if (!Number.isFinite(fontSize) || fontSize < 7 || fontSize > 12)
    invalid(
      "showValue",
      "Readable barcode text requires a caption size between 7 and 12 pt.",
    );
  const glyphWidth = /^\d+$/.test(value) ? 0.65 : 1.15;
  if (value.length * fontSize * glyphWidth > width - 8)
    tooDense(
      "Readable barcode text does not fit. Increase the width or place the value separately with showValue=false.",
    );
  return 4 + fontSize * 1.4;
}
