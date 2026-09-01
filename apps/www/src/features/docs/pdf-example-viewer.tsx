"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState(false);
  const detailedPageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const initialDetailedPage = useRef(0);
  const current = example.pages[page]!;

  useEffect(() => {
    if (!viewerOpen) return;
    const frame = requestAnimationFrame(() => {
      detailedPageRefs.current[initialDetailedPage.current]?.scrollIntoView({
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [viewerOpen]);

  function changeViewerOpen(open: boolean) {
    if (open) initialDetailedPage.current = page;
    setViewerOpen(open);
  }

  function showDetailedPage(index: number) {
    setPage(index);
    detailedPageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function trackDetailedPage(container: HTMLDivElement) {
    const viewport = container.getBoundingClientRect();
    const focusLine = viewport.top + viewport.height * 0.3;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [index, element] of detailedPageRefs.current.entries()) {
      if (!element) continue;
      const distance = Math.abs(
        element.getBoundingClientRect().top - focusLine,
      );
      if (distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    }
    setPage((currentPage) =>
      currentPage === nearestIndex ? currentPage : nearestIndex,
    );
  }
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
        <Dialog open={viewerOpen} onOpenChange={changeViewerOpen}>
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
          <DialogContent
            showCloseButton={false}
            className="h-[94svh] max-w-[96vw]! grid-rows-[3.25rem_minmax(0,1fr)] gap-0 overflow-hidden rounded-lg bg-background p-0 motion-reduce:animate-none sm:max-w-[88rem]!"
          >
            <div className="flex min-w-0 items-center gap-2 border-b px-3 sm:px-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">{title} preview</DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed multipage PDF preview with page thumbnails and zoom
                  controls.
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={zoom === 50}
                  onClick={() => setZoom((value) => Math.max(50, value - 10))}
                  aria-label="Zoom out"
                >
                  <MinusIcon aria-hidden="true" />
                </Button>
                <span
                  className="w-11 text-center text-xs tabular-nums text-muted-foreground"
                  aria-live="polite"
                >
                  {zoom}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={zoom === 150}
                  onClick={() => setZoom((value) => Math.min(150, value + 10))}
                  aria-label="Zoom in"
                >
                  <PlusIcon aria-hidden="true" />
                </Button>
                <a
                  href={example.pdf}
                  download
                  className={buttonVariants({
                    variant: "ghost",
                    className: "hidden h-9 sm:inline-flex",
                  })}
                >
                  Download PDF
                </a>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9"
                    />
                  }
                >
                  <XIcon aria-hidden="true" />
                  <span className="sr-only">Close</span>
                </DialogClose>
              </div>
            </div>
            <div className="grid min-h-0 grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)]">
              <aside
                className="scrollbar-hidden min-h-0 overflow-y-auto border-r bg-muted/20 p-2 sm:p-3"
                aria-label="PDF pages"
              >
                <ol className="space-y-3">
                  {example.pages.map((preview, index) => (
                    <li key={preview.src}>
                      <button
                        type="button"
                        className="w-full rounded-md p-1 text-left text-xs tabular-nums text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                        aria-current={page === index ? "page" : undefined}
                        aria-label={`View page ${index + 1}`}
                        onClick={() => showDetailedPage(index)}
                      >
                        <span className="mb-1 block">{index + 1}</span>
                        <Image
                          src={preview.src}
                          alt=""
                          width={preview.width}
                          height={preview.height}
                          className="h-auto w-full bg-white object-contain ring-1 ring-foreground/10"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              </aside>
              <div
                tabIndex={0}
                role="region"
                aria-label="Detailed PDF preview"
                onScroll={(event) => trackDetailedPage(event.currentTarget)}
                className="scrollbar-hidden min-h-0 overflow-auto bg-muted/40 p-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-6"
              >
                <div className="mx-auto flex max-w-[65rem] flex-col items-center gap-5 sm:gap-8">
                  {example.pages.map((preview, index) => (
                    <div
                      key={preview.src}
                      ref={(element) => {
                        detailedPageRefs.current[index] = element;
                      }}
                      className="scroll-m-6 transition-[width] duration-200 motion-reduce:transition-none"
                      style={{ width: `${zoom}%` }}
                    >
                      <Image
                        src={preview.src}
                        alt={`${title} PDF example, page ${index + 1}`}
                        width={preview.width}
                        height={preview.height}
                        className="h-auto w-full bg-white object-contain ring-1 ring-foreground/10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
