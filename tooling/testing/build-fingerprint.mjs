import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fingerprintPath = resolve(root, ".artifacts/build/fingerprint.json");
const buildDirectory = resolve(root, "apps/www/out");
const inputPathspecs = [
  "apps/www",
  "packages/documents",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
];

function git(...args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: args.includes("-z") ? null : "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(String(result.stderr || "Git command failed.").trim());
  return result.stdout;
}

function computeFingerprint() {
  const files = git(
    "ls-files",
    "-z",
    "--cached",
    "--others",
    "--exclude-standard",
    "--",
    ...inputPathspecs,
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter(
      (file) =>
        !/(^|\/)(tests?|__tests__)(\/|$)/.test(file) &&
        !/\.(test|spec)\.[^/]+$/.test(file),
    )
    .sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file);
    hash.update("\0");
    hash.update(readFileSync(resolve(root, file)));
    hash.update("\0");
  }
  return {
    schemaVersion: 1,
    commit: String(git("rev-parse", "HEAD")).trim(),
    inputSha256: hash.digest("hex"),
    files: files.length,
  };
}

const mode = process.argv[2];
if (mode !== "write" && mode !== "verify") {
  throw new Error("Use build-fingerprint.mjs write or verify.");
}
if (!existsSync(buildDirectory))
  throw new Error("The static site build is missing at apps/www/out.");

const current = computeFingerprint();
if (mode === "write") {
  mkdirSync(dirname(fingerprintPath), { recursive: true });
  writeFileSync(fingerprintPath, `${JSON.stringify(current, null, 2)}\n`);
  console.log(
    `Recorded ${relative(root, fingerprintPath)} for ${current.commit.slice(0, 12)}.`,
  );
} else {
  if (!existsSync(fingerprintPath))
    throw new Error("The static build fingerprint is missing.");
  const recorded = JSON.parse(readFileSync(fingerprintPath, "utf8"));
  if (
    recorded.schemaVersion !== current.schemaVersion ||
    recorded.commit !== current.commit ||
    recorded.inputSha256 !== current.inputSha256 ||
    recorded.files !== current.files
  )
    throw new Error(
      "The static build fingerprint does not match this checkout.",
    );
  console.log(`Verified the static build for ${current.commit.slice(0, 12)}.`);
}
