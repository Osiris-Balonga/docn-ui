import { readFile } from "node:fs/promises";
import { Font } from "@react-pdf/renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assetManifest } from "../assets/manifest";
import type { AssetResolver } from "./assets";
import { registerDocumentFonts } from "./fonts";
import {
  createVerifiedBrowserAssetResolver,
  withVerifiedBrowserFontPriority,
} from "./verified-assets.browser";

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

  it("rejects oversized declared and streamed responses before hashing", async () => {
    const first = assetManifest.assets[0]!;
    const headerCancel = vi.fn();
    const openHeaderStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1]));
      },
      cancel: headerCancel,
    });
    const oversizedHeader = new Response(openHeaderStream, {
      headers: { "content-length": String(first.bytes + 1) },
      status: 200,
    });
    Object.defineProperty(oversizedHeader, "url", {
      value: `https://documents.example${first.publicPath}`,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => oversizedHeader),
    );
    await expect(
      createVerifiedBrowserAssetResolver("https://documents.example/"),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    expect(headerCancel).toHaveBeenCalledOnce();

    const cancel = vi.fn();
    const oversizedStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(first.bytes));
        controller.enqueue(new Uint8Array([1]));
      },
      cancel,
    });
    const streamedResponse = new Response(oversizedStream, { status: 200 });
    Object.defineProperty(streamedResponse, "url", {
      value: `https://documents.example${first.publicPath}`,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => streamedResponse),
    );
    await expect(
      createVerifiedBrowserAssetResolver("https://documents.example/"),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects an absent response body", async () => {
    const first = assetManifest.assets[0]!;
    const response = new Response(null, {
      headers: { "content-length": String(first.bytes) },
      status: 200,
    });
    Object.defineProperty(response, "url", {
      value: `https://documents.example${first.publicPath}`,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response),
    );

    await expect(
      createVerifiedBrowserAssetResolver("https://documents.example/"),
    ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
  });

  it("serializes facade priority and restores advanced source order after failure", async () => {
    const resolver: AssetResolver = {
      resolve(assetId) {
        const definition = assetManifest.assets.find(
          ({ id }) => id === assetId,
        );
        if (!definition) throw new Error("Unknown fixture asset.");
        return {
          definition,
          source: `data:font/woff;base64,${btoa(assetId)}`,
        };
      },
    };
    registerDocumentFonts(resolver);
    const registered = Font.getRegisteredFonts() as Record<
      string,
      { sources: object[] } | undefined
    >;
    const prior = new Map(
      ["Noto Sans", "Noto Serif"].map((family) => [
        family,
        registered[family]?.sources.slice() ?? [],
      ]),
    );
    let releaseFirst!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const entered: string[] = [];
    const first = withVerifiedBrowserFontPriority(resolver, async () => {
      entered.push("first");
      for (const asset of assetManifest.assets) {
        expect(registered[asset.family]?.sources[0]).not.toBe(
          prior.get(asset.family)?.[0],
        );
      }
      await gate;
      throw new Error("fixture render failed");
    });
    const second = withVerifiedBrowserFontPriority(resolver, async () => {
      entered.push("second");
    });

    await vi.waitFor(() => expect(entered).toEqual(["first"]));
    releaseFirst();
    await expect(first).rejects.toThrow("fixture render failed");
    await second;
    expect(entered).toEqual(["first", "second"]);
    for (const [family, sources] of prior) {
      expect(registered[family]?.sources.slice(0, sources.length)).toEqual(
        sources,
      );
    }
  });
});
