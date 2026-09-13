import { DocumentValidationError } from "../core/errors";

export function throwStructuredRenderFailure(error: unknown): never {
  if (error instanceof DocumentValidationError) throw error;
  throw new DocumentValidationError([
    {
      code: "RENDER_FAILED",
      message: "The PDF renderer could not complete the document.",
      path: ["document"],
    },
  ]);
}
