import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDistributionAssets } from "./assets.mjs";
import {
  DEVELOPMENT_REGISTRY_VERSION,
  readReleaseMetadata,
} from "../registry/release.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const development = process.argv.includes("--development");
const unexpectedArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--development");
if (unexpectedArguments.length > 0)
  throw new Error("Use verify-assets.mjs with no arguments or --development.");
const release = await readReleaseMetadata(root);
const registryVersion = development
  ? DEVELOPMENT_REGISTRY_VERSION
  : release.registryVersion;
const origin =
  process.env.DOCN_REGISTRY_ORIGIN ??
  `http://127.0.0.1:4173/r/${registryVersion}/`;

const assets = await buildDistributionAssets({
  root,
  origin,
  registryVersion,
});
console.log(
  `Verified ${assets.files.length} local registry asset files and licenses (${assets.files.reduce((total, file) => total + file.bytes.byteLength, 0)} bytes).`,
);
