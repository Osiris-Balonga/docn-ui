import { DOCUMENT_LIMITS } from "@docn-ui/documents/core";
import {
  getRequestRevision,
  getResponseRevision,
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderFailure,
  type PdfRenderRequest,
  type PdfRenderResponse,
} from "./protocol";

export interface PdfWorkerPort {
  onerror: ((event: ErrorEvent) => void) | null;
  onmessage: ((event: MessageEvent<PdfRenderResponse>) => void) | null;
  postMessage(request: PdfRenderRequest, transfer?: Transferable[]): void;
  terminate(): void;
}

export type CreatePdfWorker = () => PdfWorkerPort;

export class LatestRenderQueue {
  readonly #createWorker: CreatePdfWorker;
  readonly #onResponse: (response: PdfRenderResponse) => void;
  readonly #timeoutMilliseconds: number;
  #active: PdfRenderRequest | undefined;
  #disposed = false;
  #pending: PdfRenderRequest | undefined;
  #timeout: ReturnType<typeof setTimeout> | undefined;
  #worker: PdfWorkerPort;

  constructor(
    createWorker: CreatePdfWorker,
    onResponse: (response: PdfRenderResponse) => void,
    timeoutMilliseconds: number = DOCUMENT_LIMITS.generationMilliseconds,
  ) {
    this.#createWorker = createWorker;
    this.#onResponse = onResponse;
    this.#timeoutMilliseconds = timeoutMilliseconds;
    this.#worker = this.#connectWorker();
  }

  enqueue(request: PdfRenderRequest) {
    if (this.#disposed)
      throw new Error("The PDF render queue has been destroyed.");
    if (this.#active) {
      this.#pending = request;
      return;
    }
    this.#dispatch(request);
  }

  destroy() {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#clearTimeout();
    this.#active = undefined;
    this.#pending = undefined;
    this.#disconnectWorker();
  }

  #clearTimeout() {
    if (this.#timeout !== undefined) clearTimeout(this.#timeout);
    this.#timeout = undefined;
  }

  #complete(response: PdfRenderResponse) {
    if (
      this.#disposed ||
      !this.#active ||
      getResponseRevision(response) !== getRequestRevision(this.#active)
    )
      return;
    this.#clearTimeout();
    this.#active = undefined;
    const next = this.#pending;
    this.#pending = undefined;
    if (!next) this.#onResponse(response);
    if (next) this.#dispatch(next);
  }

  #connectWorker() {
    const worker = this.#createWorker();
    worker.onmessage = (event) => this.#complete(event.data);
    worker.onerror = () => this.#restartAfterFailure("WORKER_FAILURE");
    return worker;
  }

  #disconnectWorker() {
    this.#worker.onmessage = null;
    this.#worker.onerror = null;
    this.#worker.terminate();
  }

  #dispatch(request: PdfRenderRequest) {
    this.#active = request;
    this.#worker.postMessage(
      request,
      request.assets.map((asset) => asset.bytes),
    );
    this.#timeout = setTimeout(
      () => this.#restartAfterFailure("RENDER_TIMEOUT"),
      this.#timeoutMilliseconds,
    );
  }

  #restartAfterFailure(code: "RENDER_TIMEOUT" | "WORKER_FAILURE") {
    if (this.#disposed || !this.#active) return;
    const revision = getRequestRevision(this.#active);
    const next = this.#pending;
    this.#clearTimeout();
    this.#active = undefined;
    this.#pending = undefined;
    this.#disconnectWorker();
    this.#worker = this.#connectWorker();
    if (next) {
      this.#dispatch(next);
      return;
    }
    this.#onResponse({
      kind: "failure",
      protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
      revision,
      code,
      message:
        code === "RENDER_TIMEOUT"
          ? "PDF generation timed out. Try again."
          : "The PDF worker stopped unexpectedly. Try again.",
    } satisfies PdfRenderFailure);
  }
}
