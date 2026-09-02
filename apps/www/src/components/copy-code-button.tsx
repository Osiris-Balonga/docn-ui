"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/features/registry/registry-source";
import { cn } from "@/lib/utils";

export function CopyCodeButton({
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
    <div className="flex shrink-0 items-center gap-2">
      <Button
        size={compact ? "icon" : "sm"}
        variant="ghost"
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
          : status === "copied"
            ? "Copied to clipboard."
            : ""}
      </span>
    </div>
  );
}
