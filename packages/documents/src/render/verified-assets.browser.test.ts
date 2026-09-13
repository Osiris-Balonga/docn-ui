import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assetManifest } from "../assets/manifest";
import { createVerifiedBrowserAssetResolver } from "./verified-assets.browser";

afterEach(() => vi.unstubAllGlobals());

describe("verified browser font assets", () => {
  it("fetches same-origin manifest bytes and returns immutable data sources", async () => {
    const files = new Map<string, Uint8Array>(
      await Promise.all(
        assetManifest.assets.map(
          async (asset) =>
            [
              `https://documents.example${asset.publicPath}`,
              new Uint8Array(
                await readFile(
                  new URL(`../../assets/${asset.file}`, import.meta.url),
                ),
              ),
            ] as const,
        ),
      ),
    );
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = input.toString();
      const bytes = files.get(url);
      if (!bytes) return new Response(null, { status: 404 });
      const response = new Response(new Uint8Array(bytes), { status: 200 });
      Object.defineProperty(response, "url", { value: url });
      return response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const resolver = await createVerifiedBrowserAssetResolver(
      "https://documents.example/app/",
    );
    const first = resolver.resolve(assetManifest.assets[0]!.id);

    expect(first.source).toMatch(/^data:font\/woff;base64,/);
    expect(fetchMock).toHaveBeenCalledTimes(assetManifest.assets.length);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://documents.example${assetManifest.assets[0]!.publicPath}`,
      expect.objectContaining({
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      }),
    );
  });

  it("rejects bytes that do not match the qualified manifest", async () => {
    const response = new Response(new Uint8Array([1]), { status: 200 });
    Object.defineProperty(response, "url", {
      value: `https://documents.example${assetManifest.assets[0]!.publicPath}`,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response),
    );

    await expect(
      createVerifiedBrowserAssetResolver("https://documents.example/"),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });
});
