"use client";

import type {
  PDFDocumentLoadingTask,
  PDFPageProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { useEffect, useRef } from "react";
import { DOCUMENT_LIMITS } from "@docn-ui/documents/core";

export function PdfCanvas({
  bytes,
  onError,
  onPageCount,
  pageNumber,
  zoom,
}: {
  bytes?: ArrayBuffer;
  onError(message: string): void;
  onPageCount(pageCount: number): void;
  pageNumber: number;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!bytes || !canvas) return;
    const sourceBytes = bytes;
    let cancelled = false;
    let cancelRender: (() => void) | undefined;
    let loadedPage: PDFPageProxy | undefined;
    let loadingTask: PDFDocumentLoadingTask | undefined;

    async function renderPage() {
      try {
        const { GlobalWorkerOptions, getDocument } =
          await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (cancelled) return;
        GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        loadingTask = getDocument({ data: sourceBytes.slice(0) });
        const document = await loadingTask.promise;
        if (document.numPages > DOCUMENT_LIMITS.pages) {
          throw new Error("PDF page limit exceeded.");
        }
        onPageCount(document.numPages);
        const page = await document.getPage(pageNumber);
        loadedPage = page;
        if (cancelled) return;
        const cssViewport = page.getViewport({ scale: zoom * 1.25 });
        const renderViewport = page.getViewport({ scale: zoom * 2.5 });
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas rendering is unavailable.");
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        canvas.style.width = `${Math.ceil(cssViewport.width)}px`;
        canvas.style.height = `${Math.ceil(cssViewport.height)}px`;
        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: renderViewport,
        });
        cancelRender = () => renderTask.cancel();
        await renderTask.promise;
        page.cleanup();
      } catch (error: unknown) {
        if (
          cancelled ||
          (error as { name?: string }).name === "RenderingCancelledException"
        )
          return;
        onError("The PDF preview could not be displayed. Try rendering again.");
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      cancelRender?.();
      loadedPage?.cleanup();
      void loadingTask?.destroy();
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      canvas.style.removeProperty("width");
      canvas.style.removeProperty("height");
    };
  }, [bytes, onError, onPageCount, pageNumber, zoom]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto max-w-full bg-white shadow-xl ring-1 ring-black/10"
      aria-label={`PDF preview, page ${pageNumber}`}
    />
  );
}
