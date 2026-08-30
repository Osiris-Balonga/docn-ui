import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function CodeViewport({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "scrollbar-hidden overflow-auto p-4 font-mono text-[13px] leading-6",
        className,
      )}
      tabIndex={0}
      {...props}
    />
  );
}
