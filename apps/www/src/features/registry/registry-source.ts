export interface RegistrySourceFile {
  content: string;
  owner: string;
  path: string;
  target: string;
  type: string;
}

interface RegistryItemPayload {
  files: Array<{
    content: string;
    path: string;
    target: string;
    type: string;
  }>;
  name: string;
  registryDependencies: string[];
}

function parseRegistryItem(value: unknown): RegistryItemPayload {
  if (!value || typeof value !== "object")
    throw new Error("The registry item response is invalid.");
  const item = value as Partial<RegistryItemPayload>;
  if (
    typeof item.name !== "string" ||
    !Array.isArray(item.registryDependencies) ||
    !item.registryDependencies.every(
      (dependency) => typeof dependency === "string",
    ) ||
    !Array.isArray(item.files) ||
    !item.files.every(
      (file) =>
        file &&
        typeof file.content === "string" &&
        typeof file.path === "string" &&
        typeof file.target === "string" &&
        typeof file.type === "string",
    )
  ) {
    throw new Error("The registry item response is incomplete.");
  }
  return item as RegistryItemPayload;
}

function localRegistryUrl(value: string, origin: string) {
  const parsed = new URL(value, origin);
  if (
    !parsed.pathname.startsWith("/r/") ||
    !parsed.pathname.endsWith(".json")
  ) {
    throw new Error("A registry dependency points outside the registry path.");
  }
  return new URL(`${parsed.pathname}${parsed.search}`, origin).href;
}

export async function loadRegistrySourceClosure({
  fetchImpl = globalThis.fetch,
  itemUrl,
  origin,
}: {
  fetchImpl?: typeof fetch;
  itemUrl: string;
  origin: string;
}) {
  const queue = [localRegistryUrl(itemUrl, origin)];
  const visitedUrls = new Set<string>();
  const visitedNames = new Set<string>();
  const files: RegistrySourceFile[] = [];

  while (queue.length > 0) {
    const url = queue.shift();
    if (!url || visitedUrls.has(url)) continue;
    visitedUrls.add(url);
    const response = await fetchImpl(url);
    if (!response.ok)
      throw new Error(`Registry source returned HTTP ${response.status}.`);
    const item = parseRegistryItem(await response.json());
    if (visitedNames.has(item.name)) continue;
    visitedNames.add(item.name);
    files.push(...item.files.map((file) => ({ ...file, owner: item.name })));
    queue.push(
      ...item.registryDependencies.map((dependency) =>
        localRegistryUrl(dependency, origin),
      ),
    );
  }

  if (files.length === 0)
    throw new Error("The registry item contains no source files.");
  return { files, itemCount: visitedNames.size };
}

export async function loadRegistryPrimarySource({
  fetchImpl = globalThis.fetch,
  itemUrl,
  origin,
}: {
  fetchImpl?: typeof fetch;
  itemUrl: string;
  origin: string;
}) {
  const response = await fetchImpl(localRegistryUrl(itemUrl, origin));
  if (!response.ok)
    throw new Error(`Registry source returned HTTP ${response.status}.`);
  const item = parseRegistryItem(await response.json());
  const file =
    item.files.find((candidate) => candidate.type === "registry:component") ??
    item.files[0];
  if (!file) throw new Error("The registry item contains no source files.");
  return { ...file, owner: item.name } satisfies RegistrySourceFile;
}

function isPreviewableTemplateFile(file: RegistrySourceFile) {
  return (
    !file.target.endsWith("/index.ts") &&
    !file.target.endsWith("/metadata.ts") &&
    /\/(?:examples|layout|plan|schema|[^/]+)\.tsx?$/.test(file.target)
  );
}

function previewFileOrder(file: RegistrySourceFile) {
  if (file.type === "registry:component") return 0;
  if (file.target.endsWith("/layout.tsx")) return 1;
  if (file.target.endsWith("/schema.ts")) return 2;
  if (file.target.endsWith("/examples.ts")) return 3;
  if (file.target.endsWith("/plan.ts")) return 4;
  return 5;
}

/**
 * Loads only the template block and its direct family foundation. This keeps
 * the source drawer useful without turning it into a repository browser or
 * exposing transitive primitives as navigable files.
 */
export async function loadRegistryTemplatePreview({
  fetchImpl = globalThis.fetch,
  itemUrl,
  origin,
}: {
  fetchImpl?: typeof fetch;
  itemUrl: string;
  origin: string;
}) {
  const response = await fetchImpl(localRegistryUrl(itemUrl, origin));
  if (!response.ok)
    throw new Error(`Registry source returned HTTP ${response.status}.`);
  const item = parseRegistryItem(await response.json());
  const files = item.files.map((file) => ({ ...file, owner: item.name }));
  const foundationDependency = item.registryDependencies.find((dependency) =>
    /-foundation(?:\.json)?$/.test(new URL(dependency, origin).pathname),
  );

  if (foundationDependency) {
    const foundationResponse = await fetchImpl(
      localRegistryUrl(foundationDependency, origin),
    );
    if (!foundationResponse.ok)
      throw new Error(
        `Registry source returned HTTP ${foundationResponse.status}.`,
      );
    const foundation = parseRegistryItem(await foundationResponse.json());
    files.push(
      ...foundation.files.map((file) => ({
        ...file,
        owner: foundation.name,
      })),
    );
  }

  const previewFiles = files
    .filter(isPreviewableTemplateFile)
    .sort((left, right) => previewFileOrder(left) - previewFileOrder(right));
  if (previewFiles.length === 0)
    throw new Error("The registry item contains no previewable source files.");
  return { files: previewFiles, itemCount: foundationDependency ? 2 : 1 };
}

export type SourceTokenKind =
  "comment" | "keyword" | "number" | "plain" | "string";

export interface SourceToken {
  kind: SourceTokenKind;
  value: string;
}

const tokenPattern =
  /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:as|async|await|break|case|catch|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|interface|let|new|null|of|return|satisfies|throw|true|try|type|typeof|undefined|while)\b|\b\d+(?:\.\d+)?\b)/g;

export function tokenizeSource(content: string): SourceToken[] {
  return content
    .split(tokenPattern)
    .filter(Boolean)
    .map((value) => {
      if (value.startsWith("//") || value.startsWith("/*"))
        return { kind: "comment", value };
      if (/^["'`]/.test(value)) return { kind: "string", value };
      if (/^\d/.test(value)) return { kind: "number", value };
      if (/^[A-Za-z]+$/.test(value)) return { kind: "keyword", value };
      return { kind: "plain", value };
    });
}

export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied =
    typeof document.execCommand === "function" && document.execCommand("copy");
  textarea.remove();
  return copied;
}
