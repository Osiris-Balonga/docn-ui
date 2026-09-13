import { afterEach, describe, expect, it, vi } from "vitest";
import { parseLocalImageId } from "../template-contract";
import { createBrowserLocalImageRenderScope } from "./local-images.browser";

afterEach(() => vi.unstubAllGlobals());

describe("browser local-image render scope", () => {
  it("owns object URLs and revokes each source exactly once", () => {
    const createObjectURL = vi.fn(() => "blob:docn/brand-mark");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const bytes = new Uint8Array([1, 2, 3]);
    const scope = createBrowserLocalImageRenderScope([
      {
        bytes,
        descriptor: {
          byteLength: 3,
          heightPx: 1,
          id: parseLocalImageId("brand-mark"),
          mimeType: "image/png",
          sha256: `sha256:${"0".repeat(64)}` as `sha256:${string}`,
          widthPx: 1,
        },
      },
    ]);

    bytes[0] = 9;
    expect(scope.lookup.get(parseLocalImageId("brand-mark"))).toEqual({
      id: "brand-mark",
      resolvedSource: "blob:docn/brand-mark",
    });
    expect(createObjectURL).toHaveBeenCalledOnce();

    scope.dispose();
    scope.dispose();
    expect(scope.lookup.size).toBe(0);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:docn/brand-mark");
  });

  it("rolls back earlier object URLs when scope creation fails", () => {
    const createObjectURL = vi
      .fn()
      .mockReturnValueOnce("blob:docn/first")
      .mockImplementationOnce(() => {
        throw new Error("object URL failure");
      });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const prepared = ["first", "second"].map((id) => ({
      bytes: new Uint8Array([1]),
      descriptor: {
        byteLength: 1,
        heightPx: 1,
        id: parseLocalImageId(id),
        mimeType: "image/png" as const,
        sha256: `sha256:${"0".repeat(64)}` as `sha256:${string}`,
        widthPx: 1,
      },
    }));

    expect(() => createBrowserLocalImageRenderScope(prepared)).toThrow(
      "object URL failure",
    );
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:docn/first");
  });
});
