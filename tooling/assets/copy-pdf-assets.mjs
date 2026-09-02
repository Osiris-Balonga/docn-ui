import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readVerifiedAssetFiles } from "./assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const destinationDirectory = fileURLToPath(
  new URL("../../apps/www/public/generated/fonts/", import.meta.url),
);
const { files } = await readVerifiedAssetFiles(root);

await mkdir(destinationDirectory, { recursive: true });
for (const file of files) {
  if (file.kind !== "font") continue;
  await writeFile(`${destinationDirectory}${basename(file.file)}`, file.bytes);
}
