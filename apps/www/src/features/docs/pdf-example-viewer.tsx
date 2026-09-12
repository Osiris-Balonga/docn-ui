"use client";

import { useState, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegistrySourcePanel } from "@/features/registry/registry-source-panel";
import { PdfPreviewDialog } from "@/features/pdf-preview/pdf-preview-dialog";
import { captureAnalyticsEvent } from "@/lib/analytics-client";
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
  const analytics = itemName
    ? {
        contentId: itemName.replace(/^docn-/, ""),
        contentType: "component" as const,
        contentFamily: "pdf-components",
        source: "documentation" as const,
      }
    : undefined;
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
            onClick={() => {
              if (analytics)
                captureAnalyticsEvent({
                  name: "download_started",
                  properties: { ...analytics, format: "pdf" },
                });
            }}
            className={buttonVariants({ variant: "ghost", className: "h-10" })}
          >
            Download PDF
          </a>
        </div>
      </div>
      <TabsContent value="preview" className="space-y-3">
        <div className="rounded-lg bg-muted/30 p-4 sm:p-6">
          {failed ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Preview unavailable. Download the PDF to view this example.
            </p>
          ) : (
            <PdfPreviewDialog
              title={title}
              pages={example.pages.map((preview, index) => ({
                ...preview,
                alt: `${title} PDF example, page ${index + 1}`,
              }))}
              activePage={page}
              onActivePageChange={setPage}
              downloadHref={example.pdf}
              triggerClassName="min-h-44"
              previewImageClassName="max-h-80 w-auto"
              onPreviewError={() => setFailed(true)}
              {...(analytics ? { analytics } : {})}
            />
          )}
        </div>
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
