export const PDF_RENDER_PROTOCOL_VERSION = 1 as const;

export interface PdfRenderRequest {
  kind: "render";
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  revision: number;
  fixture: "card";
  name: string;
  printProfile: "screen" | "print";
}

export interface PdfRenderSuccess {
  kind: "success";
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  revision: number;
  pageCount: number;
  pdfBytes: ArrayBuffer;
}

export interface PdfRenderFailure {
  kind: "failure";
  protocolVersion: typeof PDF_RENDER_PROTOCOL_VERSION;
  revision: number;
  code: "INVALID_REQUEST" | "RENDER_FAILED" | "WORKER_FAILURE";
  message: string;
}

export type PdfRenderResponse = PdfRenderSuccess | PdfRenderFailure;

export function isPdfRenderRequest(value: unknown): value is PdfRenderRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<PdfRenderRequest>;
  return (
    request.kind === "render" &&
    request.protocolVersion === PDF_RENDER_PROTOCOL_VERSION &&
    Number.isSafeInteger(request.revision) &&
    Number(request.revision) > 0 &&
    request.fixture === "card" &&
    typeof request.name === "string" &&
    request.name.trim().length > 0 &&
    request.name.length <= 80 &&
    (request.printProfile === "screen" || request.printProfile === "print")
  );
}
