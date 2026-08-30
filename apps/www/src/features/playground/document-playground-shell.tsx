import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Download,
  Eye,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { TemplateCatalogEntry } from "@docn-ui/documents/catalog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfCanvas } from "@/features/pdf-viewer/pdf-canvas";
import { cn } from "@/lib/utils";

export type RenderStatus = "error" | "ready" | "rendering" | "stale";

function statusVariant(status: RenderStatus) {
  if (status === "error") return "destructive" as const;
  if (status === "ready") return "default" as const;
  return "secondary" as const;
}

export function DocumentPlaygroundShell({
  controls,
  downloadUrl,
  editor,
  fingerprint,
  formatLabel,
  message,
  onPreviewError,
  onReset,
  onRetry,
  pdfBytes,
  source,
  status,
  template,
}: {
  controls: ReactNode;
  downloadUrl?: string | undefined;
  editor: ReactNode;
  fingerprint: string;
  formatLabel: string;
  message: string;
  onPreviewError: (message: string) => void;
  onReset: () => void;
  onRetry?: (() => void) | undefined;
  pdfBytes?: ArrayBuffer | undefined;
  source?: ReactNode;
  status: RenderStatus;
  template: TemplateCatalogEntry;
}) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(template.sides);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/templates/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All templates
      </Link>
      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            {template.title}
          </h1>
          <p className="mt-2 leading-7 text-muted-foreground">
            {template.description} Rendering and export stay in this browser.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {template.familyLabel} · {template.sides} sides · {formatLabel}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="self-start sm:self-auto"
        >
          <RotateCcw aria-hidden="true" />
          Reset sample
        </Button>
      </header>

      <Tabs defaultValue="preview" className="mt-8 gap-0">
        <TabsList variant="line" aria-label="Template view">
          <TabsTrigger value="preview" className="px-3">
            <Eye aria-hidden="true" />
            Preview
          </TabsTrigger>
          {source ? (
            <TabsTrigger value="code" className="px-3">
              <Code2 aria-hidden="true" />
              Code
            </TabsTrigger>
          ) : null}
        </TabsList>
        <TabsContent value="preview" className="pt-8">
          <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <section
              aria-labelledby="document-data-heading"
              className="order-2 space-y-6 lg:order-1"
            >
              <div>
                <h2
                  id="document-data-heading"
                  className="text-base font-semibold"
                >
                  Customize
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Edit fields or apply validated JSON.
                </p>
              </div>
              {editor}
              <Separator />
              {controls}
            </section>

            <section
              aria-labelledby="document-preview-heading"
              className="order-1 min-w-0 lg:order-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2
                    id="document-preview-heading"
                    className="text-base font-semibold"
                  >
                    PDF preview
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Page {pageNumber} of {pageCount} · {Math.round(zoom * 100)}%
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Zoom out"
                    onClick={() =>
                      setZoom((current) => Math.max(0.75, current - 0.25))
                    }
                    disabled={zoom <= 0.75}
                  >
                    <Minus aria-hidden="true" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Zoom in"
                    onClick={() =>
                      setZoom((current) => Math.min(1.75, current + 0.25))
                    }
                    disabled={zoom >= 1.75}
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex min-h-[28rem] items-center justify-center overflow-auto rounded-lg border bg-muted/20 p-4 sm:p-8">
                {pdfBytes ? (
                  <PdfCanvas
                    bytes={pdfBytes}
                    pageNumber={pageNumber}
                    zoom={zoom}
                    onError={onPreviewError}
                    onPageCount={setPageCount}
                  />
                ) : (
                  <div className="flex max-w-xs flex-col items-center text-center">
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-5 animate-spin text-muted-foreground motion-reduce:animate-none"
                    />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Generating the first local PDF preview…
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div aria-live="polite" aria-atomic="true">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(status)}>{status}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {fingerprint ? fingerprint.slice(0, 10) : "pending"}
                    </span>
                  </div>
                  <p
                    data-testid="render-status"
                    data-byte-length={pdfBytes?.byteLength ?? 0}
                    data-fingerprint={fingerprint}
                    className="mt-2 text-sm text-muted-foreground"
                  >
                    {message}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {status === "error" && onRetry ? (
                    <Button variant="secondary" onClick={onRetry}>
                      Retry rendering
                    </Button>
                  ) : null}
                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      download={`docn-ui-${template.id}.pdf`}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      <Download aria-hidden="true" />
                      Download PDF
                    </a>
                  ) : (
                    <Button variant="outline" disabled>
                      <Download aria-hidden="true" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </TabsContent>
        {source ? (
          <TabsContent value="code" className="pt-8">
            {source}
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
