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

describe("registry asset distribution", () => {
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
