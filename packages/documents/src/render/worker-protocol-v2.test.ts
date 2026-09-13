import { afterEach, describe, expect, it, vi } from "vitest";
import { encode as encodeJpeg } from "jpeg-js";
import {
  createFontManifestIdentity,
  fingerprintNormalizedTemplateInput,
  normalizeTemplateInput,
  parseLocalImageId,
} from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import { getPdfTheme } from "../themes/themes";
import { preflightLocalImages } from "./local-images";
import {
  PDF_RENDER_PROTOCOL_VERSION_V2,
  createRenderWorkerEpochGateV2,
  createRenderWorkerInboxV2,
  createRenderWorkerImagesV2,
  matchesRenderWorkerDispatchV2,
  receiveRenderWorkerImagesV2,
  settleRenderWorkerEpochV2,
  type RenderWorkerRequestV2,
  type RenderWorkerOutboundV2,
  validateRenderWorkerRequestV2,
} from "./worker-protocol-v2";

async function request() {
  const normalized = normalizeTemplateInput(
    violetFounderBusinessCardRenderable,
    { data: {}, revision: 7 },
    {
      fontManifestIdentity: await createFontManifestIdentity(
        getPdfTheme("neutral"),
      ),
      localImageDescriptors: [],
    },
  );
  return {
    dispatchId: 11,
    jobId: 3,
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
    request: normalized,
    themeWasExplicit: false,
    type: "render" as const,
  };
}

describe("render worker protocol V2", () => {
  it("invalidates a concurrent replay with the same job and revision", () => {
    const gate = createRenderWorkerEpochGateV2();
    const first = gate.begin(3, 7);
    const replay = gate.begin(3, 7);
    expect(gate.isCurrent(first)).toBe(false);
    expect(gate.isCurrent(replay)).toBe(true);
  });

  it("drops a prior epoch when a replay arrives during fingerprinting", async () => {
    const gate = createRenderWorkerEpochGateV2();
    const first = gate.begin(3, 7);
    const published: string[] = [];
    let resolveFingerprint: ((value: string) => void) | undefined;
    const fingerprint = new Promise<string>((resolve) => {
      resolveFingerprint = resolve;
    });
    const publish = async () => {
      const settled = await settleRenderWorkerEpochV2(gate, first, fingerprint);
      if (settled.current) published.push(settled.value);
    };
    const completion = publish();

    const replay = gate.begin(3, 7);
    resolveFingerprint?.("sha256:old");

    await completion;
    expect(published).toEqual([]);
    expect(gate.isCurrent(replay)).toBe(true);
  });

  it("accepts only the exact bounded normalized JSON envelope", async () => {
    const value = await request();
    expect(validateRenderWorkerRequestV2(structuredClone(value))).toMatchObject(
      {
        jobId: 3,
        dispatchId: 11,
        request: { revision: 7 },
        themeWasExplicit: false,
      },
    );
    expect(() =>
      validateRenderWorkerRequestV2({ ...value, runtimeOptions: {} }),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));
    expect(() =>
      validateRenderWorkerRequestV2({
        ...value,
        request: { ...value.request, locale: "de" },
      }),
    ).toThrowError(expect.objectContaining({ code: "INVALID_DATA" }));
  });

  it("transfers a fresh image copy and verifies the descriptor bijection", async () => {
    const original = new Uint8Array(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAABlBMVEX/AAAAAP9sof2OAAAACklEQVR4nGNwAAAAQgBBKTf07wAAAABJRU5ErkJggg==",
        "base64",
      ),
    );
    const prepared = await preflightLocalImages(
      [parseLocalImageId("brand-mark")],
      async () => ({ bytes: original, declaredMimeType: "image/png" }),
    );
    const transfer = createRenderWorkerImagesV2(4, 8, 12, prepared);
    const received = structuredClone(transfer.message, {
      transfer: [...transfer.transfer],
    });
    expect(original.byteLength).toBeGreaterThan(0);
    expect(transfer.transfer[0]?.byteLength).toBe(0);
    const verified = await receiveRenderWorkerImagesV2(
      received,
      prepared.map(({ descriptor }) => descriptor),
      4,
      8,
      12,
    );
    expect(verified[0]?.descriptor).toEqual(prepared[0]?.descriptor);
    expect(verified[0]?.bytes).not.toBe(prepared[0]?.bytes);

    const tampered = structuredClone(received);
    new Uint8Array(tampered.images[0]!.bytes)[0] = 0;
    await expect(
      receiveRenderWorkerImagesV2(
        tampered,
        prepared.map(({ descriptor }) => descriptor),
        4,
        8,
        12,
      ),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });

    // Valid encoded bytes must not pass with a matching but forged channel digest.
    const forgedDigest = `sha256:${"0".repeat(64)}` as const;
    const forged = {
      ...received,
      images: received.images.map((image) => ({
        ...image,
        sha256: forgedDigest,
      })),
    };
    await expect(
      receiveRenderWorkerImagesV2(
        forged,
        prepared.map(({ descriptor }) => ({
          ...descriptor,
          sha256: forgedDigest,
        })),
        4,
        8,
        12,
      ),
    ).rejects.toMatchObject({
      code: "INVALID_DATA",
      issues: [expect.objectContaining({ path: ["worker", "images", "0"] })],
    });
  });

  it("reuses canonical JPEG traversal for fill markers and rejects forged encodings", async () => {
    const encoded = new Uint8Array(
      encodeJpeg(
        {
          data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]),
          height: 1,
          width: 2,
        },
        90,
      ).data,
    );
    const withFill = new Uint8Array(encoded.byteLength + 1);
    withFill.set(encoded.subarray(0, 2));
    withFill[2] = 0xff;
    withFill.set(encoded.subarray(2), 3);
    const prepared = await preflightLocalImages(
      [parseLocalImageId("photo")],
      async () => ({ bytes: withFill, declaredMimeType: "image/jpeg" }),
    );
    const transfer = createRenderWorkerImagesV2(5, 9, 13, prepared);
    const received = structuredClone(transfer.message, {
      transfer: [...transfer.transfer],
    });
    await expect(
      receiveRenderWorkerImagesV2(
        received,
        prepared.map(({ descriptor }) => descriptor),
        5,
        9,
        13,
      ),
    ).resolves.toMatchObject([
      { descriptor: { heightPx: 1, mimeType: "image/jpeg", widthPx: 2 } },
    ]);

    const fakePng = new Uint8Array(33);
    fakePng.set([137, 80, 78, 71, 13, 10, 26, 10]);
    const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0, 2, 0xff, 0xd9]);
    for (const [index, bytes] of [fakePng, fakeJpeg].entries()) {
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const sha256 = `sha256:${Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("")}` as const;
      await expect(
        receiveRenderWorkerImagesV2(
          {
            images: [
              {
                bytes: bytes.buffer,
                id: parseLocalImageId("forged"),
                sha256,
              },
            ],
            dispatchId: 14,
            jobId: 6,
            protocolVersion: 2,
            revision: 10,
            type: "images",
          },
          [
            {
              byteLength: bytes.byteLength,
              heightPx: 1,
              id: parseLocalImageId("forged"),
              mimeType: index === 0 ? "image/png" : "image/jpeg",
              sha256,
              widthPx: 1,
            },
          ],
          6,
          10,
          14,
        ),
      ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    }
  });

  it("keeps a replay pending when images belong to the prior dispatch", async () => {
    const first = await request();
    const replay = { ...first, dispatchId: first.dispatchId + 1 };
    const oldImages = createRenderWorkerImagesV2(
      first.jobId,
      first.request.revision,
      first.dispatchId,
      [],
    ).message;
    const replayImages = createRenderWorkerImagesV2(
      replay.jobId,
      replay.request.revision,
      replay.dispatchId,
      [],
    ).message;
    let pending: RenderWorkerRequestV2 | undefined = replay;

    if (matchesRenderWorkerDispatchV2(pending, oldImages)) pending = undefined;
    expect(pending).toBe(replay);
    if (pending && matchesRenderWorkerDispatchV2(pending, replayImages))
      pending = undefined;
    expect(pending).toBeUndefined();
  });

  it("invalidates only the pending identity and ignores unrelated replays", async () => {
    const first = await request();
    const inbox = createRenderWorkerInboxV2();
    const firstAccepted = inbox.accept(first);
    expect(firstAccepted).toMatchObject({
      kind: "accepted",
      value: { request: first },
    });

    const duplicate = {
      ...structuredClone(first),
      themeWasExplicit: !first.themeWasExplicit,
    };
    expect(inbox.accept(duplicate)).toMatchObject({
      kind: "invalidated",
      request: first,
    });
    const firstImages = createRenderWorkerImagesV2(
      first.jobId,
      first.request.revision,
      first.dispatchId,
      [],
    ).message;
    expect(inbox.claim(structuredClone(firstImages))).toBeUndefined();
    expect(inbox.claim(firstImages)).toBeUndefined();
    expect(inbox.accept(duplicate)).toEqual({ kind: "ignored" });

    const second = { ...first, dispatchId: first.dispatchId + 1 };
    const secondAccepted = inbox.accept(second);
    const older = { ...first, dispatchId: first.dispatchId - 1 };
    expect(inbox.accept(older)).toEqual({ kind: "ignored" });
    expect(inbox.accept(first)).toEqual({ kind: "ignored" });
    expect(inbox.accept({ ...second, jobId: second.jobId + 1 })).toEqual({
      kind: "ignored",
    });
    expect(
      inbox.accept({
        ...second,
        request: { ...second.request, revision: second.request.revision + 1 },
      }),
    ).toEqual({ kind: "ignored" });
    expect(inbox.claim(firstImages)).toBeUndefined();
    const secondImages = createRenderWorkerImagesV2(
      second.jobId,
      second.request.revision,
      second.dispatchId,
      [],
    ).message;
    expect(inbox.claim(secondImages)).toBe(
      secondAccepted.kind === "accepted" ? secondAccepted.value : undefined,
    );
  });
});

describe("worker V2 replay handler", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock("./browser-normalized-render");
    vi.doUnmock("./verified-assets.browser");
    vi.resetModules();
  });

  it.each(["identical", "conflicting"] as const)(
    "fails closed on an %s replay and renders the next dispatch",
    async (kind) => {
      const render = vi.fn(async (_template, normalized) => ({
        diagnostics: [],
        finalDimensions: [],
        fingerprint: await fingerprintNormalizedTemplateInput(normalized),
        pageCount: 1,
        pdfBytes: new TextEncoder().encode("%PDF-fixture").buffer,
        revision: normalized.revision,
      }));
      vi.doMock("./browser-normalized-render", () => ({
        renderNormalizedPdfInBrowser: render,
      }));
      vi.doMock("./verified-assets.browser", () => ({
        createVerifiedBrowserAssetResolver: async () => ({}),
      }));
      const published: RenderWorkerOutboundV2[] = [];
      vi.stubGlobal("postMessage", (value: RenderWorkerOutboundV2) => {
        published.push(value);
      });
      vi.stubGlobal("location", { origin: "https://documents.example" });
      vi.stubGlobal("onmessage", null);
      vi.resetModules();
      await import("./render.worker.browser");
      const send = (data: unknown) => {
        const scope = globalThis as unknown as {
          onmessage(event: { data: unknown }): void;
        };
        scope.onmessage({ data });
      };
      const next = await request();
      const imageId = parseLocalImageId("brand-mark");
      const prepared = await preflightLocalImages([imageId], async () => ({
        bytes: new Uint8Array(
          Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABAQMAAADO7O3JAAAABlBMVEX/AAAAAP9sof2OAAAACklEQVR4nGNwAAAAQgBBKTf07wAAAABJRU5ErkJggg==",
            "base64",
          ),
        ),
        declaredMimeType: "image/png",
      }));
      const first = {
        ...next,
        request: {
          ...next.request,
          localImageDescriptors: prepared.map(({ descriptor }) => descriptor),
        },
      };
      const duplicate = structuredClone(first);
      if (kind === "conflicting") {
        duplicate.request.localImageDescriptors[0] = {
          ...duplicate.request.localImageDescriptors[0]!,
          sha256: `sha256:${"0".repeat(64)}`,
        };
      }
      const imagesA = createRenderWorkerImagesV2(3, 7, 11, prepared).message;
      const imagesB = structuredClone(imagesA);
      if (kind === "conflicting") {
        new Uint8Array(imagesB.images[0]!.bytes)[0] = 0;
      }

      send(first);
      expect(published).toEqual([]);
      send(duplicate);
      send(imagesB);
      send(imagesA);
      send(duplicate);
      // Both image halves encounter the real, now-empty worker inbox.
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(render).not.toHaveBeenCalled();
      expect(published).toEqual([
        expect.objectContaining({
          jobId: 3,
          revision: 7,
          type: "error",
          issues: [expect.objectContaining({ code: "INVALID_DATA" })],
        }),
      ]);

      send({ ...next, dispatchId: 12 });
      send(first);
      send(imagesB);
      send(imagesA);
      send(createRenderWorkerImagesV2(3, 7, 12, []).message);
      await vi.waitFor(() => expect(published).toHaveLength(2));
      expect(render).toHaveBeenCalledTimes(1);
      expect(published[1]).toMatchObject({
        jobId: 3,
        revision: 7,
        type: "result",
      });
    },
  );
});
