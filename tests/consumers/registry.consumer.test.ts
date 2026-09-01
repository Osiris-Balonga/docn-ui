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
import {
  browserConsumerUsage,
  nodeConsumerUsage,
  nodeConsumerBuildConfig,
} from "../../packages/documents/src/examples/consumer-usage";

const root = resolve(import.meta.dirname, "../..");
const registryOrigin = "http://127.0.0.1:4173";
const browserOrigin = "http://127.0.0.1:4176";
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
    devDependencies: { vite: "8.2.2", typescript: "5.9.3" },
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
      strict: true,
      skipLibCheck: true,
    },
    include: ["docn", "src", "vite.config.mjs"],
  });
  await writeFile(
    resolve(directory, "src/index.css"),
    ":root { --consumer-brand: #123456; }\n",
  );
  await writeFile(
    resolve(directory, "src/consumer-owned.ts"),
    'export const consumerOwned = "keep";\n',
  );
}

async function installItem(
  directory: string,
  temporaryRoot: string,
  itemName: string,
) {
  await runPnpm(["install", "--ignore-workspace"], directory, temporaryRoot);
  await run(
    process.execPath,
    [
      resolve(root, "node_modules/shadcn/dist/index.js"),
      "add",
      `${registryOrigin}/r/dev/${itemName}.json`,
      "--cwd",
      directory,
      "--yes",
    ],
    directory,
    temporaryRoot,
  );
}

async function prepareAssets(
  directory: string,
  temporaryRoot: string,
  target: "browser" | "node",
) {
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

describe("isolated registry consumers", () => {
  it("installs distinct component closures and preserves owned configuration", async () => {
    logs.length = 0;
    const temporaryRoot = await mkdtemp(join(tmpdir(), "docn-ui-consumers-"));
    temporaryRoots.push(temporaryRoot);
    const browserDirectory = resolve(temporaryRoot, "browser-consumer");
    const nodeDirectory = resolve(temporaryRoot, "node-consumer");
    await Promise.all([
      scaffoldConsumer(browserDirectory, "docn-browser-consumer"),
      scaffoldConsumer(nodeDirectory, "docn-node-consumer"),
    ]);
    const retainedPaths = [
      "components.json",
      "src/index.css",
      "src/consumer-owned.ts",
    ];
    const retained = await Promise.all(
      [browserDirectory, nodeDirectory].map(async (directory) =>
        Promise.all(
          retainedPaths.map((file) =>
            readFile(resolve(directory, file), "utf8"),
          ),
        ),
      ),
    );
    const registryServer = await startStaticServer(
      resolve(root, "apps/www/public"),
      4173,
    );

    await installItem(browserDirectory, temporaryRoot, "docn-text-example");
    await installItem(nodeDirectory, temporaryRoot, "docn-component-example");
    await prepareAssets(browserDirectory, temporaryRoot, "browser");
    await prepareAssets(nodeDirectory, temporaryRoot, "node");
    const browserSources = await listFiles(resolve(browserDirectory, "docn"));
    const nodeSources = await listFiles(resolve(nodeDirectory, "docn"));
    expect(browserSources).toHaveLength(16);
    expect(nodeSources).toHaveLength(38);
    for (const [directory, sources] of [
      [browserDirectory, browserSources],
      [nodeDirectory, nodeSources],
    ] as const) {
      const manifest = JSON.parse(
        await readFile(resolve(directory, "package.json"), "utf8"),
      );
      for (const dependency of [
        "pdf-lib",
        "pdfjs-dist",
        "qrcode",
        "next",
        "@zxing/library",
      ])
        expect(manifest.dependencies[dependency]).toBeUndefined();
      expect(
        sources.some((file) =>
          /[\\/]templates[\\/]|[\\/]primitives[\\/]index.tsx$/.test(file),
        ),
      ).toBe(false);
      for (const file of sources) {
        const content = await readFile(file, "utf8");
        expect(content).not.toContain(root);
        expect(content).not.toContain("workspace:*");
        expect(content).not.toContain("@docn-ui/");
      }
    }
    const basicManifest = JSON.parse(
      await readFile(resolve(browserDirectory, "package.json"), "utf8"),
    );
    expect(basicManifest.dependencies.jsbarcode).toBeUndefined();
    expect(
      browserSources.some((file) =>
        /barcode|graph|data-table|heading|field-pair/.test(file),
      ),
    ).toBe(false);

    await writeFile(
      resolve(nodeDirectory, "src/node-entry.ts"),
      nodeConsumerUsage,
    );
    await writeFile(
      resolve(nodeDirectory, "vite.config.mjs"),
      nodeConsumerBuildConfig,
    );
    await writeFile(
      resolve(browserDirectory, "index.html"),
      '<!doctype html><html><body><p id="status">rendering</p><script type="module" src="/src/main.ts"></script></body></html>',
    );
    await writeFile(
      resolve(browserDirectory, "src/main.ts"),
      browserConsumerUsage,
    );
    await writeFile(
      resolve(browserDirectory, "vite.config.mjs"),
      `import { defineConfig } from "vite";
export default defineConfig({ build: { outDir: "dist-browser" } });`,
    );
    for (const directory of [browserDirectory, nodeDirectory]) {
      await runPnpm(["exec", "tsc", "--noEmit"], directory, temporaryRoot);
      await runPnpm(["exec", "vite", "build"], directory, temporaryRoot);
    }
    await stopServer(registryServer);
    await expect(fetch(`${registryOrigin}/r/registry.json`)).rejects.toThrow();
    await run(
      process.execPath,
      ["dist-node/node-entry.mjs"],
      nodeDirectory,
      temporaryRoot,
    );
    const componentBytes = new Uint8Array(
      await readFile(resolve(nodeDirectory, "components-output.pdf")),
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
      const path = await (await downloadPromise).path();
      if (!path)
        throw new Error("The isolated browser download was not retained.");
      browserBytes = new Uint8Array(await readFile(path));
    } finally {
      await browser.close();
      await stopServer(browserServer);
    }
    expect([...remoteOrigins]).toEqual([browserOrigin]);
    const [componentInspection, browserInspection] = await Promise.all([
      inspectPdf(componentBytes),
      inspectPdf(browserBytes),
    ]);
    expect(componentInspection.pages).toBe(1);
    expect(componentInspection.text).toContain("DOCUMENT");
    expect(componentInspection.text).toContain("COPIES");
    expect(componentInspection.text).toContain("Business cards");
    expect(componentInspection.text).toContain("Team badges");
    expect(componentInspection.text).toContain("Copies by document");
    expect(componentInspection.text).toContain("DOCN-2026-0042");
    expect(componentInspection.text).toContain("Page 1 of 1");
    expect(browserInspection.pages).toBe(1);
    expect(browserInspection.text).toContain(
      "Source-owned text. Bonjour Élodie.",
    );
    expect(browserInspection.view[2]).toBeCloseTo(595.28, 1);

    for (const [index, directory] of [
      browserDirectory,
      nodeDirectory,
    ].entries())
      for (const [fileIndex, file] of retainedPaths.entries())
        expect(await readFile(resolve(directory, file), "utf8")).toBe(
          retained[index]![fileIndex],
        );
    await mkdir(artifacts, { recursive: true });
    await Promise.all([
      writeFile(resolve(artifacts, "browser-consumer.pdf"), browserBytes),
      writeFile(resolve(artifacts, "component-consumer.pdf"), componentBytes),
      writeFile(resolve(artifacts, "run.log"), `${logs.join("\n\n")}\n`),
      writeJson(resolve(artifacts, "install-state.json"), {
        schemaVersion: 1,
        registryItems: ["docn-text-example", "docn-component-example"],
        registryOnlineDuringRender: false,
        installedSourceFiles: {
          browser: browserSources.length,
          nodeComponents: nodeSources.length,
        },
        configurationAndOwnedFilesPreserved: true,
        strictTypeChecks: true,
        browserRemoteOrigins: ["<browser-consumer-origin>"],
        outputs: {
          browser: {
            bytes: browserBytes.byteLength,
            pages: browserInspection.pages,
          },
          components: {
            bytes: componentBytes.byteLength,
            pages: componentInspection.pages,
          },
        },
      }),
    ]);
  });
});
