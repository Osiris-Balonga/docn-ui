import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fingerprintNormalizedTemplateInput } from "../template-contract";
import * as normalizationInternal from "../template-normalization.internal";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import {
  createBrowserRenderCoordinator,
  type BrowserRenderCoordinator,
} from "./browser-render-coordinator";
import type { RenderWorkerRequestV2 } from "./worker-protocol-v2";

class FixtureWorker extends EventTarget {
  static instances: FixtureWorker[] = [];
  static throwOnPost = false;
  readonly messages: unknown[] = [];
  terminated = false;

  constructor(_url: URL, _options: WorkerOptions) {
    super();
    void _url;
    void _options;
    FixtureWorker.instances.push(this);
  }

  postMessage(message: unknown): void {
    if (FixtureWorker.throwOnPost) throw new Error("fixture post failure");
    this.messages.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  request(): RenderWorkerRequestV2 {
    const request = this.messages.find(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        "type" in item &&
        item.type === "render",
    );
    if (!request) throw new Error("The fixture worker has no render request.");
    return request as RenderWorkerRequestV2;
  }

  async resultMessage() {
    const message = this.request();
    const fingerprint = await fingerprintNormalizedTemplateInput(
      message.request,
    );
    return {
      jobId: message.jobId,
      pdfBytes: new Uint8Array([37, 80, 68, 70]).buffer,
      protocolVersion: 2,
      result: {
        diagnostics: [],
        finalDimensions: [
          { heightMm: 55, heightPt: 156, widthMm: 85, widthPt: 241 },
          { heightMm: 55, heightPt: 156, widthMm: 85, widthPt: 241 },
        ],
        fingerprint,
        pageCount: 2,
        revision: message.request.revision,
      },
      revision: message.request.revision,
      type: "result",
    } as const;
  }

  async succeed(): Promise<void> {
    this.dispatchEvent(
      new MessageEvent("message", {
        data: await this.resultMessage(),
      }),
    );
  }
}

let navigationTarget: EventTarget;
let coordinators: BrowserRenderCoordinator[];

beforeEach(() => {
  FixtureWorker.instances = [];
  FixtureWorker.throwOnPost = false;
  coordinators = [];
  navigationTarget = new EventTarget();
  vi.stubGlobal("Worker", FixtureWorker);
  vi.stubGlobal("location", { origin: "https://documents.example" });
  vi.stubGlobal(
    "addEventListener",
    navigationTarget.addEventListener.bind(navigationTarget),
  );
  vi.stubGlobal(
    "removeEventListener",
    navigationTarget.removeEventListener.bind(navigationTarget),
  );
});

afterEach(() => {
  coordinators.forEach((coordinator) => coordinator.dispose());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function coordinator(options?: { timeoutMs: number }) {
  const value = createBrowserRenderCoordinator(options);
  coordinators.push(value);
  return value;
}

async function latestWorker(index: number): Promise<FixtureWorker> {
  await vi.waitFor(() =>
    expect(FixtureWorker.instances.length).toBeGreaterThan(index),
  );
  return FixtureWorker.instances[index]!;
}

describe("browser render coordinator", () => {
  it("rejects runtime options that belong only to direct renderPdf", () => {
    expect(() =>
      createBrowserRenderCoordinator({
        fontAssetBaseUrl: "https://documents.example/fonts/",
      } as never),
    ).toThrowError(
      expect.objectContaining({
        issues: [
          expect.objectContaining({
            path: ["coordinatorOptions", "fontAssetBaseUrl"],
          }),
        ],
      }),
    );
  });

  it("keeps one active plus the latest request and exposes stale state outside RenderResult", async () => {
    const value = coordinator({ timeoutMs: 5_000 });
    const first = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 1,
    });
    const firstWorker = await latestWorker(0);
    await firstWorker.succeed();
    await expect(first).resolves.toMatchObject({ revision: 1 });

    const superseded = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 2,
    });
    expect(value.getSnapshot()).toMatchObject({
      currentRevision: 2,
      lastValid: { revision: 1 },
      stale: true,
    });
    const latest = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 3,
    });
    await expect(superseded).rejects.toMatchObject({ code: "RENDER_FAILED" });
    const latestInstance = await latestWorker(1);
    expect(firstWorker.terminated).toBe(true);
    await latestInstance.succeed();
    await expect(latest).resolves.toMatchObject({ revision: 3 });
    expect(value.getSnapshot()).toMatchObject({ stale: false });
  });

  it("does not overlap non-interruptible preflight during a revision burst", async () => {
    const actualNormalize =
      normalizationInternal.normalizeTemplateInputForRender;
    let rejectPhysicalPreflight: ((error: unknown) => void) | undefined;
    const normalize = vi
      .spyOn(normalizationInternal, "normalizeTemplateInputForRender")
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectPhysicalPreflight = reject;
          }),
      )
      .mockImplementation(actualNormalize);
    const value = coordinator({ timeoutMs: 5_000 });
    const first = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 4,
    });
    const firstExpectation = expect(first).rejects.toMatchObject({
      code: "RENDER_FAILED",
    });
    await vi.waitFor(() => expect(normalize).toHaveBeenCalledTimes(1));

    const intermediate = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 5,
    });
    const intermediateExpectation = expect(intermediate).rejects.toMatchObject({
      code: "RENDER_FAILED",
    });
    const latest = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 6,
    });
    expect(normalize).toHaveBeenCalledTimes(1);
    expect(FixtureWorker.instances).toHaveLength(0);
    await firstExpectation;
    await intermediateExpectation;

    rejectPhysicalPreflight?.(new Error("late preflight failure"));
    const worker = await latestWorker(0);
    expect(normalize).toHaveBeenCalledTimes(2);
    expect(worker.request().request.revision).toBe(6);
    await worker.succeed();
    await expect(latest).resolves.toMatchObject({ revision: 6 });
  });

  it("terminates an active worker on supersession and ignores its late result", async () => {
    const value = coordinator({ timeoutMs: 5_000 });
    const first = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 7,
    });
    const firstExpectation = expect(first).rejects.toMatchObject({
      code: "RENDER_FAILED",
    });
    const firstWorker = await latestWorker(0);
    const latest = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 8,
    });
    await firstExpectation;
    expect(firstWorker.terminated).toBe(true);
    await firstWorker.succeed();
    expect(value.getSnapshot().lastValid).toBeNull();
    const replacement = await latestWorker(1);
    await replacement.succeed();
    await expect(latest).resolves.toMatchObject({ revision: 8 });
  });

  it.each(["error", "messageerror"])(
    "terminates after a worker %s event",
    async (eventType) => {
      const value = coordinator({ timeoutMs: 5_000 });
      const render = value.render(violetFounderBusinessCardRenderable, {
        data: {},
        revision: 9,
      });
      const expectation = expect(render).rejects.toMatchObject({
        code: "RENDER_FAILED",
      });
      const worker = await latestWorker(0);
      worker.dispatchEvent(new Event(eventType));
      await expectation;
      expect(worker.terminated).toBe(true);
    },
  );

  it("terminates when a transferable post throws synchronously", async () => {
    FixtureWorker.throwOnPost = true;
    const value = coordinator({ timeoutMs: 5_000 });
    await expect(
      value.render(violetFounderBusinessCardRenderable, {
        data: {},
        revision: 10,
      }),
    ).rejects.toBeInstanceOf(Error);
    expect(FixtureWorker.instances).toHaveLength(1);
    expect(FixtureWorker.instances[0]?.terminated).toBe(true);
  });

  it("terminates on timeout and recreates after navigation", async () => {
    const timed = coordinator({ timeoutMs: 100 });
    const timedRender = timed.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 11,
    });
    const timedExpectation = expect(timedRender).rejects.toMatchObject({
      code: "RENDER_TIMEOUT",
    });
    const timedWorker = await latestWorker(0);
    await timedExpectation;
    expect(timedWorker.terminated).toBe(true);
    const timeoutWorkerCount = 1;

    const value = coordinator({ timeoutMs: 5_000 });
    const interrupted = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 20,
    });
    const interruptedWorker = await latestWorker(timeoutWorkerCount);
    navigationTarget.dispatchEvent(new Event("pagehide"));
    navigationTarget.dispatchEvent(new Event("pagehide"));
    await expect(interrupted).rejects.toMatchObject({ code: "RENDER_FAILED" });
    expect(interruptedWorker.terminated).toBe(true);

    const retried = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 21,
    });
    const replacement = await latestWorker(timeoutWorkerCount + 1);
    await replacement.succeed();
    await expect(retried).resolves.toMatchObject({ revision: 21 });
  });

  it("rejects malformed worker responses without publishing them", async () => {
    const value = coordinator({ timeoutMs: 5_000 });
    const render = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 30,
    });
    const expectation = expect(render).rejects.toMatchObject({
      code: "RENDER_FAILED",
    });
    const worker = await latestWorker(0);
    const request = worker.request();
    worker.dispatchEvent(
      new MessageEvent("message", {
        data: {
          extra: true,
          jobId: request.jobId,
          protocolVersion: 2,
          revision: 30,
          type: "result",
        },
      }),
    );
    await expectation;
    expect(worker.terminated).toBe(true);
    expect(value.getSnapshot().lastValid).toBeNull();

    for (const [index, path] of [[{}], ["x".repeat(121)]].entries()) {
      const revision = 31 + index;
      const nextRender = value.render(violetFounderBusinessCardRenderable, {
        data: {},
        revision,
      });
      const nextExpectation = expect(nextRender).rejects.toMatchObject({
        code: "RENDER_FAILED",
      });
      const nextWorker = await latestWorker(index + 1);
      const response = await nextWorker.resultMessage();
      nextWorker.dispatchEvent(
        new MessageEvent("message", {
          data: {
            ...response,
            result: {
              ...response.result,
              diagnostics: [
                { code: "INVALID_DATA", message: "redacted", path },
              ],
            },
          },
        }),
      );
      await nextExpectation;
      expect(value.getSnapshot().lastValid).toBeNull();
    }
  });

  it("never mistakes a resolver/preflight rejection object for success", async () => {
    const rejection = { pdfBytes: new Uint8Array([1, 2, 3]) };
    vi.spyOn(
      normalizationInternal,
      "normalizeTemplateInputForRender",
    ).mockRejectedValueOnce(rejection);
    const value = coordinator({ timeoutMs: 5_000 });
    await expect(
      value.render(violetFounderBusinessCardRenderable, {
        data: {},
        revision: 40,
      }),
    ).rejects.toBe(rejection);
    expect(value.getSnapshot().lastValid).toBeNull();
  });
});
