import { copyFile, mkdir, readFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const manifestUrl = new URL(
  "../../packages/documents/assets/manifest.json",
  import.meta.url,
);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const destinationDirectory = fileURLToPath(
  new URL("../../apps/www/public/generated/fonts/", import.meta.url),
);

await mkdir(destinationDirectory, { recursive: true });
for (const asset of manifest.assets) {
  if (asset.kind !== "font") continue;
  const source = fileURLToPath(
    new URL(`../../packages/documents/assets/${asset.file}`, import.meta.url),
  );
  await copyFile(source, `${destinationDirectory}${basename(asset.file)}`);
}
