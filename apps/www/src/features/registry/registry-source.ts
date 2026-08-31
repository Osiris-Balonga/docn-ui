export interface RegistrySourceFile {
  content: string;
  owner: string;
  path: string;
  target: string;
  type: string;
}

interface RegistryItemPayload {
  meta?: {
    sourcePreview?: Array<{ item: string; target: string }>;
    assetsIncluded?: boolean;
  };
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
 * Loads declared component preview files, or a template and its direct family
 * foundation. Dependency installation and source browsing remain separate:
 * neither preview exposes an unrestricted transitive repository tree.
 */
export async function loadRegistryPreview({
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
  if (item.meta?.sourcePreview !== undefined) {
    const preview = item.meta.sourcePreview;
    if (
      !Array.isArray(preview) ||
      preview.length === 0 ||
      preview.length > 20 ||
      !preview.every(
        (entry) =>
          entry &&
          /^docn-[a-z0-9-]+$/.test(entry.item) &&
          /^~\/docn\/[a-zA-Z0-9/_-]+\.(?:ts|tsx)$/.test(entry.target),
      )
    )
      throw new Error("The component source preview is invalid.");
    const items = new Map([[item.name, item]]);
    await Promise.all(
      [...new Set(preview.map((entry) => entry.item))]
        .filter((name) => name !== item.name)
        .map(async (name) => {
          const url = new URL(`${name}.json`, localRegistryUrl(itemUrl, origin))
            .href;
          const supportingResponse = await fetchImpl(url);
          if (!supportingResponse.ok)
            throw new Error(
              `Registry source returned HTTP ${supportingResponse.status}.`,
            );
          const supporting = parseRegistryItem(await supportingResponse.json());
          if (supporting.name !== name)
            throw new Error(
              "The supporting source item does not match its name.",
            );
          items.set(name, supporting);
        }),
    );
    const files = preview.map(({ item: name, target }) => {
      const file = items
        .get(name)
        ?.files.find((candidate) => candidate.target === target);
      if (!file)
        throw new Error("A declared component source file is missing.");
      return { ...file, owner: name };
    });
    return {
      files,
      itemCount: items.size,
      assetsIncluded: item.meta?.assetsIncluded === true,
    };
  }
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
  return {
    files: previewFiles,
    itemCount: foundationDependency ? 2 : 1,
    assetsIncluded: item.meta?.assetsIncluded ?? true,
  };
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
