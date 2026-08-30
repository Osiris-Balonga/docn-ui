"use client";

import { useEffect, useRef, useState } from "react";
import { FileTextIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { knownPages } from "./page-index";

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select") || target.isContentEditable)
  );
}

export function DocsSearch() {
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className="h-10 w-10 justify-start gap-2 px-0 text-muted-foreground md:w-64 md:px-3"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
      >
        <SearchIcon aria-hidden="true" />
        <span className="hidden flex-1 text-left md:inline">
          Search docs...
        </span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] md:inline">
          ⌘ K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={changeOpen}
        title="Search documentation"
        description="Find an available docn-ui page."
        className="sm:max-w-lg"
      >
        <Command>
          <CommandInput autoFocus placeholder="Search available pages..." />
          <CommandList>
            <CommandEmpty>No documentation found.</CommandEmpty>
            {(["Site", "Documentation", "Components"] as const).map(
              (section) => (
                <CommandGroup key={section} heading={section}>
                  {knownPages
                    .filter((page) => page.section === section)
                    .map((page) => (
                      <CommandItem
                        key={page.href}
                        value={`${page.title} ${page.description}`}
                        onSelect={() => navigate(page.href)}
                        className="items-start py-2"
                      >
                        <FileTextIcon aria-hidden="true" className="mt-0.5" />
                        <span>
                          <span className="block font-medium">
                            {page.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {page.description}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              ),
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
