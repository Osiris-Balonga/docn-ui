import { afterEach, describe, expect, it, vi } from "vitest";

const pdfJs = vi.hoisted(() => ({
  createWorker: vi.fn(),
  getDocument: vi.fn(),
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  getDocument: pdfJs.getDocument,
  PDFWorker: { create: pdfJs.createWorker },
}));

import { measureContinuousContentInBrowser } from "./continuous.browser";

class FailureWorker extends EventTarget {
  static instances: FailureWorker[] = [];
  readonly removed: string[] = [];
  readonly terminate = vi.fn();

  constructor() {
    super();
    FailureWorker.instances.push(this);
  }

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ) {
    this.removed.push(type);
    super.removeEventListener(type, callback, options);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  FailureWorker.instances = [];
});

describe("browser continuous measurement worker", () => {
  it.each(["error", "messageerror"])(
    "rejects worker %s and releases every worker resource",
    async (eventType) => {
      const destroyLoadingTask = vi.fn(
        () => new Promise<void>(() => undefined),
      );
      const destroyPdfWorker = vi.fn();
      pdfJs.createWorker.mockReturnValue({ destroy: destroyPdfWorker });
      pdfJs.getDocument.mockReturnValue({
        destroy: destroyLoadingTask,
        promise: new Promise(() => undefined),
      });
      vi.stubGlobal("Worker", FailureWorker);

      const measurement = measureContinuousContentInBrowser(
        new Uint8Array([1]),
        "FINAL_MARKER",
      );
      const worker = FailureWorker.instances[0];
      expect(worker).toBeDefined();
      worker!.dispatchEvent(new Event(eventType));

      await expect(measurement).rejects.toThrow(
        "The PDF measurement worker failed.",
      );
      expect(destroyLoadingTask).toHaveBeenCalledOnce();
      expect(destroyPdfWorker).toHaveBeenCalledOnce();
      expect(worker!.terminate).toHaveBeenCalledOnce();
      expect(worker!.removed.sort()).toEqual(["error", "messageerror"]);
    },
  );

  it("releases worker resources when loading rejects and disposal stays pending", async () => {
    const destroyLoadingTask = vi.fn(() => new Promise<void>(() => undefined));
    const destroyPdfWorker = vi.fn();
    pdfJs.createWorker.mockReturnValue({ destroy: destroyPdfWorker });
    pdfJs.getDocument.mockReturnValue({
      destroy: destroyLoadingTask,
      promise: Promise.reject(new Error("Invalid test PDF.")),
    });
    vi.stubGlobal("Worker", FailureWorker);

    const measurement = measureContinuousContentInBrowser(
      new Uint8Array([1]),
      "FINAL_MARKER",
    );
    const worker = FailureWorker.instances[0];
    await expect(measurement).rejects.toThrow("Invalid test PDF.");
    expect(destroyLoadingTask).toHaveBeenCalledOnce();
    expect(destroyPdfWorker).toHaveBeenCalledOnce();
    expect(worker?.terminate).toHaveBeenCalledOnce();
    expect(worker?.removed.sort()).toEqual(["error", "messageerror"]);
  });
});
