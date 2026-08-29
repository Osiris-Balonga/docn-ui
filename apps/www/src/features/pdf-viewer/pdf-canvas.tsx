"use client";

import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { useEffect, useRef } from "react";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
    if (!bytes || !canvasRef.current) return;
    const loadingTask = getDocument({ data: bytes.slice(0) });
    let cancelled = false;
    let cancelRender: (() => void) | undefined;

    void loadingTask.promise
      .then(async (document) => {
        onPageCount(document.numPages);
        const page = await document.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;
        const cssViewport = page.getViewport({ scale: zoom * 1.25 });
        const renderViewport = page.getViewport({ scale: zoom * 2.5 });
        const canvas = canvasRef.current;
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
      })
      .catch((error: unknown) => {
        if (
          cancelled ||
          (error as { name?: string }).name === "RenderingCancelledException"
        )
          return;
        onError("The PDF preview could not be displayed. Try rendering again.");
      });

    return () => {
      cancelled = true;
      cancelRender?.();
      void loadingTask.destroy();
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
