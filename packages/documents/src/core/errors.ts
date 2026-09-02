export type DocumentErrorCode =
  | "INVALID_DATA"
  | "UNSUPPORTED_FORMAT"
  | "UNSUPPORTED_GLYPH"
  | "ASSET_REJECTED"
  | "LAYOUT_OVERFLOW"
  | "QR_TOO_DENSE"
  | "LIMIT_EXCEEDED"
  | "RENDER_TIMEOUT"
  | "RENDER_FAILED";

export interface DocumentIssue {
  code: DocumentErrorCode;
  message: string;
  path: readonly (number | string)[];
}

export function normalizeDocumentPath(
  path: readonly PropertyKey[],
): (number | string)[] {
  return path.map((segment) =>
    typeof segment === "symbol" ? (segment.description ?? "symbol") : segment,
  );
}

export class DocumentValidationError extends Error {
  readonly code: DocumentErrorCode;
  readonly issues: readonly DocumentIssue[];

  constructor(issues: readonly [DocumentIssue, ...DocumentIssue[]]) {
    super(issues[0].message);
    this.name = "DocumentValidationError";
    this.code = issues[0].code;
    this.issues = issues;
  }
}
