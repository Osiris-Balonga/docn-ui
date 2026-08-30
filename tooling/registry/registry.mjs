import { readFile } from "node:fs/promises";
import { isAbsolute, posix, relative, resolve, sep } from "node:path";
import { registryItemSchema, registrySchema } from "shadcn/schema";
import {
  DEVELOPMENT_REGISTRY_VERSION,
  PINNED_SHADCN_VERSION,
  registrySourceManifest,
} from "./source-manifest.mjs";

const registrySchemaUrl = "https://ui.shadcn.com/schema/registry.json";
const registryItemSchemaUrl = "https://ui.shadcn.com/schema/registry-item.json";
const sourceExtensions = [
  "",
  ".ts",
  ".tsx",
  ".json",
  "/index.ts",
  "/index.tsx",
];
const forbiddenContent = [
  /@docn(?:-ui)?\//,
  /workspace:\*/,
  /apps\/www/,
  /[A-Za-z]:\\Users\\/,
];
const importPattern =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.[^"']+)\2/g;

function asPosix(value) {
  return value.split(sep).join("/");
}

function assertSafeRelativePath(file) {
  if (
    typeof file !== "string" ||
    file.length === 0 ||
    isAbsolute(file) ||
    posix.normalize(file) !== file ||
    file.startsWith("../")
  ) {
    throw new Error(`Unsafe registry source path: ${String(file)}`);
  }
}

export function targetForSource(source) {
  const sourcePrefix = "packages/documents/src/";
  const assetPrefix = "packages/documents/assets/";
  if (source.startsWith(sourcePrefix))
    return `~/docn/${source.slice(sourcePrefix.length)}`;
  if (source.startsWith(assetPrefix))
    return `~/docn/assets/${source.slice(assetPrefix.length)}`;
  throw new Error(`Registry source is outside the document package: ${source}`);
}

function importBetweenTargets(sourceTarget, target) {
  const sourceDirectory = posix.dirname(sourceTarget.replace(/^~\//, ""));
  const targetPath = target.replace(/^~\//, "").replace(/\.(?:ts|tsx)$/, "");
  const relativeTarget = posix.relative(sourceDirectory, targetPath);
  return relativeTarget.startsWith(".")
    ? relativeTarget
    : `./${relativeTarget}`;
}

function resolveSourceImport(source, specifier, knownSources) {
  const base = posix.normalize(posix.join(posix.dirname(source), specifier));
  const resolved = sourceExtensions
    .map((extension) => `${base}${extension}`)
    .find((candidate) => knownSources.has(candidate));
  if (!resolved)
    throw new Error(`Unresolved registry import "${specifier}" in ${source}.`);
  return resolved;
}

export function rewriteDocumentImports(source, content, knownTargets) {
  const sourceTarget = knownTargets.get(source);
  if (!sourceTarget) throw new Error(`Missing registry target for ${source}.`);
  return content.replace(importPattern, (match, prefix, quote, specifier) => {
    const resolvedSource = resolveSourceImport(
      source,
      specifier,
      new Set(knownTargets.keys()),
    );
    const target = knownTargets.get(resolvedSource);
    if (!target)
      throw new Error(`Missing registry target for ${resolvedSource}.`);
    return `${prefix}${quote}${importBetweenTargets(sourceTarget, target)}${quote}`;
  });
}

export function resolveItemClosure(itemName, itemsByName) {
  const result = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(name) {
    if (visiting.has(name))
      throw new Error(`Registry dependency cycle detected at ${name}.`);
    if (visited.has(name)) return;
    const item = itemsByName.get(name);
    if (!item) throw new Error(`Missing registry dependency: ${name}.`);
    visiting.add(name);
    for (const dependency of item.registryDependencies) visit(dependency);
    visiting.delete(name);
    visited.add(name);
    result.push(name);
  }

  visit(itemName);
  return result;
}

export function validateSourceManifest(manifest) {
  if (
    !manifest ||
    !Array.isArray(manifest.items) ||
    manifest.items.length === 0
  )
    throw new Error("The registry source manifest must declare items.");
  const itemsByName = new Map();
  const sourceOwners = new Map();
  const targetOwners = new Map();

  for (const item of manifest.items) {
    if (!/^docn-[a-z0-9-]+$/.test(item.name))
      throw new Error(`Invalid docn registry item name: ${item.name}.`);
    if (itemsByName.has(item.name))
      throw new Error(`Duplicate registry item name: ${item.name}.`);
    itemsByName.set(item.name, item);
    for (const source of item.files) {
      assertSafeRelativePath(source);
      if (sourceOwners.has(source))
        throw new Error(
          `Registry source ${source} belongs to both ${sourceOwners.get(source)} and ${item.name}.`,
        );
      sourceOwners.set(source, item.name);
      const target = targetForSource(source);
      if (targetOwners.has(target))
        throw new Error(`Duplicate registry target: ${target}.`);
      targetOwners.set(target, item.name);
    }
  }

  for (const item of manifest.items) resolveItemClosure(item.name, itemsByName);
  return { itemsByName, sourceOwners, targetOwners };
}

function fileType(source) {
  if (source.endsWith(".json")) return "registry:file";
  if (source.endsWith(".tsx")) return "registry:component";
  return "registry:lib";
}

function dependencyUrl(origin, itemName) {
  return new URL(`${itemName}.json`, `${origin.replace(/\/$/, "")}/`).href;
}

function assertInsideRoot(root, source) {
  const absolute = resolve(root, source);
  const fromRoot = relative(root, absolute);
  if (fromRoot.startsWith("..") || isAbsolute(fromRoot))
    throw new Error(`Registry source escaped the repository root: ${source}.`);
  return absolute;
}

export async function buildRegistry({
  root,
  origin = "http://127.0.0.1:4173/r/dev/",
  manifest = registrySourceManifest,
} = {}) {
  if (!root) throw new Error("A repository root is required.");
  const rootPackage = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  );
  if (rootPackage.devDependencies?.shadcn !== PINNED_SHADCN_VERSION)
    throw new Error(
      `Expected the official shadcn schema package at ${PINNED_SHADCN_VERSION}.`,
    );
  const { itemsByName } = validateSourceManifest(manifest);
  const knownTargets = new Map();
  for (const item of manifest.items)
    for (const source of item.files)
      knownTargets.set(source, targetForSource(source));

  const generatedItems = [];
  for (const sourceItem of manifest.items) {
    const closure = new Set(resolveItemClosure(sourceItem.name, itemsByName));
    const allowedSources = new Set(
      [...closure].flatMap((name) => itemsByName.get(name).files),
    );
    const files = [];
    for (const source of sourceItem.files) {
      const absolute = assertInsideRoot(root, source);
      let content;
      try {
        content = await readFile(absolute, "utf8");
      } catch {
        throw new Error(`Missing registry source file: ${source}.`);
      }
      for (const match of content.matchAll(importPattern)) {
        const specifier = match[3];
        if (!specifier?.startsWith(".")) continue;
        const resolvedSource = resolveSourceImport(
          source,
          specifier,
          new Set(knownTargets.keys()),
        );
        if (!allowedSources.has(resolvedSource))
          throw new Error(
            `${sourceItem.name} imports ${resolvedSource} outside its dependency closure.`,
          );
      }
      content = rewriteDocumentImports(source, content, knownTargets);
      if (forbiddenContent.some((pattern) => pattern.test(content)))
        throw new Error(`Private workspace reference found in ${source}.`);
      const target = knownTargets.get(source);
      files.push({
        path: source,
        type: fileType(source),
        target,
        content,
      });
    }
    const item = {
      $schema: registryItemSchemaUrl,
      name: sourceItem.name,
      type: sourceItem.type,
      title: sourceItem.title,
      description: sourceItem.description,
      dependencies: sourceItem.dependencies,
      registryDependencies: sourceItem.registryDependencies.map((name) =>
        dependencyUrl(origin, name),
      ),
      files,
      docs: "Development registry item. Review installed source before updating; assets are prepared separately.",
      meta: {
        registryVersion: DEVELOPMENT_REGISTRY_VERSION,
        schemaPackage: `shadcn@${PINNED_SHADCN_VERSION}`,
      },
    };
    generatedItems.push(registryItemSchema.parse(item));
  }

  const catalog = registrySchema.parse({
    $schema: registrySchemaUrl,
    name: manifest.name,
    homepage: manifest.homepage,
    items: generatedItems.map(({ files, ...item }) => ({
      ...item,
      files: files.map((file) => ({
        path: file.path,
        type: file.type,
        target: file.target,
      })),
    })),
  });
  return { catalog, items: generatedItems };
}

export function registryOutputPaths(root) {
  const publicRoot = resolve(root, "apps/www/public/r");
  const versionRoot = resolve(publicRoot, DEVELOPMENT_REGISTRY_VERSION);
  const fromRoot = asPosix(relative(root, versionRoot));
  if (!fromRoot.startsWith("apps/www/public/r/"))
    throw new Error("The registry output directory escaped apps/www/public/r.");
  return { publicRoot, versionRoot };
}
