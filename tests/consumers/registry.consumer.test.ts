import { createServer, type Server } from "node:http";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { afterEach, describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const registryOrigin = "http://127.0.0.1:4173";
const browserOrigin = "http://127.0.0.1:4176";
const registryItemUrl = `${registryOrigin}/r/dev/docn-business-card-minimal.json`;
const assetManifestUrl = `${registryOrigin}/r/dev/assets/manifest.json`;
const artifacts = resolve(root, ".artifacts/consumers");
const temporaryRoots: string[] = [];
const openServers: Server[] = [];
const logs: string[] = [];

afterEach(async () => {
  await Promise.all(
    openServers
      .splice(0)
      .map((server) => new Promise<void>((done) => server.close(() => done()))),
  );
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

function sanitize(value: string, temporaryRoot: string) {
  return value
    .replaceAll(temporaryRoot, "<consumer-root>")
    .replaceAll(temporaryRoot.replaceAll("\\", "/"), "<consumer-root>")
    .replaceAll(root, "<workspace-root>")
    .replaceAll(root.replaceAll("\\", "/"), "<workspace-root>")
    .replaceAll(registryOrigin, "<registry-origin>");
}

async function run(
  command: string,
  args: string[],
  cwd: string,
  temporaryRoot: string,
  environment: NodeJS.ProcessEnv = process.env,
) {
  return new Promise<string>((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd,
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += String(chunk);
    });
    child.once("error", rejectRun);
    child.once("close", (status) => {
      const commandLine = sanitize(
        `$ ${command} ${args.join(" ")}`,
        temporaryRoot,
      );
      const sanitized = sanitize(output, temporaryRoot);
      logs.push(`${commandLine}\n${sanitized}`);

      if (status !== 0) {
        rejectRun(
          new Error(`Consumer command failed (${status}): ${sanitized}`),
        );
        return;
      }

      resolveRun(output);
    });
  });
}

async function runPnpm(args: string[], cwd: string, temporaryRoot: string) {
  if (!process.env.npm_execpath)
    throw new Error("Run consumer tests through pnpm.");
  return run(
    process.execPath,
    [process.env.npm_execpath, ...args],
    cwd,
    temporaryRoot,
  );
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function startStaticServer(directory: string, port: number) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", `http://127.0.0.1:${port}`).pathname,
      );
      const relativePath =
        pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      const absolute = resolve(directory, relativePath);
      if (relative(directory, absolute).startsWith("..")) {
        response.writeHead(403).end();
        return;
      }
      const bytes = await readFile(absolute);
      const types: Record<string, string> = {
        ".css": "text/css",
        ".html": "text/html",
        ".js": "text/javascript",
        ".json": "application/json",
        ".mjs": "text/javascript",
        ".woff": "font/woff",
      };
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": types[extname(absolute)] ?? "application/octet-stream",
      });
      response.end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolveListen());
  });
  openServers.push(server);
  return server;
}

async function stopServer(server: Server) {
  await new Promise<void>((done) => server.close(() => done()));
  const index = openServers.indexOf(server);
  if (index >= 0) openServers.splice(index, 1);
}

async function scaffoldConsumer(directory: string, name: string) {
  await mkdir(resolve(directory, "src"), { recursive: true });
  await writeJson(resolve(directory, "package.json"), {
    name,
    private: true,
    type: "module",
    packageManager: "pnpm@11.24.0",
    devDependencies: { vite: "8.2.2" },
  });
  await writeJson(resolve(directory, "components.json"), {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "base-nova",
    rsc: false,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/index.css",
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    iconLibrary: "lucide",
    aliases: {
      components: "#/components",
      utils: "#/lib/utils",
      ui: "#/components/ui",
      lib: "#/lib",
      hooks: "#/hooks",
    },
  });
  await writeJson(resolve(directory, "tsconfig.json"), {
    compilerOptions: {
      baseUrl: ".",
      jsx: "react-jsx",
      module: "ESNext",
      moduleResolution: "Bundler",
      paths: { "#/*": ["src/*"] },
      target: "ES2022",
    },
    include: ["docn", "src", "vite.config.mjs"],
  });
  await writeFile(resolve(directory, "src/index.css"), "");
}

async function installTemplate(
  directory: string,
  temporaryRoot: string,
  target: "browser" | "node",
) {
  await runPnpm(["install", "--ignore-workspace"], directory, temporaryRoot);
  await run(
    process.execPath,
    [
      resolve(root, "node_modules/shadcn/dist/index.js"),
      "add",
      registryItemUrl,
      "--cwd",
      directory,
      "--yes",
    ],
    directory,
    temporaryRoot,
  );
  await run(
    process.execPath,
    [
      resolve(directory, "docn/assets/install.mjs"),
      "--manifest",
      assetManifestUrl,
      "--target",
      target,
    ],
    directory,
    temporaryRoot,
  );
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return listFiles(path);
      return [path];
    }),
  );
  return nested.flat();
}

async function inspectPdf(bytes: Uint8Array) {
  const loadingTask = getDocument({
    data: bytes.slice(),
    useSystemFonts: false,
  });
  try {
    const document = await loadingTask.promise;
    const page = await document.getPage(1);
    const content = await page.getTextContent();
    return {
      pages: document.numPages,
      text: content.items
        .filter((item) => "str" in item)
        .map((item) => item.str)
        .join(" "),
      view: page.view,
    };
  } finally {
    await loadingTask.destroy();
  }
}

const requestSource = `{
  assetIds: [],
  data: minimalBusinessCardExampleFr,
  formatId: "card-85x55",
  locale: "fr",
  printProfile: { kind: "screen" },
  protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
  revision: 1,
  templateId: "business-card-minimal",
  templateVersion: "1.0.0",
  themeId: "neutral",
}`;

describe("isolated registry consumers", () => {
  it("installs once per environment and renders after the registry is offline", async () => {
    logs.length = 0;
    const temporaryRoot = await mkdtemp(join(tmpdir(), "docn-ui-consumers-"));
    temporaryRoots.push(temporaryRoot);
    const browserDirectory = resolve(temporaryRoot, "browser-consumer");
    const nodeDirectory = resolve(temporaryRoot, "node-consumer");
    await Promise.all([
      scaffoldConsumer(browserDirectory, "docn-browser-consumer"),
      scaffoldConsumer(nodeDirectory, "docn-node-consumer"),
    ]);
    const registryServer = await startStaticServer(
      resolve(root, "apps/www/public"),
      4173,
    );

    await installTemplate(browserDirectory, temporaryRoot, "browser");
    await installTemplate(nodeDirectory, temporaryRoot, "node");

    const installedSources = [
      ...(await listFiles(resolve(browserDirectory, "docn"))),
      ...(await listFiles(resolve(nodeDirectory, "docn"))),
    ];
    expect(installedSources.length).toBe(58);
    expect(
      installedSources.filter((file) =>
        /[\\/]primitives[\\/]qr-code\.ts$/.test(file),
      ),
    ).toHaveLength(2);
    for (const file of installedSources) {
      const content = await readFile(file, "utf8");
      expect(content).not.toContain(root);
      expect(content).not.toContain("workspace:*");
      expect(content).not.toContain("@docn-ui/");
    }

    await writeFile(
      resolve(nodeDirectory, "src/node-entry.ts"),
      `import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PDF_RENDER_PROTOCOL_VERSION } from "../docn/core/contracts";
import { createNodeAssetResolver } from "../docn/render/assets.node";
import { renderDocumentInNode } from "../docn/render/node";
import { createBusinessCardMinimalPlan } from "../docn/templates/business-cards/business-card-minimal/business-card-minimal";
import { minimalBusinessCardExampleFr } from "../docn/templates/business-cards/business-card-minimal/examples";
const { plan } = createBusinessCardMinimalPlan(${requestSource});
const bytes = await renderDocumentInNode(plan, createNodeAssetResolver(resolve("assets")));
await writeFile("node-output.pdf", bytes);
console.log("node-render-complete", bytes.byteLength);
`,
    );
    await writeFile(
      resolve(nodeDirectory, "vite.config.mjs"),
      `import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: { outDir: "dist-node", ssr: "src/node-entry.ts", rollupOptions: { output: { entryFileNames: "node-entry.mjs" } } },
});
`,
    );

    await writeFile(
      resolve(browserDirectory, "index.html"),
      '<!doctype html><html><body><p id="status">rendering</p><script type="module" src="/src/main.ts"></script></body></html>',
    );
    await writeFile(
      resolve(browserDirectory, "src/main.ts"),
      `import { PDF_RENDER_PROTOCOL_VERSION } from "../docn/core/contracts";
import { createBrowserAssetResolver } from "../docn/render/assets.browser";
import { renderDocumentInBrowser } from "../docn/render/browser";
import { createBusinessCardMinimalPlan } from "../docn/templates/business-cards/business-card-minimal/business-card-minimal";
import { minimalBusinessCardExampleFr } from "../docn/templates/business-cards/business-card-minimal/examples";
const { plan } = createBusinessCardMinimalPlan(${requestSource});
const bytes = await renderDocumentInBrowser(plan, createBrowserAssetResolver(window.location.origin));
const link = document.createElement("a");
link.href = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
link.download = "browser-output.pdf";
link.textContent = "Download browser PDF";
document.body.append(link);
document.querySelector("#status").textContent = "ready";
`,
    );
    await writeFile(
      resolve(browserDirectory, "vite.config.mjs"),
      `import { defineConfig } from "vite";
export default defineConfig({ build: { outDir: "dist-browser" } });
`,
    );

    await runPnpm(["exec", "vite", "build"], nodeDirectory, temporaryRoot);
    await runPnpm(["exec", "vite", "build"], browserDirectory, temporaryRoot);
    await stopServer(registryServer);
    await expect(fetch(`${registryOrigin}/r/registry.json`)).rejects.toThrow();

    await run(
      process.execPath,
      ["dist-node/node-entry.mjs"],
      nodeDirectory,
      temporaryRoot,
      {
        ...process.env,
        NODE_PATH: resolve(nodeDirectory, "node_modules"),
      },
    );
    const nodeBytes = new Uint8Array(
      await readFile(resolve(nodeDirectory, "node-output.pdf")),
    );

    const browserServer = await startStaticServer(
      resolve(browserDirectory, "dist-browser"),
      4176,
    );
    const browser = await chromium.launch({ headless: true });
    let browserBytes: Uint8Array;
    const remoteOrigins = new Set<string>();
    try {
      const page = await browser.newPage();
      page.on("request", (request) => {
        if (/^https?:/.test(request.url()))
          remoteOrigins.add(new URL(request.url()).origin);
      });
      await page.goto(browserOrigin);
      await expect
        .poll(() => page.locator("#status").textContent())
        .toBe("ready");
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download browser PDF" }).click();
      const download = await downloadPromise;
      const path = await download.path();
      if (!path)
        throw new Error("The isolated browser download was not retained.");
      browserBytes = new Uint8Array(await readFile(path));
    } finally {
      await browser.close();
      await stopServer(browserServer);
    }
    expect([...remoteOrigins]).toEqual([browserOrigin]);

    const [nodeInspection, browserInspection] = await Promise.all([
      inspectPdf(nodeBytes),
      inspectPdf(browserBytes),
    ]);
    for (const inspection of [nodeInspection, browserInspection]) {
      expect(inspection.pages).toBe(2);
      expect(inspection.view[2]).toBeCloseTo(240.944_881_889_8, 1);
      expect(inspection.view[3]).toBeCloseTo(155.905_511_811, 1);
      expect(inspection.text).toContain("Élodie Mbemba");
      expect(inspection.text).toContain("Atelier Nzela");
    }

    await mkdir(artifacts, { recursive: true });
    await Promise.all([
      writeFile(resolve(artifacts, "node-consumer.pdf"), nodeBytes),
      writeFile(resolve(artifacts, "browser-consumer.pdf"), browserBytes),
      writeFile(resolve(artifacts, "run.log"), `${logs.join("\n\n")}\n`),
      writeJson(resolve(artifacts, "install-state.json"), {
        schemaVersion: 1,
        registryItem: "docn-business-card-minimal",
        registryOnlineDuringRender: false,
        consumerRoots: [
          "<consumer-root>/browser-consumer",
          "<consumer-root>/node-consumer",
        ],
        installedSourceFilesPerConsumer: installedSources.length / 2,
        browserRemoteOrigins: [...remoteOrigins].map((origin) =>
          origin === browserOrigin ? "<browser-consumer-origin>" : origin,
        ),
        outputs: {
          browser: {
            bytes: browserBytes.byteLength,
            pages: browserInspection.pages,
          },
          node: { bytes: nodeBytes.byteLength, pages: nodeInspection.pages },
        },
      }),
    ]);
  });
});
