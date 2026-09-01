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
  /** Text size from 12 to 96 PDF points. */
  fontSize?: number;
  /** Clockwise rotation from -60 to 60 degrees. */
  rotation?: number;
  /** Repeat on flowing pages or limit the mark to the first page. */
  repeat?: boolean;
}

export function getWatermarkLayout(
  {
    text,
    placement = "center",
    opacity = 0.08,
    fontSize = 32,
    rotation = 0,
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
  if (!Number.isFinite(fontSize) || fontSize < 12 || fontSize > 96)
    invalidPrintData("Watermark font size must be 12–96 points.", "fontSize");
  if (!Number.isFinite(rotation) || rotation < -60 || rotation > 60)
    invalidPrintData("Watermark rotation must be -60–60 degrees.", "rotation");
  // Deliberately conservative for qualified Latin fonts, not a text shaper.
  const height = fontSize * 2;
  const availableSpan =
    rotation === 0 ? body.width : Math.hypot(body.width, body.height);
  if (text.length * fontSize * 0.55 > availableSpan || height > body.height)
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
