import { Font } from "@react-pdf/renderer";
import { assetManifest, getAssetDefinition } from "../assets/manifest";
import { DocumentValidationError } from "../core/errors";
import type { AssetResolver } from "./assets";
import { createBrowserAssetResolver } from "./assets.browser";
import { registerDocumentFonts } from "./fonts";

interface RegisteredFontSource {
  data: unknown;
  readonly fontStyle: string;
  readonly fontWeight: number;
  loadResultPromise: Promise<void> | null;
  readonly src: string;
}

interface RegisteredFontFamily {
  sources: RegisteredFontSource[];
}

const trustedFacadeSources = new WeakSet<object>();
let facadeRenderTail = Promise.resolve();

function assetFailure(assetId: string, message: string): never {
  throw new DocumentValidationError([
    {
      code: "ASSET_REJECTED",
      message,
      path: ["runtimeOptions", "fontAssetBaseUrl", assetId],
    },
  ]);
}

function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return `data:font/woff;base64,${btoa(binary)}`;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function readQualifiedFontBytes(
  response: Response,
  assetId: string,
  expectedBytes: number,
): Promise<Uint8Array> {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    if (
      !/^\d+$/.test(contentLength) ||
      Number(contentLength) !== expectedBytes
    ) {
      assetFailure(
        assetId,
        "A browser font Content-Length does not match the qualified manifest.",
      );
    }
  }
  if (!response.body) {
    return assetFailure(
      assetId,
      "A browser font response has no readable body.",
    );
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (total + value.byteLength > expectedBytes) {
        try {
          await reader.cancel("Qualified font byte limit exceeded.");
        } catch {
          // The bounded rejection remains authoritative if cancellation fails.
        }
        return assetFailure(
          assetId,
          "A browser font response exceeds the qualified byte length.",
        );
      }
      const ownedChunk = new Uint8Array(value);
      chunks.push(ownedChunk);
      total += ownedChunk.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  if (total !== expectedBytes) {
    return assetFailure(
      assetId,
      "A browser font response is shorter than the qualified byte length.",
    );
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function createVerifiedBrowserAssetResolver(
  baseUrl: string,
): Promise<AssetResolver> {
  const urlResolver = createBrowserAssetResolver(baseUrl);
  const verifiedSources = new Map<string, string>();
  for (const definition of assetManifest.assets) {
    const source = urlResolver.resolve(definition.id).source;
    try {
      const response = await fetch(source, {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      });
      if (
        !response.ok ||
        new URL(response.url).origin !== new URL(baseUrl).origin
      ) {
        assetFailure(
          definition.id,
          "A qualified browser font could not be fetched.",
        );
      }
      const bytes = await readQualifiedFontBytes(
        response,
        definition.id,
        definition.bytes,
      );
      if (
        bytes.byteLength !== definition.bytes ||
        (await sha256(bytes)) !== definition.sha256
      ) {
        assetFailure(
          definition.id,
          "A browser font asset does not match the qualified manifest.",
        );
      }
      verifiedSources.set(definition.id, bytesToDataUrl(bytes));
    } catch (error) {
      if (error instanceof DocumentValidationError) throw error;
      assetFailure(definition.id, "A qualified browser font is unavailable.");
    }
  }
  return {
    resolve(assetId, path = ["assetId"]) {
      const definition = getAssetDefinition(assetId, path);
      const source = verifiedSources.get(assetId);
      if (!source) assetFailure(assetId, "A browser font was not preflighted.");
      return { definition, source };
    },
  };
}

function registeredFonts(): Record<string, RegisteredFontFamily | undefined> {
  return Font.getRegisteredFonts() as Record<
    string,
    RegisteredFontFamily | undefined
  >;
}

function repairTrustedSource(
  source: RegisteredFontSource,
  expectedSource: string,
): boolean {
  if (source.src !== expectedSource || !trustedFacadeSources.has(source)) {
    return false;
  }
  if (source.data === null && source.loadResultPromise !== null) {
    source.loadResultPromise = null;
  }
  return true;
}

function activateVerifiedFontPriority(resolver: AssetResolver): () => void {
  const priorByFamily = new Map<string, RegisteredFontSource[]>();
  const promotedByFamily = new Map<string, RegisteredFontSource[]>();
  for (const familyName of new Set(
    assetManifest.assets.map((asset) => asset.family),
  )) {
    priorByFamily.set(
      familyName,
      registeredFonts()[familyName]?.sources.slice() ?? [],
    );
  }
  registerDocumentFonts(resolver);
  for (const asset of assetManifest.assets) {
    const expectedSource = resolver.resolve(asset.id).source;
    const family = registeredFonts()[asset.family];
    let source = family?.sources.find(
      (candidate) =>
        candidate.fontStyle === asset.style &&
        candidate.fontWeight === asset.weight &&
        repairTrustedSource(candidate, expectedSource),
    );
    if (!source) {
      const prior = priorByFamily.get(asset.family) ?? [];
      source = family?.sources.find(
        (candidate) =>
          !prior.includes(candidate) &&
          candidate.fontStyle === asset.style &&
          candidate.fontWeight === asset.weight &&
          candidate.src === expectedSource,
      );
      if (!source) {
        Font.register({
          family: asset.family,
          fontStyle: asset.style,
          fontWeight: asset.weight,
          src: expectedSource,
        });
        source = registeredFonts()[asset.family]?.sources.at(-1);
      }
      if (!source || source.src !== expectedSource) {
        assetFailure(
          asset.id,
          "React PDF did not retain the verified browser font source.",
        );
      }
      trustedFacadeSources.add(source);
    }
    const promoted = promotedByFamily.get(asset.family) ?? [];
    promoted.push(source);
    promotedByFamily.set(asset.family, promoted);
  }
  for (const [familyName, promoted] of promotedByFamily) {
    const family = registeredFonts()[familyName];
    if (!family)
      assetFailure(familyName, "React PDF discarded a browser font family.");
    const remaining = family.sources.filter(
      (source) => !promoted.includes(source),
    );
    family.sources.splice(0, family.sources.length, ...promoted, ...remaining);
  }
  return () => {
    for (const [familyName, prior] of priorByFamily) {
      const family = registeredFonts()[familyName];
      if (!family) continue;
      const additions = family.sources.filter(
        (source) => !prior.includes(source),
      );
      family.sources.splice(0, family.sources.length, ...prior, ...additions);
    }
  };
}

export async function withVerifiedBrowserFontPriority<T>(
  resolver: AssetResolver,
  render: () => Promise<T>,
): Promise<T> {
  let release!: () => void;
  const previous = facadeRenderTail;
  facadeRenderTail = new Promise<void>((resolveQueue) => {
    release = resolveQueue;
  });
  await previous;
  let restore: (() => void) | undefined;
  try {
    restore = activateVerifiedFontPriority(resolver);
    return await render();
  } finally {
    restore?.();
    release();
  }
}
