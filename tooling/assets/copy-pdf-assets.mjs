import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(
  new URL(
    "../../packages/documents/assets/fonts/noto-sans-latin-400-normal.woff",
    import.meta.url,
  ),
);
const destinationDirectory = fileURLToPath(
  new URL("../../apps/www/public/generated/fonts/", import.meta.url),
);

await mkdir(destinationDirectory, { recursive: true });
await copyFile(
  source,
  `${destinationDirectory}noto-sans-latin-400-normal.woff`,
);
