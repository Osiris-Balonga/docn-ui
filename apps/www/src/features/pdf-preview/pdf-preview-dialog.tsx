"use client";

import { useState } from "react";
import Image from "next/image";
import { DownloadIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 50;
const MAX_ZOOM = 250;
const ZOOM_STEP = 10;

export interface PdfPreviewPage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface PdfPreviewDialogProps {
  title: string;
  pages: readonly PdfPreviewPage[];
  activePage?: number;
  onActivePageChange?: (page: number) => void;
  downloadHref?: string;
  triggerClassName?: string;
  previewImageClassName?: string;
  hoverLabel?: string;
  onPreviewError?: () => void;
}

export function PdfPreviewDialog({
  title,
  pages,
  activePage: controlledPage,
  onActivePageChange,
  downloadHref,
  triggerClassName,
  previewImageClassName,
  hoverLabel = "Open preview",
  onPreviewError,
}: PdfPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [internalPage, setInternalPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const page = Math.min(controlledPage ?? internalPage, pages.length - 1);
  const current = pages[page];

  if (!current) return null;

  function selectPage(index: number) {
    setInternalPage(index);
    onActivePageChange?.(index);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setZoom(100);
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "group relative flex w-full items-center justify-center overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
              triggerClassName,
            )}
            aria-label={`Enlarge ${title} preview`}
          />
        }
      >
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          className={cn(
            "h-auto max-w-full object-contain transition-transform duration-200 ease-out group-hover:scale-[1.015] motion-reduce:transition-none",
            previewImageClassName,
          )}
          onError={onPreviewError}
        />
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-background/95 px-2.5 py-1.5 text-xs font-medium text-foreground opacity-0 ring-1 ring-foreground/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          {hoverLabel}
        </span>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        overlayClassName="right-auto! w-[100dvw]! bg-black/70 supports-backdrop-filter:backdrop-blur-sm"
        className="inset-0! top-0! right-auto! left-0! z-50 grid h-[100dvh] w-[100dvw]! max-w-none! translate-x-0! translate-y-0! grid-rows-[4rem_minmax(0,1fr)_4rem] gap-0 overflow-hidden rounded-none bg-transparent p-0 text-white ring-0 motion-reduce:animate-none"
        onKeyDown={(event) => {
          if (pages.length < 2) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            selectPage(Math.max(0, page - 1));
          }
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            selectPage(Math.min(pages.length - 1, page + 1));
          }
        }}
      >
        <header className="flex min-w-0 items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-white">
              {title} preview
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed PDF preview with page thumbnails, navigation and zoom
              controls.
            </DialogDescription>
            <p className="mt-1 text-xs text-white/60">
              {page + 1} / {pages.length}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-white hover:bg-white/10 hover:text-white"
              disabled={zoom === MIN_ZOOM}
              onClick={() =>
                setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))
              }
              aria-label="Zoom out"
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <span
              className="w-11 text-center text-xs tabular-nums text-white/70"
              aria-live="polite"
            >
              {zoom}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-white hover:bg-white/10 hover:text-white"
              disabled={zoom === MAX_ZOOM}
              onClick={() =>
                setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))
              }
              aria-label="Zoom in"
            >
              <PlusIcon aria-hidden="true" />
            </Button>
            {downloadHref ? (
              <a
                href={downloadHref}
                download
                aria-label={`Download ${title} PDF`}
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "h-9 px-2.5 text-white hover:bg-white/10 hover:text-white sm:px-3",
                })}
              >
                <DownloadIcon aria-hidden="true" />
                <span className="hidden sm:inline">Download PDF</span>
              </a>
            ) : null}
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 text-white hover:bg-white/10 hover:text-white"
                />
              }
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </header>

        <p className="sr-only" aria-live="polite">
          Showing page {page + 1} of {pages.length} at {zoom}% zoom.
        </p>

        <div
          className={cn(
            "grid min-h-0 grid-cols-1 px-4 sm:px-6",
            pages.length > 1
              ? "sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
              : "sm:px-12",
          )}
        >
          {pages.length > 1 ? (
            <aside
              className="scrollbar-hidden hidden min-h-0 overflow-y-auto py-4 sm:block"
              aria-label="PDF pages"
            >
              <ol className="space-y-4">
                {pages.map((preview, index) => (
                  <li key={preview.src}>
                    <button
                      type="button"
                      className="w-full rounded-md p-1 text-left text-xs tabular-nums text-white/60 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
                      aria-current={page === index ? "page" : undefined}
                      aria-label={`View page ${index + 1}`}
                      onClick={() => selectPage(index)}
                    >
                      <Image
                        src={preview.src}
                        alt=""
                        width={preview.width}
                        height={preview.height}
                        className="h-auto w-full bg-white object-contain shadow-md ring-1 ring-white/10"
                      />
                      <span className="mt-1.5 block text-center">
                        {index + 1}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}

          <div
            tabIndex={0}
            role="region"
            aria-label="Detailed PDF preview"
            className="scrollbar-hidden min-h-0 overflow-auto rounded-lg bg-black/15 p-4 outline-none focus-visible:ring-2 focus-visible:ring-white sm:p-8"
          >
            <div className="flex min-h-full items-start justify-center">
              <div
                className="origin-top-left transition-transform duration-200 motion-reduce:transition-none"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  width={current.width}
                  height={current.height}
                  priority
                  className="h-auto max-h-[calc(100svh-10rem)] w-auto max-w-[min(72vw,65rem)] bg-white object-contain shadow-lg ring-1 ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 px-4">
          {pages.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                disabled={page === 0}
                onClick={() => selectPage(page - 1)}
              >
                Previous page
              </Button>
              <span className="text-xs tabular-nums text-white/70">
                {page + 1} / {pages.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                disabled={page === pages.length - 1}
                onClick={() => selectPage(page + 1)}
              >
                Next page
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
