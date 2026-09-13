import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fingerprintNormalizedTemplateInput } from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import {
  createBrowserRenderCoordinator,
  type BrowserRenderCoordinator,
} from "./browser-render-coordinator";
import type { RenderWorkerRequestV2 } from "./worker-protocol-v2";

class FixtureWorker extends EventTarget {
  static instances: FixtureWorker[] = [];
  readonly messages: unknown[] = [];
  terminated = false;

  constructor(_url: URL, _options: WorkerOptions) {
    super();
    void _url;
    void _options;
    FixtureWorker.instances.push(this);
  }

  postMessage(message: unknown): void {
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

  async succeed(): Promise<void> {
    const message = this.request();
    const fingerprint = await fingerprintNormalizedTemplateInput(
      message.request,
    );
    this.dispatchEvent(
      new MessageEvent("message", {
        data: {
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
        },
      }),
    );
  }
}

let navigationTarget: EventTarget;
let coordinators: BrowserRenderCoordinator[];

beforeEach(() => {
  FixtureWorker.instances = [];
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

  it("terminates on timeout and recreates after navigation", async () => {
    const timed = coordinator({ timeoutMs: 1 });
    const timedRender = timed.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 10,
    });
    const timedExpectation = expect(timedRender).rejects.toMatchObject({
      code: "RENDER_TIMEOUT",
    });
    await timedExpectation;
    expect(FixtureWorker.instances).toHaveLength(0);

    const value = coordinator({ timeoutMs: 5_000 });
    const interrupted = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 20,
    });
    const interruptedWorker = await latestWorker(0);
    navigationTarget.dispatchEvent(new Event("pagehide"));
    await expect(interrupted).rejects.toMatchObject({ code: "RENDER_FAILED" });
    expect(interruptedWorker.terminated).toBe(true);

    const retried = value.render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 21,
    });
    const replacement = await latestWorker(1);
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
  });
});
