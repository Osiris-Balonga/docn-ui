"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PdfCanvas } from "@/features/pdf-viewer/pdf-canvas";
import { LatestRenderQueue } from "@/workers/pdf/latest-render-queue";
import {
  makePdfRenderRequest,
  type PdfRenderRequest,
  type PdfRenderResponse,
} from "@/workers/pdf/protocol";
import type {
  DocumentLocale,
  FormatId,
  ThemeId,
} from "@docn-ui/documents/core";
import { minimalBusinessCardExampleFr } from "@docn-ui/documents/templates/business-cards/minimal/examples";
import {
  businessCardDataSchema,
  type BusinessCardData,
} from "@docn-ui/documents/templates/business-cards/schema";
import { Download, LoaderCircle, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DraftField =
  "address" | "email" | "name" | "organization" | "phone" | "role" | "website";
type BusinessCardDraft = Record<DraftField, string>;
type RenderStatus = "error" | "ready" | "rendering" | "stale";

export interface BusinessCardRenderSession {
  destroy(): void;
  enqueue(request: PdfRenderRequest): void;
}

export type CreateBusinessCardRenderSession = (
  onResponse: (response: PdfRenderResponse) => void,
) => BusinessCardRenderSession;

const sampleDraft: BusinessCardDraft = {
  address: minimalBusinessCardExampleFr.address ?? "",
  email: minimalBusinessCardExampleFr.email ?? "",
  name: minimalBusinessCardExampleFr.name,
  organization: minimalBusinessCardExampleFr.organization ?? "",
  phone: minimalBusinessCardExampleFr.phone ?? "",
  role: minimalBusinessCardExampleFr.role ?? "",
  website: minimalBusinessCardExampleFr.website ?? "",
};

const fields: ReadonlyArray<{
  autoComplete: string;
  field: DraftField;
  label: string;
  optional?: boolean;
  type?: "email" | "tel" | "text" | "url";
}> = [
  { autoComplete: "name", field: "name", label: "Name" },
  {
    autoComplete: "organization-title",
    field: "role",
    label: "Role",
    optional: true,
  },
  {
    autoComplete: "organization",
    field: "organization",
    label: "Organization",
    optional: true,
  },
  {
    autoComplete: "email",
    field: "email",
    label: "Email",
    optional: true,
    type: "email",
  },
  {
    autoComplete: "tel",
    field: "phone",
    label: "Phone",
    optional: true,
    type: "tel",
  },
  {
    autoComplete: "url",
    field: "website",
    label: "Website",
    optional: true,
    type: "url",
  },
];

function createWorkerRenderSession(
  onResponse: (response: PdfRenderResponse) => void,
): BusinessCardRenderSession {
  const worker = new Worker(
    new URL("../../workers/pdf/render.worker.ts", import.meta.url),
    { type: "module" },
  );
  return new LatestRenderQueue(worker, onResponse);
}

function validateDraft(draft: BusinessCardDraft): {
  data?: BusinessCardData;
  errors: Partial<Record<DraftField, string>>;
} {
  const parsed = businessCardDataSchema.safeParse(draft);
  if (parsed.success) return { data: parsed.data, errors: {} };
  const errors: Partial<Record<DraftField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (
      typeof field === "string" &&
      field in draft &&
      !errors[field as DraftField]
    )
      errors[field as DraftField] = issue.message;
  }
  return { errors };
}

function statusVariant(status: RenderStatus) {
  if (status === "error") return "destructive" as const;
  if (status === "ready") return "default" as const;
  return "secondary" as const;
}

export function BusinessCardPlayground({
  createRenderSession = createWorkerRenderSession,
}: {
  createRenderSession?: CreateBusinessCardRenderSession;
}) {
  const [draft, setDraft] = useState<BusinessCardDraft>(sampleDraft);
  const [formatId, setFormatId] = useState<FormatId>("card-85x55");
  const [themeId, setThemeId] = useState<ThemeId>("neutral");
  const [locale, setLocale] = useState<DocumentLocale>("fr");
  const [status, setStatus] = useState<RenderStatus>("rendering");
  const [message, setMessage] = useState("Preparing the first preview…");
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer>();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(2);
  const [zoom, setZoom] = useState(1);
  const [fingerprint, setFingerprint] = useState("");
  const revisionRef = useRef(0);
  const sessionRef = useRef<BusinessCardRenderSession>(null);
  const hasPreviewRef = useRef(false);
  const validation = useMemo(() => validateDraft(draft), [draft]);

  const handleResponse = useCallback((response: PdfRenderResponse) => {
    if (response.kind === "failure") {
      setStatus("error");
      setMessage(response.message);
      return;
    }
    hasPreviewRef.current = true;
    setPdfBytes(response.result.pdfBytes);
    setPageCount(response.result.pageCount);
    setPageNumber(1);
    setFingerprint(response.result.fingerprint);
    setStatus("ready");
    setMessage(
      `Revision ${response.result.revision} · ${response.result.pdfBytes.byteLength.toLocaleString("en-US")} bytes`,
    );
  }, []);

  useEffect(() => {
    const session = createRenderSession(handleResponse);
    sessionRef.current = session;
    return () => {
      session.destroy();
      sessionRef.current = null;
    };
  }, [createRenderSession, handleResponse]);

  useEffect(() => {
    if (!validation.data) {
      setStatus(hasPreviewRef.current ? "stale" : "error");
      setMessage("Fix the highlighted fields to update the preview.");
      return;
    }
    const timer = window.setTimeout(() => {
      const revision = ++revisionRef.current;
      setStatus("rendering");
      setMessage(`Rendering revision ${revision} in your browser…`);
      sessionRef.current?.enqueue(
        makePdfRenderRequest(revision, validation.data as BusinessCardData, {
          formatId,
          locale,
          themeId,
        }),
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [formatId, locale, themeId, validation.data]);

  const downloadUrl = useMemo(
    () =>
      pdfBytes && status === "ready"
        ? URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }))
        : undefined,
    [pdfBytes, status],
  );

  useEffect(
    () => () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    },
    [downloadUrl],
  );

  function markDraftChanged() {
    if (hasPreviewRef.current) {
      setStatus("stale");
      setMessage("The preview is outdated while the latest data is checked.");
    }
  }

  function updateField(field: DraftField, value: string) {
    markDraftChanged();
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function reset() {
    markDraftChanged();
    setDraft(sampleDraft);
    setFormatId("card-85x55");
    setThemeId("neutral");
    setLocale("fr");
  }

  const previewError = useCallback((errorMessage: string) => {
    setStatus("error");
    setMessage(errorMessage);
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <header className="flex flex-col gap-5 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Business card</Badge>
            <Badge variant="outline">Two sides</Badge>
            <Badge variant="outline">85 × 55 mm</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Minimal business card
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Edit validated data and inspect the exact PDF that will be
            downloaded. Rendering stays in this browser.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={reset}
          className="self-start sm:self-auto"
        >
          <RotateCcw aria-hidden="true" />
          Reset sample
        </Button>
      </header>

      <div className="grid gap-8 py-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section aria-labelledby="card-data-heading" className="space-y-7">
          <div>
            <h2 id="card-data-heading" className="text-lg font-semibold">
              Card data
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Empty optional fields are omitted from the composition.
            </p>
          </div>

          <div className="space-y-4">
            {fields.map(({ autoComplete, field, label, optional, type }) => {
              const error = validation.errors[field];
              return (
                <div key={field} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor={`card-${field}`}>{label}</Label>
                    {optional ? (
                      <span className="text-xs text-muted-foreground">
                        Optional
                      </span>
                    ) : null}
                  </div>
                  <Input
                    id={`card-${field}`}
                    autoComplete={autoComplete}
                    type={type ?? "text"}
                    value={draft[field]}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `card-${field}-error` : undefined}
                    onChange={(event) => updateField(field, event.target.value)}
                  />
                  {error ? (
                    <p
                      id={`card-${field}-error`}
                      className="text-xs leading-5 text-destructive"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            })}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="card-address">Address</Label>
                <span className="text-xs text-muted-foreground">Optional</span>
              </div>
              <Textarea
                id="card-address"
                autoComplete="street-address"
                rows={3}
                value={draft.address}
                aria-invalid={Boolean(validation.errors.address)}
                aria-describedby={
                  validation.errors.address ? "card-address-error" : undefined
                }
                onChange={(event) => updateField("address", event.target.value)}
              />
              {validation.errors.address ? (
                <p
                  id="card-address-error"
                  className="text-xs leading-5 text-destructive"
                >
                  {validation.errors.address}
                </p>
              ) : null}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="card-format">Format</Label>
              <Select
                value={formatId}
                onValueChange={(value) => {
                  if (!value) return;
                  markDraftChanged();
                  setFormatId(value as FormatId);
                }}
              >
                <SelectTrigger id="card-format" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card-85x55">85 × 55 mm</SelectItem>
                  <SelectItem value="card-90x50">90 × 50 mm</SelectItem>
                  <SelectItem value="card-us">US · 88.9 × 50.8 mm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-theme">Document theme</Label>
              <Select
                value={themeId}
                onValueChange={(value) => {
                  if (!value) return;
                  markDraftChanged();
                  setThemeId(value as ThemeId);
                }}
              >
                <SelectTrigger id="card-theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-locale">Document language</Label>
              <Select
                value={locale}
                onValueChange={(value) => {
                  if (!value) return;
                  markDraftChanged();
                  setLocale(value as DocumentLocale);
                }}
              >
                <SelectTrigger id="card-locale" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section aria-labelledby="card-preview-heading" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="card-preview-heading" className="text-lg font-semibold">
                Actual PDF preview
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

          <div className="mt-4 flex min-h-[28rem] items-center justify-center overflow-auto rounded-xl border bg-muted/35 p-5 sm:p-10">
            {pdfBytes ? (
              <PdfCanvas
                bytes={pdfBytes}
                pageNumber={pageNumber}
                zoom={zoom}
                onError={previewError}
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

          <div className="mt-4 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
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
            <Button
              variant="outline"
              disabled={!downloadUrl}
              render={
                downloadUrl ? (
                  <a href={downloadUrl} download="docn-ui-business-card.pdf" />
                ) : undefined
              }
            >
              <Download aria-hidden="true" />
              Download PDF
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
