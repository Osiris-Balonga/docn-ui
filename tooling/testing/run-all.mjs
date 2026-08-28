import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const { scripts } = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const scopes = [
  "test",
  "test:pdf",
  "test:consumers",
  "test:e2e",
  "test:visual",
];
const active = scopes.filter((name) => Object.hasOwn(scripts, name));
const inactive = scopes.filter((name) => !Object.hasOwn(scripts, name));

console.log(`Activated commands (sequential, once each): ${active.join(", ")}`);
console.log(`Not activated: ${inactive.join(", ") || "none"}`);

if (process.argv.length > 2) {
  if (process.argv.length === 3 && process.argv[2] === "--list")
    process.exit(0);
  throw new Error(
    "Use test:all without filters, or --list. Filter a scoped command instead.",
  );
}

if (!process.env.npm_execpath) throw new Error("Run through pnpm test:all.");

for (const name of active) {
  const result = spawnSync(
    process.execPath,
    [process.env.npm_execpath, "run", name],
    {
      stdio: "inherit",
      env: process.env,
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
