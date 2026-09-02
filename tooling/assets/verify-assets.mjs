import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDistributionAssets } from "./assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const origin =
  process.env.DOCN_REGISTRY_ORIGIN ?? "http://127.0.0.1:4173/r/dev/";
const unexpectedArguments = process.argv.slice(2);
if (unexpectedArguments.length > 0)
  throw new Error("verify-assets.mjs does not accept arguments.");

const assets = await buildDistributionAssets({ root, origin });
console.log(
  `Verified ${assets.files.length} local registry asset files and licenses (${assets.files.reduce((total, file) => total + file.bytes.byteLength, 0)} bytes).`,
);
