import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Font } from "@react-pdf/renderer";
import { afterAll, beforeAll, expect, it } from "vitest";
import { renderPdf } from "@docn-ui/documents/node";
import { assetManifest } from "../assets/manifest";
import { resolveFormat } from "../core/formats";
import { violetFounderBusinessCardDefinition } from "../templates/business-cards/violet-founder-business-card";
import { violetFounderBusinessCardRenderable } from "../templates/renderable";
import type { TemplateSampleAssets } from "../templates/types";
import { createNodeAssetResolver } from "./assets.node";
import { renderDocumentInNode } from "./node";

const packagedAssetRoot = new URL("../../assets/", import.meta.url);
let assetRoot: string;
const unusedSampleAssets = {} as TemplateSampleAssets;

beforeAll(async () => {
  Font.reset();
  assetRoot = await mkdtemp(join(tmpdir(), "docn-l18-font-coexist-"));
  for (const asset of assetManifest.assets) {
    const destination = join(assetRoot, asset.file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(new URL(asset.file, packagedAssetRoot), destination);
  }
});

afterAll(async () => {
  Font.reset();
  await rm(assetRoot, { force: true, recursive: true });
});

it("accepts equivalent advanced registrations and rejects mismatched content", async () => {
  const format = resolveFormat("card-85x55");
  if (format.kind !== "fixed") throw new Error("Expected a fixed card format.");
  const advancedBytes = await renderDocumentInNode(
    {
      document:
        violetFounderBusinessCardDefinition.renderSample(unusedSampleAssets),
      format,
      printProfile: { kind: "screen" },
    },
    createNodeAssetResolver(assetRoot),
  );
  expect(new TextDecoder().decode(advancedBytes.slice(0, 4))).toBe("%PDF");

  const result = await renderPdf(
    violetFounderBusinessCardRenderable,
    { data: {} },
    { fontAssetDirectory: assetRoot },
  );
  expect(result.pageCount).toBe(2);

  const asset = assetManifest.assets[0]!;
  const mismatchedSource = join(assetRoot, "fonts", "mismatched.woff");
  await writeFile(mismatchedSource, "not the qualified font");
  Font.register({
    family: asset.family,
    fontStyle: asset.style,
    fontWeight: asset.weight,
    src: mismatchedSource,
  });

  await expect(
    renderPdf(
      violetFounderBusinessCardRenderable,
      { data: {} },
      { fontAssetDirectory: assetRoot },
    ),
  ).rejects.toMatchObject({ code: "ASSET_REJECTED" });
});
