import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "apps/www/out");
const origin = "http://127.0.0.1:4173";
const server = spawn(
  process.execPath,
  [
    resolve(root, "tooling/testing/serve-static.mjs"),
    output,
    "127.0.0.1",
    "4173",
  ],
  { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
);

const ready = new Promise((resolveReady, reject) => {
  let stderr = "";
  const timeout = setTimeout(
    () => reject(new Error(`Preview server did not start. ${stderr}`.trim())),
    10_000,
  );
  server.stderr.on("data", (chunk) => (stderr += chunk));
  server.stdout.on("data", (chunk) => {
    if (String(chunk).includes(`Serving ${output} at ${origin}`)) {
      clearTimeout(timeout);
      resolveReady();
    }
  });
  server.on("exit", (code) => {
    clearTimeout(timeout);
    reject(new Error(`Preview server exited before verification (${code}).`));
  });
});

function findOutput(directory, suffix) {
  return readdirSync(resolve(output, directory), { withFileTypes: true }).find(
    (entry) => entry.isFile() && entry.name.endsWith(suffix),
  )?.name;
}

async function probe(path, type, cache) {
  const response = await fetch(`${origin}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}.`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith(type))
    throw new Error(`${path} returned ${contentType}, expected ${type}.`);
  if (response.headers.get("cache-control") !== cache)
    throw new Error(`${path} returned an unexpected cache policy.`);
  if (response.headers.get("x-content-type-options") !== "nosniff")
    throw new Error(`${path} omitted nosniff.`);
  return response;
}

try {
  await ready;
  const fingerprint = JSON.parse(
    readFileSync(resolve(root, ".artifacts/build/fingerprint.json"), "utf8"),
  );
  if (
    fingerprint.configuration?.siteUrl !== origin ||
    fingerprint.configuration?.registryOrigin !== `${origin}/r/dev/` ||
    fingerprint.configuration?.indexing !== false
  )
    throw new Error("The build is not the configured local preview artifact.");

  const page = await probe(
    "/docs/installation/",
    "text/html",
    "public, max-age=0, must-revalidate",
  );
  const html = await page.text();
  if (!html.includes(`${origin}/r/dev/`))
    throw new Error("Installation commands do not target the preview origin.");
  await probe(
    "/generated/templates/invoice-corporate.pdf",
    "application/pdf",
    "public, max-age=0, must-revalidate",
  );
  await probe(
    "/r/dev/docn-invoice-corporate.json",
    "application/json",
    "no-cache, no-store, must-revalidate",
  );
  const font = findOutput("_next/static/media", ".woff2");
  const script = findOutput("_next/static/chunks", ".js");
  if (!font || !script)
    throw new Error("Static font or runtime asset missing.");
  await probe(
    `/_next/static/media/${font}`,
    "font/woff2",
    "public, max-age=31536000, immutable",
  );
  await probe(
    `/_next/static/chunks/${script}`,
    "application/javascript",
    "public, max-age=31536000, immutable",
  );
  const robots = await (await fetch(`${origin}/robots.txt`)).text();
  if (!robots.includes("Disallow: /"))
    throw new Error("The local preview is unexpectedly indexable.");
  console.log(
    "Verified portable preview pages, assets, registry, and headers.",
  );
} finally {
  server.kill();
}
