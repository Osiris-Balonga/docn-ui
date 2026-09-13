import { DocumentValidationError } from "../core/errors";

const CONTINUOUS_FINAL_MARKER_PATTERN = /^[A-Z][A-Z0-9_]{0,31}$/u;

export function assertQualifiedContinuousFinalMarker(
  finalMarker: unknown,
): asserts finalMarker is string {
  if (
    typeof finalMarker === "string" &&
    CONTINUOUS_FINAL_MARKER_PATTERN.test(finalMarker)
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
