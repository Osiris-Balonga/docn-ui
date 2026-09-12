import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assetManifest } from "../assets/manifest";
import { createVerifiedNodeAssetResolver } from "./verified-assets.node";

const temporaryDirectories: string[] = [];
const packagedAssetRoot = new URL("../../assets/", import.meta.url);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("verified Node font assets", () => {
  it("returns digest-bound data snapshots rather than rereadable paths", async () => {
    const assetRoot = await mkdtemp(join(tmpdir(), "docn-l18-fonts-"));
    temporaryDirectories.push(assetRoot);
    for (const asset of assetManifest.assets) {
      const destination = join(assetRoot, asset.file);
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(new URL(asset.file, packagedAssetRoot), destination);
    }

    const resolver = await createVerifiedNodeAssetResolver(assetRoot);
    const asset = assetManifest.assets[0]!;
    const resolved = resolver.resolve(asset.id);
    await writeFile(join(assetRoot, asset.file), "tampered after verification");

    expect(resolved.source).toMatch(/^data:font\/woff;base64,/);
    const bytes = Buffer.from(resolved.source.split(",")[1]!, "base64");
    expect(bytes.byteLength).toBe(asset.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sha256);
  });
});
