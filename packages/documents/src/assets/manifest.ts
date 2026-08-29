import { z } from "zod";
import manifestJson from "../../assets/manifest.json";
import { DocumentValidationError } from "../core/errors";

const fontAssetSchema = z
  .object({
    id: z.string().regex(/^font-[a-z0-9-]+$/),
    kind: z.literal("font"),
    file: z.string().regex(/^fonts\/[a-z0-9-]+\.woff$/),
    publicPath: z.string().regex(/^\/generated\/fonts\/[a-z0-9-]+\.woff$/),
    family: z.enum(["Noto Sans", "Noto Serif"]),
    weight: z.union([z.literal(400), z.literal(700)]),
    style: z.literal("normal"),
    format: z.literal("woff"),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourcePackage: z.string().min(1),
    license: z.literal("OFL-1.1"),
    licenseFile: z.literal("fonts/OFL.txt"),
  })
  .strict();

const assetManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    qualifiedExamples: z
      .object({ en: z.string().min(1), fr: z.string().min(1) })
      .strict(),
    assets: z.array(fontAssetSchema).length(4),
  })
  .strict();

export type FontAssetDefinition = z.infer<typeof fontAssetSchema>;
export const assetManifest = assetManifestSchema.parse(manifestJson);

export function getAssetDefinition(
  assetId: string,
  path: readonly (number | string)[] = ["assetId"],
): FontAssetDefinition {
  const asset = assetManifest.assets.find(
    (candidate) => candidate.id === assetId,
  );
  if (!asset) {
    throw new DocumentValidationError([
      {
        code: "ASSET_REJECTED",
        message: `Asset "${assetId}" is not declared in the document manifest.`,
        path,
      },
    ]);
  }
  return asset;
}
