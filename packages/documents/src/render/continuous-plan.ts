import { DocumentValidationError } from "../core/errors";

const MAX_CONTINUOUS_FINAL_MARKER_LENGTH = 256;

export function assertQualifiedContinuousFinalMarker(
  finalMarker: unknown,
): asserts finalMarker is string {
  if (
    typeof finalMarker === "string" &&
    finalMarker === finalMarker.trim() &&
    finalMarker.trim().length > 0 &&
    finalMarker.length <= MAX_CONTINUOUS_FINAL_MARKER_LENGTH
  ) {
    return;
  }
  throw new DocumentValidationError([
    {
      code: "RENDER_FAILED",
      message: "The continuous template plan has an invalid final marker.",
      path: ["template", "createPlan", "plan", "finalMarker"],
    },
  ]);
}

export function continuousFinalizationFailure(): never {
  throw new DocumentValidationError([
    {
      code: "RENDER_FAILED",
      message: "The continuous PDF failed final layout qualification.",
      path: ["document"],
    },
  ]);
}
