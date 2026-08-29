import {
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderFailure,
  type PdfRenderRequest,
  type PdfRenderResponse,
} from "./pdf-render.protocol";

export interface PdfWorkerPort {
  onerror: ((event: ErrorEvent) => void) | null;
  onmessage: ((event: MessageEvent<PdfRenderResponse>) => void) | null;
  postMessage(request: PdfRenderRequest): void;
  terminate(): void;
}

export class LatestRenderQueue {
  readonly #onResponse: (response: PdfRenderResponse) => void;
  readonly #worker: PdfWorkerPort;
  #active: PdfRenderRequest | undefined;
  #disposed = false;
  #pending: PdfRenderRequest | undefined;

  constructor(
    worker: PdfWorkerPort,
    onResponse: (response: PdfRenderResponse) => void,
  ) {
    this.#worker = worker;
    this.#onResponse = onResponse;
    worker.onmessage = (event) => this.#complete(event.data);
    worker.onerror = () => {
      if (!this.#active) return;
      this.#complete({
        kind: "failure",
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
        revision: this.#active.revision,
        code: "WORKER_FAILURE",
        message: "The PDF worker stopped unexpectedly. Try again.",
      } satisfies PdfRenderFailure);
    };
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
    this.#active = undefined;
    this.#pending = undefined;
    this.#worker.onmessage = null;
    this.#worker.onerror = null;
    this.#worker.terminate();
  }

  #complete(response: PdfRenderResponse) {
    if (this.#disposed || response.revision !== this.#active?.revision) return;
    this.#active = undefined;
    this.#onResponse(response);
    const next = this.#pending;
    this.#pending = undefined;
    if (next) this.#dispatch(next);
  }

  #dispatch(request: PdfRenderRequest) {
    this.#active = request;
    this.#worker.postMessage(request);
  }
}
