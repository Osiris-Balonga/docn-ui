"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DOCUMENT_LIMITS,
  type DocumentLocale,
  type FormatId,
  type PdfAccentColor,
  type PrintProfile,
  type ThemeId,
} from "@docn-ui/documents/core";
import {
  getTemplateCatalogEntry,
  type TemplateCatalogEntry,
} from "@docn-ui/documents/catalog";
import type { BusinessCardTemplateId } from "@docn-ui/documents/templates/business-cards/metadata";
import { businessCardDataSchema } from "@docn-ui/documents/templates/business-cards/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LatestRenderQueue } from "@/workers/pdf/latest-render-queue";
import {
  makePdfRenderRequest,
  type PdfRenderRequest,
  type PdfRenderResponse,
} from "@/workers/pdf/protocol";
import {
  BusinessCardForm,
  toBusinessCardDraft,
  validateBusinessCardDraft,
  type BusinessCardDraft,
  type BusinessCardDraftField,
} from "./business-card-form";
import {
  DocumentPlaygroundShell,
  type RenderStatus,
} from "./document-playground-shell";
import { getBusinessCardFormRegistration } from "./form-registry";

export interface BusinessCardRenderSession {
  destroy(): void;
  enqueue(request: PdfRenderRequest): void;
}

export type CreateBusinessCardRenderSession = (
  onResponse: (response: PdfRenderResponse) => void,
) => BusinessCardRenderSession;

type EditorMode = "form" | "json";
type PrintProfileId = "print" | "print-marks" | "screen";

const formatOptions = [
  { id: "card-85x55", label: "85 × 55 mm" },
  { id: "card-90x50", label: "90 × 50 mm" },
  { id: "card-us", label: "US · 88.9 × 50.8 mm" },
] as const;

const accentOptions: ReadonlyArray<{
  color?: PdfAccentColor;
  id: string;
  label: string;
}> = [
  { id: "default", label: "Theme default" },
  { color: "#3f5f73", id: "slate", label: "Slate" },
  { color: "#9a4f35", id: "terracotta", label: "Terracotta" },
  { color: "#5a35d6", id: "violet", label: "Violet" },
  { color: "#0f766e", id: "teal", label: "Teal" },
];

const themeOptions = [
  { id: "neutral", label: "Neutral" },
  { id: "editorial", label: "Editorial" },
  { id: "bold", label: "Bold" },
] as const;

const localeOptions = [
  { id: "fr", label: "French" },
  { id: "en", label: "English" },
] as const;

const printProfileOptions = [
  { id: "screen", label: "Screen · trim size" },
  { id: "print", label: "Print · 3 mm bleed" },
  { id: "print-marks", label: "Print · bleed and crop marks" },
] as const;

function createWorkerRenderSession(
  onResponse: (response: PdfRenderResponse) => void,
): BusinessCardRenderSession {
  const worker = new Worker(
    new URL("../../workers/pdf/render.worker.ts", import.meta.url),
    { type: "module" },
  );
  return new LatestRenderQueue(worker, onResponse);
}

function resolvePrintProfile(id: PrintProfileId): PrintProfile {
  if (id === "screen") return { kind: "screen" };
  return { kind: "print", bleedMm: 3, cropMarks: id === "print-marks" };
}

export function BusinessCardPlayground({
  createRenderSession = createWorkerRenderSession,
  templateId = "business-card-minimal",
}: {
  createRenderSession?: CreateBusinessCardRenderSession;
  templateId?: BusinessCardTemplateId;
}) {
  const registration = getBusinessCardFormRegistration(templateId);
  const template = getTemplateCatalogEntry(templateId) as TemplateCatalogEntry;
  const [draft, setDraft] = useState<BusinessCardDraft>(() => ({
    ...registration.initialDraft,
  }));
  const [formatId, setFormatId] = useState<FormatId>(
    registration.defaultFormatId,
  );
  const [themeId, setThemeId] = useState<ThemeId>(registration.defaultThemeId);
  const [locale, setLocale] = useState<DocumentLocale>(
    registration.defaultLocale,
  );
  const [accentId, setAccentId] = useState("default");
  const [printProfileId, setPrintProfileId] =
    useState<PrintProfileId>("screen");
  const [editorMode, setEditorMode] = useState<EditorMode>("form");
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [status, setStatus] = useState<RenderStatus>("rendering");
  const [message, setMessage] = useState("Preparing the first preview…");
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer>();
  const [fingerprint, setFingerprint] = useState("");
  const revisionRef = useRef(0);
  const sessionRef = useRef<BusinessCardRenderSession>(null);
  const hasPreviewRef = useRef(false);
  const validation = useMemo(() => validateBusinessCardDraft(draft), [draft]);
  const accentColor = accentOptions.find(
    (option) => option.id === accentId,
  )?.color;

  const handleResponse = useCallback((response: PdfRenderResponse) => {
    if (response.kind === "failure") {
      setStatus("error");
      setMessage(response.message);
      return;
    }
    hasPreviewRef.current = true;
    setPdfBytes(response.result.pdfBytes);
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
    const validData = validation.data;
    const timer = window.setTimeout(() => {
      const revision = ++revisionRef.current;
      setStatus("rendering");
      setMessage(`Rendering revision ${revision} in your browser…`);
      sessionRef.current?.enqueue(
        makePdfRenderRequest(revision, validData, {
          accentColor,
          formatId,
          locale,
          printProfile: resolvePrintProfile(printProfileId),
          templateId,
          themeId,
        }),
      );
    }, 250);
    return () => window.clearTimeout(timer);
  }, [
    accentColor,
    formatId,
    locale,
    printProfileId,
    templateId,
    themeId,
    validation.data,
  ]);

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

  function markChanged() {
    if (hasPreviewRef.current) {
      setStatus("stale");
      setMessage("The preview is outdated while the latest data is checked.");
    }
  }

  function updateField(field: BusinessCardDraftField, value: string) {
    markChanged();
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function openJsonEditor() {
    setJsonDraft(JSON.stringify(draft, null, 2));
    setJsonError("");
    setEditorMode("json");
  }

  function applyJson() {
    if (
      new TextEncoder().encode(jsonDraft).byteLength > DOCUMENT_LIMITS.dataBytes
    ) {
      setJsonError("JSON data must be 256 KiB or smaller.");
      return;
    }
    try {
      const parsed = businessCardDataSchema.safeParse(JSON.parse(jsonDraft));
      if (!parsed.success) {
        setJsonError(
          parsed.error.issues[0]?.message ??
            "The JSON data does not match the business-card fields.",
        );
        return;
      }
      markChanged();
      setDraft(toBusinessCardDraft(parsed.data));
      setJsonDraft(JSON.stringify(parsed.data, null, 2));
      setJsonError("");
      setEditorMode("form");
    } catch {
      setJsonError("Enter valid JSON before applying.");
    }
  }

  function reset() {
    markChanged();
    setDraft({ ...registration.initialDraft });
    setFormatId(registration.defaultFormatId);
    setThemeId(registration.defaultThemeId);
    setLocale(registration.defaultLocale);
    setAccentId("default");
    setPrintProfileId("screen");
    setJsonDraft("");
    setJsonError("");
    setEditorMode("form");
  }

  const formatLabel =
    formatOptions.find((format) => format.id === formatId)?.label ?? formatId;

  const editor = (
    <div>
      <div
        className="mb-5 flex rounded-lg bg-muted p-1"
        aria-label="Data editor mode"
      >
        <Button
          size="sm"
          variant={editorMode === "form" ? "secondary" : "ghost"}
          className="flex-1"
          aria-pressed={editorMode === "form"}
          onClick={() => setEditorMode("form")}
        >
          Fields
        </Button>
        <Button
          size="sm"
          variant={editorMode === "json" ? "secondary" : "ghost"}
          className="flex-1"
          aria-pressed={editorMode === "json"}
          onClick={openJsonEditor}
        >
          Advanced JSON
        </Button>
      </div>
      {editorMode === "form" ? (
        <BusinessCardForm
          draft={draft}
          errors={validation.errors}
          onChange={updateField}
        />
      ) : (
        <div className="space-y-3">
          <Label htmlFor="document-json">Document data JSON</Label>
          <Textarea
            id="document-json"
            className="min-h-80 font-mono text-xs"
            value={jsonDraft}
            aria-invalid={Boolean(jsonError)}
            aria-describedby={jsonError ? "document-json-error" : undefined}
            onChange={(event) => {
              setJsonDraft(event.target.value);
              setJsonError("");
            }}
          />
          {jsonError ? (
            <p
              id="document-json-error"
              className="text-xs leading-5 text-destructive"
            >
              {jsonError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={applyJson}>
              Apply validated JSON
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setJsonError("");
                setEditorMode("form");
              }}
            >
              Discard JSON changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <ControlSelect
        id="card-format"
        label="Format"
        value={formatId}
        options={formatOptions}
        onChange={(value) => {
          markChanged();
          setFormatId(value as FormatId);
        }}
      />
      <ControlSelect
        id="card-theme"
        label="Document theme"
        value={themeId}
        options={themeOptions}
        onChange={(value) => {
          markChanged();
          setThemeId(value as ThemeId);
        }}
      />
      <ControlSelect
        id="card-accent"
        label="Accent"
        value={accentId}
        options={accentOptions}
        onChange={(value) => {
          markChanged();
          setAccentId(value);
        }}
      />
      <ControlSelect
        id="card-locale"
        label="Document language"
        value={locale}
        options={localeOptions}
        onChange={(value) => {
          markChanged();
          setLocale(value as DocumentLocale);
        }}
      />
      <ControlSelect
        id="card-print-profile"
        label="Print profile"
        value={printProfileId}
        options={printProfileOptions}
        onChange={(value) => {
          markChanged();
          setPrintProfileId(value as PrintProfileId);
        }}
      />
    </div>
  );

  return (
    <DocumentPlaygroundShell
      controls={controls}
      downloadUrl={downloadUrl}
      editor={editor}
      fingerprint={fingerprint}
      formatLabel={formatLabel}
      message={message}
      onPreviewError={(errorMessage) => {
        setStatus("error");
        setMessage(errorMessage);
      }}
      onReset={reset}
      pdfBytes={pdfBytes}
      status={status}
      template={template}
    />
  );
}

function ControlSelect({
  id,
  label,
  onChange,
  options,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
