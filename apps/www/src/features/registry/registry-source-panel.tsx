"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Files, Terminal } from "lucide-react";
import { CodeViewport } from "@/components/code-viewport";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  copyText,
  loadRegistryPrimarySource,
  loadRegistrySourceClosure,
  tokenizeSource,
  type RegistrySourceFile,
  type SourceTokenKind,
} from "./registry-source";
import { cn } from "@/lib/utils";

const tokenClasses: Record<SourceTokenKind, string> = {
  comment: "text-muted-foreground italic",
  keyword: "text-sky-700 dark:text-sky-300",
  number: "text-amber-700 dark:text-amber-300",
  plain: "text-foreground",
  string: "text-emerald-700 dark:text-emerald-300",
};

const subscribeToStaticOrigin = () => () => {};

function CopyAction({
  compact = false,
  label,
  text,
}: {
  compact?: boolean;
  label: string;
  text: string;
}) {
  const [status, setStatus] = useState<"copied" | "idle" | "manual">("idle");

  async function handleCopy() {
    try {
      setStatus((await copyText(text)) ? "copied" : "manual");
    } catch {
      setStatus("manual");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size={compact ? "icon" : "sm"}
        variant="outline"
        className={cn("min-h-10", compact && "size-10")}
        onClick={handleCopy}
        aria-label={
          compact ? (status === "copied" ? "Copied" : label) : undefined
        }
      >
        {status === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {compact ? null : status === "copied" ? "Copied" : label}
      </Button>
      <span
        className={cn("text-xs text-muted-foreground", compact && "sr-only")}
        aria-live="polite"
      >
        {status === "manual"
          ? "Clipboard unavailable — select and copy manually."
          : ""}
      </span>
    </div>
  );
}

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
  const [files, setFiles] = useState<RegistrySourceFile[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [error, setError] = useState<string>();
  const origin = useSyncExternalStore(
    subscribeToStaticOrigin,
    () => window.location.origin,
    () => "http://127.0.0.1:4173",
  );

  useEffect(() => {
    const currentOrigin = window.location.origin;
    let active = true;
    const itemUrl = `/r/dev/${itemName}.json`;
    const sourceRequest = drawer
      ? loadRegistryPrimarySource({ itemUrl, origin: currentOrigin }).then(
          (file) => ({ files: [file], itemCount: 1 }),
        )
      : loadRegistrySourceClosure({ itemUrl, origin: currentOrigin });
    sourceRequest
      .then((result) => {
        if (!active) return;
        setFiles(result.files);
        setItemCount(result.itemCount);
        setSelectedTarget(result.files[0]?.target ?? "");
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "The registry source could not be loaded.",
          );
      });
    return () => {
      active = false;
    };
  }, [drawer, itemName]);

  const selectedFile =
    files.find((file) => file.target === selectedTarget) ?? files[0];
  const highlighted = useMemo(
    () => (selectedFile ? tokenizeSource(selectedFile.content) : []),
    [selectedFile],
  );
  const installCommand = `corepack pnpm dlx shadcn@4.19.0 add ${origin}/r/dev/${itemName}.json`;
  const assetCommand = `node docn/assets/install.mjs --manifest ${origin}/r/dev/assets/manifest.json --target browser`;
  const headingId = `registry-source-${itemName}`;

  return (
    <section
      className={cn("min-w-0", drawer && "flex h-full min-h-0 flex-col")}
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        Template source
      </h2>
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
          <div className={cn(drawer && "flex min-h-0 flex-1 flex-col")}>
            {drawer ? null : (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/25 px-4 py-2 text-xs text-muted-foreground">
                <span>{selectedFile.owner}</span>
                <span>{selectedFile.path}</span>
              </div>
            )}
            <CodeViewport
              className={cn(drawer ? "min-h-0 flex-1" : "max-h-[42rem]")}
            >
              <code aria-label={`${selectedFile.target} source`}>
                {highlighted.map((token, index) => (
                  <span
                    className={tokenClasses[token.kind]}
                    key={`${index}-${token.value.slice(0, 8)}`}
                  >
                    {token.value}
                  </span>
                ))}
              </code>
            </CodeViewport>
          </div>
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            Loading the versioned registry source…
          </div>
        )}
      </div>

      {!drawer ? (
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
      ) : null}
    </section>
  );
}
