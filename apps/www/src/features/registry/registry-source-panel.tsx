"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronDown, FileCode2, Files, Folder, Terminal } from "lucide-react";
import { CodeViewport } from "@/components/code-viewport";
import { HighlightedCode } from "@/components/highlighted-code";
import { CopyCodeButton as CopyAction } from "@/components/copy-code-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadRegistryPreview,
  type RegistrySourceFile,
} from "./registry-source";
import { cn } from "@/lib/utils";

const subscribeToStaticOrigin = () => () => {};

function sourceDisplayName(target: string) {
  return (
    target
      .split("/")
      .at(-1)
      ?.replace(/\.[^.]+$/, "") ?? target
  );
}

function sourceTypeLabel(target: string) {
  const extension = target.split(".").at(-1)?.toLowerCase();
  if (extension === "tsx" || extension === "ts") return "TS";
  if (extension === "jsx" || extension === "js") return "JS";
  if (extension === "json") return "{}";
  return "<>";
}

interface SourceTreeNode {
  children: Map<string, SourceTreeNode>;
  file?: RegistrySourceFile;
  name: string;
}

function buildSourceTree(files: RegistrySourceFile[]) {
  const root: SourceTreeNode = { children: new Map(), name: "Files" };
  for (const file of files) {
    const path = file.target
      .replace(/^~\/docn\//, "")
      .replace(/^templates\//, "");
    const segments = path.split("/");
    let parent = root;
    segments.forEach((segment, index) => {
      const child: SourceTreeNode = parent.children.get(segment) ?? {
        children: new Map(),
        name: segment,
      };
      if (index === segments.length - 1) child.file = file;
      parent.children.set(segment, child);
      parent = child;
    });
  }
  return root;
}

function SourceTree({
  node,
  onSelect,
  selectedTarget,
  level = 0,
}: {
  node: SourceTreeNode;
  onSelect: (target: string) => void;
  selectedTarget: string;
  level?: number;
}) {
  return Array.from(node.children.values()).map((child) =>
    child.file ? (
      <button
        key={child.file.target}
        type="button"
        onClick={() => onSelect(child.file!.target)}
        aria-current={selectedTarget === child.file.target ? "true" : undefined}
        className={cn(
          "flex h-8 w-full min-w-0 items-center gap-2 rounded-md pr-2 text-left text-xs outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
          selectedTarget === child.file.target && "bg-muted text-foreground",
        )}
        style={{ paddingLeft: `${8 + level * 14}px` }}
      >
        <FileCode2
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
        <span className="truncate">{child.name}</span>
      </button>
    ) : (
      <div key={`${level}-${child.name}`}>
        <div
          className="flex h-8 min-w-0 items-center gap-1.5 pr-2 text-xs font-medium text-muted-foreground"
          style={{ paddingLeft: `${6 + level * 14}px` }}
        >
          <ChevronDown aria-hidden="true" className="size-3 shrink-0" />
          <Folder aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{child.name}</span>
        </div>
        <SourceTree
          node={child}
          onSelect={onSelect}
          selectedTarget={selectedTarget}
          level={level + 1}
        />
      </div>
    ),
  );
}

function CommandBlock({ command, label }: { command: string; label: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border bg-muted/35">
      <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Terminal aria-hidden="true" className="size-3.5" />
          {label}
        </span>
        <CopyAction label="Copy" text={command} />
      </div>
      <CodeViewport className="max-w-full px-4 py-3 text-sm">
        <code>{command}</code>
      </CodeViewport>
    </div>
  );
}

export function RegistrySourcePanel({
  itemName,
  variant = "page",
}: {
  itemName: string;
  variant?: "drawer" | "page";
}) {
  const drawer = variant === "drawer";
  const [source, setSource] = useState<{
    itemName: string;
    files: RegistrySourceFile[];
    itemCount: number;
    assetsIncluded: boolean;
    error?: string;
  }>();
  const [selectedTarget, setSelectedTarget] = useState("");
  const currentSource = source?.itemName === itemName ? source : undefined;
  const files = currentSource?.files ?? [];
  const itemCount = currentSource?.itemCount ?? 0;
  const error = currentSource?.error;
  const origin = useSyncExternalStore(
    subscribeToStaticOrigin,
    () => window.location.origin,
    () => "http://127.0.0.1:4173",
  );

  useEffect(() => {
    const currentOrigin = window.location.origin;
    let active = true;
    const itemUrl = `/r/dev/${itemName}.json`;
    const sourceRequest = loadRegistryPreview({
      itemUrl,
      origin: currentOrigin,
    });
    sourceRequest
      .then((result) => {
        if (!active) return;
        setSource({ itemName, ...result });
        setSelectedTarget(result.files[0]?.target ?? "");
      })
      .catch((reason: unknown) => {
        if (active)
          setSource({
            itemName,
            files: [],
            itemCount: 0,
            assetsIncluded: false,
            error:
              reason instanceof Error
                ? reason.message
                : "The registry source could not be loaded.",
          });
      });
    return () => {
      active = false;
    };
  }, [drawer, itemName]);

  const selectedFile =
    files.find((file) => file.target === selectedTarget) ?? files[0];
  const installCommand = `corepack pnpm dlx shadcn@4.19.1 add ${origin}/r/dev/${itemName}.json`;
  const assetCommand = `${currentSource?.assetsIncluded === false ? `corepack pnpm dlx shadcn@4.19.1 add ${origin}/r/dev/docn-fonts.json\n` : ""}node docn/assets/install.mjs --manifest ${origin}/r/dev/assets/manifest.json --target browser`;
  const headingId = `registry-source-${itemName}`;

  return (
    <section
      className={cn("min-w-0", drawer && "flex h-full min-h-0 flex-col")}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        Component source
      </h2>
      {drawer ? (
        <div className="mb-3 flex min-w-0 items-center gap-3 rounded-lg border bg-muted/35 p-2 pl-3">
          <Terminal
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <code className="min-w-0 flex-1 truncate text-xs">
            {installCommand}
          </code>
          <CopyAction
            compact
            label="Copy install command"
            text={installCommand}
          />
        </div>
      ) : null}
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          drawer && "flex min-h-0 flex-1 flex-col bg-background",
        )}
      >
        <div
          className={cn(
            "border-b",
            drawer
              ? "flex items-center gap-2 p-2"
              : "flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {drawer ? (
              selectedFile ? (
                <div className="flex min-w-0 items-center gap-2 px-1 text-sm font-medium">
                  <span
                    aria-hidden="true"
                    className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted text-[8px] leading-none font-bold text-muted-foreground"
                  >
                    {sourceTypeLabel(selectedFile.target)}
                  </span>
                  <span className="truncate">
                    {sourceDisplayName(selectedFile.target)}
                  </span>
                </div>
              ) : (
                <span className="px-1 text-sm text-muted-foreground">
                  Loading source…
                </span>
              )
            ) : (
              <Files
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
            {drawer ? null : (
              <Select
                value={selectedFile?.target ?? ""}
                onValueChange={(value) => setSelectedTarget(value ?? "")}
              >
                <SelectTrigger
                  aria-label="Source file"
                  className="w-full min-w-0 md:max-w-lg"
                >
                  <SelectValue placeholder="Loading source files…" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.target} value={file.target}>
                      {file.target.replace(/^~\//, "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
            {!drawer && files.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {files.length} files · {itemCount} registry items
              </span>
            ) : null}
            {selectedFile ? (
              <CopyAction
                compact={drawer}
                label="Copy source"
                text={selectedFile.content}
              />
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="p-8">
            <p className="font-medium">Source unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : selectedFile ? (
          <div
            className={cn(
              drawer && "grid min-h-0 flex-1",
              drawer &&
                files.length > 1 &&
                "md:grid-cols-[14rem_minmax(0,1fr)]",
            )}
          >
            {drawer && files.length > 1 ? (
              <aside
                className="scrollbar-hidden max-h-40 overflow-auto border-b bg-muted/10 p-2 md:max-h-none md:border-r md:border-b-0"
                aria-label="Component files"
              >
                <p className="px-2 pb-2 text-xs font-medium">Files</p>
                <SourceTree
                  node={buildSourceTree(files)}
                  onSelect={setSelectedTarget}
                  selectedTarget={selectedFile.target}
                />
              </aside>
            ) : null}
            <div className={cn(drawer && "flex min-h-0 min-w-0 flex-col")}>
              {drawer ? null : (
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/25 px-4 py-2 text-xs text-muted-foreground">
                  <span>{selectedFile.owner}</span>
                  <span>{selectedFile.path}</span>
                </div>
              )}
              <CodeViewport
                className={cn(drawer ? "min-h-0 flex-1" : "max-h-[42rem]")}
              >
                <HighlightedCode
                  code={selectedFile.content}
                  label={`${selectedFile.target} source`}
                />
              </CodeViewport>
            </div>
          </div>
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            Loading the versioned registry source…
          </div>
        )}
      </div>

      {drawer ? null : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CommandBlock
              label="Install with shadcn"
              command={installCommand}
            />
            <CommandBlock
              label="Prepare browser assets"
              command={assetCommand}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The command copies the complete dependency closure into your
            project. Review the generated files and keep the install free of
            overwrite flags.
          </p>
        </>
      )}
    </section>
  );
}
