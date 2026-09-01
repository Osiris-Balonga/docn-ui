import { DocumentValidationError } from "../core/errors";
import type { LayoutBounds } from "./measurement";
import { assertPrintText, invalidPrintData } from "./printable-data";

export interface WatermarkProps {
  /** Short printable Latin watermark label. */
  text: string;
  /** Vertical placement within the flow body. */
  placement?: "top" | "center" | "bottom";
  /** Restrained opacity from 0.02 to 0.2. */
  opacity?: number;
  /** Text size from 12 to 48 PDF points. */
  fontSize?: number;
  /** Repeat on flowing pages or limit the mark to the first page. */
  repeat?: boolean;
}

export function getWatermarkLayout(
  {
    text,
    placement = "center",
    opacity = 0.08,
    fontSize = 32,
    repeat = true,
  }: WatermarkProps,
  body: LayoutBounds,
): LayoutBounds {
  assertPrintText(text, "text", 24);
  if (!/^[\u0020-\u007e\u00c0-\u00ff]+$/.test(text))
    invalidPrintData("Watermarks support printable Latin text only.", "text");
  if (
    !["top", "center", "bottom"].includes(placement) ||
    typeof repeat !== "boolean"
  )
    invalidPrintData(
      "Unknown watermark placement or repeat behavior.",
      "watermark",
    );
  if (!Number.isFinite(opacity) || opacity < 0.02 || opacity > 0.2)
    invalidPrintData("Watermark opacity must be 0.02–0.2.", "opacity");
  if (!Number.isFinite(fontSize) || fontSize < 12 || fontSize > 48)
    invalidPrintData("Watermark font size must be 12–48 points.", "fontSize");
  // Deliberately conservative for qualified Latin fonts, not a text shaper.
  const height = fontSize * 2;
  if (text.length * fontSize * 1.5 > body.width || height > body.height)
    throw new DocumentValidationError([
      {
        code: "LAYOUT_OVERFLOW",
        message:
          "The watermark envelope must fit the flow body. Shorten the label or choose a smaller explicit size.",
        path: ["watermark"],
      },
    ]);
  return {
    x: body.x,
    y:
      body.y +
      (placement === "top"
        ? 0
        : placement === "bottom"
          ? body.height - height
          : (body.height - height) / 2),
    width: body.width,
    height,
  };
}
