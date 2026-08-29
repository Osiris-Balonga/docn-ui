import { describe, expect, it, vi } from "vitest";
import {
  getRequestRevision,
  getResponseRevision,
  makePdfRenderRequest,
  PDF_RENDER_PROTOCOL_VERSION,
  type PdfRenderRequest,
  type PdfRenderResponse,
} from "./protocol";
import { LatestRenderQueue, type PdfWorkerPort } from "./latest-render-queue";

class FakeWorker implements PdfWorkerPort {
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessage: ((event: MessageEvent<PdfRenderResponse>) => void) | null = null;
  posted: PdfRenderRequest[] = [];
  terminated = false;

  postMessage(request: PdfRenderRequest) {
    this.posted.push(request);
  }

  respond(response: PdfRenderResponse) {
    this.onmessage?.({ data: response } as MessageEvent<PdfRenderResponse>);
  }

  terminate() {
    this.terminated = true;
  }
}

function request(revision: number): PdfRenderRequest {
  return makePdfRenderRequest(revision, {
    name: `Name ${revision}`,
    email: `name-${revision}@example.com`,
  });
}

function success(revision: number): PdfRenderResponse {
  return {
    kind: "success",
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
    result: {
      revision,
      pageCount: 2,
      pdfBytes: new ArrayBuffer(8),
      finalDimensions: [],
      diagnostics: [],
      fingerprint: `test-${revision}`,
    },
  };
}

describe("LatestRenderQueue", () => {
  it("runs one request and replaces queued work with the latest revision", () => {
    const worker = new FakeWorker();
    const responses: PdfRenderResponse[] = [];
    const queue = new LatestRenderQueue(worker, (response) =>
      responses.push(response),
    );

    queue.enqueue(request(1));
    queue.enqueue(request(2));
    queue.enqueue(request(3));
    expect(worker.posted.map(getRequestRevision)).toEqual([1]);

    worker.respond(success(1));
    expect(worker.posted.map(getRequestRevision)).toEqual([1, 3]);
    worker.respond(success(2));
    expect(responses.map(getResponseRevision)).toEqual([1]);
    worker.respond(success(3));
    expect(responses.map(getResponseRevision)).toEqual([1, 3]);
  });

  it("reports a worker error for the active revision and continues", () => {
    const worker = new FakeWorker();
    const onResponse = vi.fn();
    const queue = new LatestRenderQueue(worker, onResponse);
    queue.enqueue(request(4));
    queue.enqueue(request(5));

    worker.onerror?.({} as ErrorEvent);

    expect(onResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "failure",
        revision: 4,
        code: "WORKER_FAILURE",
      }),
    );
    expect(worker.posted.map(getRequestRevision)).toEqual([4, 5]);
  });

  it("terminates once and rejects new work after destruction", () => {
    const worker = new FakeWorker();
    const queue = new LatestRenderQueue(worker, vi.fn());
    queue.enqueue(request(6));
    queue.destroy();
    queue.destroy();

    expect(worker.terminated).toBe(true);
    expect(worker.onmessage).toBeNull();
    expect(() => queue.enqueue(request(7))).toThrow("destroyed");
  });
});
