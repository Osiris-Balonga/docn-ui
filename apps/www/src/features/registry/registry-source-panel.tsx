"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Files, Terminal } from "lucide-react";
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
      <pre
        className="max-w-full overflow-x-auto px-4 py-3 text-sm"
        tabIndex={0}
      >
        <code>{command}</code>
      </pre>
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
    loadRegistrySourceClosure({
      itemUrl: `/r/dev/${itemName}.json`,
      origin: currentOrigin,
    })
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
  }, [itemName]);

  const selectedFile =
    files.find((file) => file.target === selectedTarget) ?? files[0];
  const highlighted = useMemo(
    () => (selectedFile ? tokenizeSource(selectedFile.content) : []),
    [selectedFile],
  );
  const installCommand = `corepack pnpm dlx shadcn@4.19.0 add ${origin}/r/dev/${itemName}.json`;
  const assetCommand = `node docn/assets/install.mjs --manifest ${origin}/r/dev/assets/manifest.json --target browser`;
  const drawer = variant === "drawer";
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
            {drawer ? null : (
              <Files
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
            <Select
              value={selectedFile?.target ?? ""}
              onValueChange={(value) => setSelectedTarget(value ?? "")}
            >
              <SelectTrigger
                aria-label="Source file"
                className={cn(
                  "w-full min-w-0",
                  drawer ? "max-w-sm" : "md:max-w-lg",
                )}
              >
                <SelectValue placeholder="Loading source files…">
                  {drawer && selectedFile
                    ? sourceDisplayName(selectedFile.target)
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.target} value={file.target}>
                    {file.target.replace(/^~\//, "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <pre
              className={cn(
                "scrollbar-hidden overflow-auto p-4 font-mono text-[13px] leading-6",
                drawer ? "min-h-0 flex-1" : "max-h-[42rem]",
              )}
              tabIndex={0}
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
            </pre>
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
