"use client";

import { Button } from "@/components/ui/button";
import { Download, LoaderCircle, RefreshCw } from "lucide-react";
import {
  GlobalWorkerOptions,
  getDocument,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { useEffect, useRef, useState } from "react";
import {
  makePdfRenderRequest,
  type PdfRenderResponse,
} from "@/workers/pdf/protocol";
import { LatestRenderQueue } from "@/workers/pdf/latest-render-queue";

type RenderStatus = "rendering" | "ready" | "error";

export function QualificationViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const queueRef = useRef<LatestRenderQueue>(null);
  const revisionRef = useRef(0);
  const [name, setName] = useState("Élodie Mbemba");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer>();
  const [status, setStatus] = useState<RenderStatus>("rendering");
  const [message, setMessage] = useState(
    "Rendering revision 1 in a browser worker…",
  );

  useEffect(() => {
    const worker = new Worker(
      new URL("../../workers/pdf/render.worker.ts", import.meta.url),
      { type: "module" },
    );
    const queue = new LatestRenderQueue(
      worker,
      (response: PdfRenderResponse) => {
        if (response.kind === "failure") {
          setStatus("error");
          setMessage(response.message);
          return;
        }
        setPdfBytes(response.result.pdfBytes);
        setPageCount(response.result.pageCount);
        setPageNumber(1);
        setStatus("ready");
        setMessage(
          `Revision ${response.result.revision} · ${response.result.pdfBytes.byteLength.toLocaleString("en-US")} bytes`,
        );
      },
    );
    queueRef.current = queue;
    const revision = ++revisionRef.current;
    queue.enqueue(makePdfRenderRequest(revision, "Élodie Mbemba"));
    return () => {
      queue.destroy();
      queueRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pdfBytes || !canvasRef.current) return;
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const loadingTask = getDocument({ data: pdfBytes.slice(0) });
    let cancelled = false;
    let cancelRender: (() => void) | undefined;

    void loadingTask.promise.then(async (document) => {
      const page = await document.getPage(pageNumber);
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale: 2 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Canvas rendering is unavailable.");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
      });
      cancelRender = () => renderTask.cancel();
      await renderTask.promise;
      page.cleanup();
    });

    return () => {
      cancelled = true;
      cancelRender?.();
      void loadingTask.destroy();
    };
  }, [pageNumber, pdfBytes]);

  const downloadUrl = pdfBytes
    ? URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }))
    : undefined;

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  function render() {
    if (!queueRef.current || !name.trim()) return;
    const revision = ++revisionRef.current;
    setStatus("rendering");
    setMessage(`Rendering revision ${revision} in a browser worker…`);
    queueRef.current.enqueue(makePdfRenderRequest(revision, name.trim()));
  }

  return (
    <div className="grid min-h-svh bg-muted/35 lg:grid-cols-[24rem_1fr]">
      <aside className="border-b bg-background p-6 lg:border-r lg:border-b-0 lg:p-8">
        <div className="mx-auto flex max-w-md flex-col gap-8 lg:sticky lg:top-8">
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">
              Qualification / PDF worker
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Exact bytes, local pipeline.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              This hidden engineering page renders a two-sided card off the main
              thread, then previews a copy with PDF.js.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="card-name" className="text-sm font-medium">
              Cardholder name
            </label>
            <input
              id="card-name"
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
            />
            <Button
              className="w-full"
              onClick={render}
              disabled={status === "rendering" || !name.trim()}
            >
              {status === "rendering" ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              Render new revision
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium capitalize">{status}</span>
              <span
                className={`size-2 rounded-full ${status === "error" ? "bg-destructive" : status === "ready" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </div>
            <p className="mt-2 font-mono text-xs leading-5 text-muted-foreground">
              {message}
            </p>
          </div>

          {downloadUrl ? (
            <Button
              variant="outline"
              render={
                <a
                  href={downloadUrl}
                  download="docn-ui-qualification-card.pdf"
                />
              }
            >
              <Download />
              Download retained bytes
            </Button>
          ) : null}
        </div>
      </aside>

      <main className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-12">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Local PDF.js preview
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber(1)}
                disabled={pageNumber === 1}
              >
                Front
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageNumber(2)}
                disabled={pageNumber === 2 || pageCount < 2}
              >
                Back
              </Button>
            </div>
          </div>
          <div className="flex min-h-[24rem] flex-1 items-center justify-center overflow-auto rounded-xl border bg-[radial-gradient(circle_at_center,var(--color-muted)_0.75px,transparent_0.75px)] bg-[size:16px_16px] p-6 shadow-sm sm:p-12">
            <canvas
              ref={canvasRef}
              className="h-auto max-w-full bg-white shadow-2xl ring-1 ring-black/10"
              aria-label={`PDF preview, page ${pageNumber} of ${pageCount || 2}`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
