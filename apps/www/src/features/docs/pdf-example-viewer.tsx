"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrySourcePanel } from "@/features/registry/registry-source-panel";
import type { PdfExample } from "./catalog-data";

export function PdfExampleViewer({
  title,
  example,
  code,
  itemName,
}: {
  title: string;
  example: PdfExample;
  code?: ReactNode;
  itemName?: string;
}) {
  const [page, setPage] = useState(0);
  const [failed, setFailed] = useState(false);
  const current = example.pages[page]!;
  const pagination =
    example.pages.length > 1 ? (
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          className="h-10"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous page
        </Button>
        <span
          className="text-xs tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {page + 1} / {example.pages.length}
        </span>
        <Button
          variant="ghost"
          className="h-10"
          disabled={page === example.pages.length - 1}
          onClick={() => setPage(page + 1)}
        >
          Next page
        </Button>
      </div>
    ) : null;

  return (
    <Tabs defaultValue="preview" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList variant="line" className="h-10">
          <TabsTrigger
            value="preview"
            className="h-10 after:hidden transition-colors"
          >
            Preview
          </TabsTrigger>
          {code ? (
            <TabsTrigger
              value="code"
              className="h-10 after:hidden transition-colors"
            >
              Code
            </TabsTrigger>
          ) : null}
        </TabsList>
        <div className="flex items-center gap-1">
          {itemName ? (
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" className="h-10" />}
              >
                View source
              </SheetTrigger>
              <SheetContent className="w-full! max-w-none! gap-0 bg-background p-3 pt-13 shadow-none sm:w-[min(64rem,85vw)]! motion-reduce:transition-none">
                <SheetTitle className="sr-only">{title} source</SheetTitle>
                <SheetDescription className="sr-only">
                  The component’s own source files. Shared dependencies are
                  installed by the registry.
                </SheetDescription>
                <div className="min-h-0 flex-1">
                  <RegistrySourcePanel itemName={itemName} variant="drawer" />
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
          <a
            href={example.pdf}
            download
            className={buttonVariants({ variant: "ghost", className: "h-10" })}
          >
            Download PDF
          </a>
        </div>
      </div>
      <TabsContent value="preview" className="space-y-3">
        <Dialog>
          <div className="rounded-lg bg-muted/30 p-4 sm:p-6">
            {failed ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Preview unavailable. Download the PDF to view this example.
              </p>
            ) : (
              <DialogTrigger
                className="flex min-h-44 w-full items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Enlarge ${title} preview`}
              >
                <Image
                  src={current.src}
                  alt={`${title} PDF example, page ${page + 1}`}
                  width={current.width}
                  height={current.height}
                  className="h-auto max-h-80 w-auto max-w-full object-contain"
                  onError={() => setFailed(true)}
                />
              </DialogTrigger>
            )}
          </div>
          <DialogContent className="h-[92svh] max-w-[94vw]! grid-rows-[auto_minmax(0,1fr)_auto] motion-reduce:animate-none sm:max-w-[72rem]!">
            <div className="pr-12">
              <DialogTitle>{title} preview</DialogTitle>
              <DialogDescription className="mt-2">
                Actual PDF output. Scroll to inspect the full page.
              </DialogDescription>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label="Enlarged PDF page"
              className="scrollbar-hidden min-h-0 overflow-auto rounded-md bg-muted/30 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src={current.src}
                alt={`${title} PDF example, page ${page + 1}`}
                width={current.width}
                height={current.height}
                className="mx-auto h-auto w-full max-w-[52rem]"
              />
            </div>
            <div>{pagination}</div>
          </DialogContent>
        </Dialog>
        {pagination}
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer py-2 outline-none focus-visible:underline">
            Text alternative
          </summary>
          <p className="mt-2 leading-6">{current.text}</p>
        </details>
      </TabsContent>
      {code ? <TabsContent value="code">{code}</TabsContent> : null}
    </Tabs>
  );
}
