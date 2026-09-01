import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fingerprintPath = resolve(root, ".artifacts/build/fingerprint.json");
const buildDirectory = resolve(root, "apps/www/out");
const inputPathspecs = [
  "apps/www",
  "packages/documents",
  "tooling/registry",
  "tooling/docs",
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

function collectBuildOutputs(directory) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
      else throw new Error(`Unsupported static build entry: ${path}`);
    }
  };
  visit(directory);
  const hash = createHash("sha256");
  let bytes = 0;
  for (const path of files.sort()) {
    const name = relative(directory, path).replaceAll("\\", "/");
    const contents = readFileSync(path);
    hash.update(name);
    hash.update("\0");
    hash.update(contents);
    hash.update("\0");
    bytes += statSync(path).size;
  }
  return {
    outputSha256: hash.digest("hex"),
    outputFiles: files.length,
    outputBytes: bytes,
  };
}

function computeFingerprint() {
  const inputMode = process.env.CI === "true" ? "commit" : "workspace";
  const includeInput = (file) =>
    !/(^|\/)(tests?|__tests__)(\/|$)/.test(file) &&
    !/\.(test|spec)\.[^/]+$/.test(file);
  const tracked = git("ls-files", "--stage", "-z", "--", ...inputPathspecs)
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((entry) => {
      const match = /^(\d+) ([0-9a-f]+) \d\t(.+)$/.exec(entry);
      if (!match) throw new Error("A tracked build input is invalid.");
      return { object: match[2], path: match[3] };
    })
    .filter(({ path }) => includeInput(path));
  const untracked =
    inputMode === "workspace"
      ? git(
          "ls-files",
          "--others",
          "--exclude-standard",
          "-z",
          "--",
          ...inputPathspecs,
        )
          .toString("utf8")
          .split("\0")
          .filter(Boolean)
          .filter(includeInput)
          .filter((file) => existsSync(resolve(root, file)))
      : [];
  const files = [...tracked.map(({ path }) => path), ...untracked].sort();
  const hash = createHash("sha256");
  for (const { object, path } of tracked.sort((left, right) =>
    left.path.localeCompare(right.path),
  )) {
    hash.update(path);
    hash.update("\0");
    hash.update(object);
    hash.update("\0");
  }
  for (const file of untracked.sort()) {
    hash.update(file);
    hash.update("\0");
    hash.update(readFileSync(resolve(root, file)));
    hash.update("\0");
  }
  if (inputMode === "workspace")
    hash.update(
      git(
        "diff",
        "--binary",
        "--no-ext-diff",
        "HEAD",
        "--",
        ...tracked.map(({ path }) => path),
      ),
    );
  return {
    schemaVersion: 4,
    commit: String(git("rev-parse", "HEAD")).trim(),
    inputMode,
    inputSha256: hash.digest("hex"),
    files: files.length,
    ...collectBuildOutputs(buildDirectory),
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
    recorded.inputMode !== current.inputMode ||
    recorded.inputSha256 !== current.inputSha256 ||
    recorded.files !== current.files ||
    recorded.outputSha256 !== current.outputSha256 ||
    recorded.outputFiles !== current.outputFiles ||
    recorded.outputBytes !== current.outputBytes
  )
    throw new Error(
      "The static build fingerprint does not match this checkout.",
    );
  console.log(`Verified the static build for ${current.commit.slice(0, 12)}.`);
}
