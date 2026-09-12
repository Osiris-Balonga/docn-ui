import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  MAX_ASSET_FILE_BYTES,
  installAssetFiles,
  validateDistributionManifest,
} from "../../packages/documents/src/assets/install.mjs";
import { buildDistributionAssets, readVerifiedAssetFiles } from "./assets.mjs";

const root = resolve(import.meta.dirname, "../..");
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

function digest(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

const brandAssets = [
  {
    file: "apps/www/src/app/icon.svg",
    bytes: 419,
    sha256: "3e11181fad76a48192a1ce830dc3d7de75511906727736ca57ff8e67842a7255",
  },
  {
    file: "apps/www/public/brand/docn-mark-light.svg",
    bytes: 375,
    sha256: "b058521b55b8a1c7677582a26554171e866bce616ca958254b62c8dad5a044e0",
  },
  {
    file: "apps/www/public/brand/docn-mark-dark.svg",
    bytes: 375,
    sha256: "e69b6243bd86f1e4822bac3d9d576b8675795e906c9b38f2a89964365743a557",
  },
  {
    file: "apps/www/public/brand/docn-lockup-light.svg",
    bytes: 521,
    sha256: "6069034b3cb4a3a0292f493c29618bf797d4cafa3dee4c9b16087e2a7a6029b1",
  },
  {
    file: "apps/www/public/brand/docn-lockup-dark.svg",
    bytes: 521,
    sha256: "4e161cf8070c3caf3bd325ac99c58fbeadabafa8dbf1547f879f49e9f9e25a0e",
  },
] as const;

describe("registry asset distribution", () => {
  it("keeps project-owned brand SVGs matched to their provenance inventory", async () => {
    const provenance = await readFile(
      join(root, "apps/www/public/brand/README.md"),
      "utf8",
    );

    expect(provenance).toContain("[MIT License](../../../../LICENSE)");
    for (const asset of brandAssets) {
      const bytes = new Uint8Array(await readFile(join(root, asset.file)));
      expect(bytes.byteLength, asset.file).toBe(asset.bytes);
      expect(digest(bytes), asset.file).toBe(asset.sha256);
      expect(provenance, asset.file).toContain(`\`${asset.file}\``);
      expect(provenance, asset.file).toContain(`\`${asset.sha256}\``);
    }
  });

  it("verifies the real fonts and license before creating a same-origin manifest", async () => {
    const verified = await readVerifiedAssetFiles(root);
    expect(verified.files.map((file) => file.file)).toEqual([
      "fonts/noto-sans-latin-400-normal.woff",
      "fonts/noto-sans-latin-700-normal.woff",
      "fonts/noto-serif-latin-400-normal.woff",
      "fonts/noto-serif-latin-700-normal.woff",
      "fonts/OFL.txt",
    ]);
    const distribution = await buildDistributionAssets({
      root,
      origin: "http://127.0.0.1:4173/r/dev/",
    });
    expect(distribution.manifest.files).toHaveLength(5);
    expect(
      distribution.manifest.files.every((file) =>
        file.url.startsWith("http://127.0.0.1:4173/r/dev/assets/"),
      ),
    ).toBe(true);

    const invalidManifest = structuredClone(verified.manifest);
    invalidManifest.assets[0].file = "../font.woff";
    await expect(readVerifiedAssetFiles(root, invalidManifest)).rejects.toThrow(
      "Unsafe asset path",
    );
  });

  it("installs bounded verified files without network access or overwrites", async () => {
    const font = new TextEncoder().encode("local-font");
    const license = new TextEncoder().encode("local-license");
    const manifestUrl = "http://127.0.0.1:4173/r/dev/assets/manifest.json";
    const manifest = {
      schemaVersion: 1,
      registryVersion: "dev",
      files: [
        {
          path: "fonts/example.woff",
          kind: "font",
          license: "OFL-1.1",
          bytes: font.byteLength,
          sha256: digest(font),
          url: "http://127.0.0.1:4173/r/dev/assets/fonts/example.woff",
        },
        {
          path: "fonts/OFL.txt",
          kind: "license",
          license: "OFL-1.1",
          bytes: license.byteLength,
          sha256: digest(license),
          url: "http://127.0.0.1:4173/r/dev/assets/fonts/OFL.txt",
        },
      ],
    };
    const responses = new Map<string, BodyInit>([
      [manifestUrl, JSON.stringify(manifest)],
      [manifest.files[0].url, font],
      [manifest.files[1].url, license],
    ]);
    const fetchImpl = async (input: string | URL | Request) => {
      const body = responses.get(String(input));
      return body === undefined
        ? new Response(null, { status: 404 })
        : new Response(body);
    };
    const outputDirectory = await mkdtemp(join(tmpdir(), "docn-assets-"));
    temporaryDirectories.push(outputDirectory);

    const result = await installAssetFiles({
      manifestUrl,
      outputDirectory,
      fetchImpl,
    });
    expect(result.files).toEqual(["fonts/example.woff", "fonts/OFL.txt"]);
    expect(
      new Uint8Array(
        await readFile(join(outputDirectory, "fonts/example.woff")),
      ),
    ).toEqual(font);
    await expect(
      installAssetFiles({ manifestUrl, outputDirectory, fetchImpl }),
    ).rejects.toThrow("Refusing to overwrite");

    expect(() =>
      validateDistributionManifest(
        {
          ...manifest,
          files: [{ ...manifest.files[0], path: "../escape.woff" }],
        },
        manifestUrl,
      ),
    ).toThrow("Unsafe asset path");
    expect(() =>
      validateDistributionManifest(
        {
          ...manifest,
          files: [{ ...manifest.files[0], bytes: MAX_ASSET_FILE_BYTES + 1 }],
        },
        manifestUrl,
      ),
    ).toThrow("excessive asset size");
  });
});
