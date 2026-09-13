import { describe, expect, it } from "vitest";
import {
  createFontManifestIdentity,
  normalizeTemplateInput,
  parseLocalImageId,
} from "../template-contract";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import { getPdfTheme } from "../themes/themes";
import { preflightLocalImages } from "./local-images";
import {
  PDF_RENDER_PROTOCOL_VERSION_V2,
  createRenderWorkerImagesV2,
  receiveRenderWorkerImagesV2,
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
    jobId: 3,
    protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
    request: normalized,
    themeWasExplicit: false,
    type: "render" as const,
  };
}

describe("render worker protocol V2", () => {
  it("accepts only the exact bounded normalized JSON envelope", async () => {
    const value = await request();
    expect(validateRenderWorkerRequestV2(structuredClone(value))).toMatchObject(
      {
        jobId: 3,
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
    const transfer = createRenderWorkerImagesV2(4, 8, prepared);
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
      ),
    ).rejects.toMatchObject({ code: "INVALID_DATA" });
  });
});
