"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Files, PackageCheck, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  copyText,
  loadRegistrySourceClosure,
  tokenizeSource,
  type RegistrySourceFile,
  type SourceTokenKind,
} from "./registry-source";

const tokenClasses: Record<SourceTokenKind, string> = {
  comment: "text-muted-foreground italic",
  keyword: "text-primary",
  number: "text-amber-700 dark:text-amber-300",
  plain: "text-foreground",
  string: "text-emerald-700 dark:text-emerald-300",
};

const subscribeToStaticOrigin = () => () => {};

function CopyAction({ label, text }: { label: string; text: string }) {
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
      <Button size="sm" variant="outline" onClick={handleCopy}>
        {status === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        {status === "copied" ? "Copied" : label}
      </Button>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {status === "manual"
          ? "Clipboard unavailable — select and copy manually."
          : ""}
      </span>
    </div>
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

export function RegistrySourcePanel({ itemName }: { itemName: string }) {
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
  const assetCommand = `node src/docn/assets/install.mjs --manifest ${origin}/r/dev/assets/manifest.json --target browser`;

  return (
    <section className="border-t" aria-labelledby="registry-source-heading">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Source owned</Badge>
              {files.length > 0 ? (
                <Badge variant="outline">
                  {files.length} files · {itemCount} registry items
                </Badge>
              ) : null}
            </div>
            <h2
              id="registry-source-heading"
              className="mt-3 text-2xl font-semibold tracking-tight"
            >
              Install it, inspect it, change it.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              The CLI copies the complete dependency closure into your project.
              Review every generated file here before installing; updates never
              require an overwrite flag.
            </p>

            <div className="mt-6 grid gap-4">
              <CommandBlock
                label="Install source with the pinned CLI"
                command={installCommand}
              />
              <CommandBlock
                label="Prepare verified local browser assets"
                command={assetCommand}
              />
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <Files
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <Select
                    value={selectedFile?.target ?? ""}
                    onValueChange={(value) => setSelectedTarget(value ?? "")}
                  >
                    <SelectTrigger
                      aria-label="Source file"
                      className="w-full min-w-0 sm:w-[32rem]"
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
                </div>
                {selectedFile ? (
                  <CopyAction label="Copy source" text={selectedFile.content} />
                ) : null}
              </div>

              {error ? (
                <div className="p-8">
                  <p className="font-medium">Source unavailable</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              ) : selectedFile ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/25 px-4 py-2 text-xs text-muted-foreground">
                    <span>{selectedFile.owner}</span>
                    <span>{selectedFile.path}</span>
                  </div>
                  <pre
                    className="max-h-[38rem] overflow-auto p-4 font-mono text-[13px] leading-6"
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
          </div>

          <aside className="rounded-xl border bg-muted/25 p-5">
            <PackageCheck aria-hidden="true" className="size-5 text-primary" />
            <h3 className="mt-3 font-semibold">Before you install</h3>
            <Separator className="my-4" />
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>
                Initialize shadcn in the consumer and configure the{" "}
                <code className="text-foreground">@/*</code> alias.
              </li>
              <li>
                Run the source command without{" "}
                <code className="text-foreground">--overwrite</code>, then
                review the diff.
              </li>
              <li>
                Prepare assets for the browser command shown here, or use the
                documented Node target.
              </li>
              <li>
                The development URL is local. Immutable release URLs are
                introduced only after publication is approved.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
