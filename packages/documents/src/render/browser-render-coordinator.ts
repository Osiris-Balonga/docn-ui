import type { RenderResult } from "../core/contracts";
import { DOCUMENT_LIMITS } from "../core/contracts";
import {
  DocumentValidationError,
  type DocumentErrorCode,
  type DocumentIssue,
} from "../core/errors";
import { getRenderableTemplate } from "../templates/renderable";
import {
  createFontManifestIdentity,
  fingerprintNormalizedTemplateInput,
  type JsonObject,
  type NormalizedTemplateInput,
  type TemplateRenderInput,
} from "../template-contract";
import { normalizeTemplateInputForRender } from "../template-normalization.internal";
import type { RenderableTemplate } from "../renderable-template";
import {
  preflightLocalImages,
  type LocalImageResolver,
  type PreparedLocalImages,
} from "./local-images";
import {
  createRenderWorkerImagesV2,
  PDF_RENDER_PROTOCOL_VERSION_V2,
  type RenderWorkerRequestV2,
} from "./worker-protocol-v2";

const DEFAULT_WORKER_TIMEOUT_MS = 15_000;
const MAX_WORKER_TIMEOUT_MS = 60_000;
const RENDER_DEBOUNCE_MS = 250;
const DOCUMENT_ERROR_CODES = new Set<DocumentErrorCode>([
  "ASSET_REJECTED",
  "INVALID_DATA",
  "LAYOUT_OVERFLOW",
  "LIMIT_EXCEEDED",
  "QR_TOO_DENSE",
  "RENDER_FAILED",
  "RENDER_TIMEOUT",
  "UNSUPPORTED_FORMAT",
  "UNSUPPORTED_GLYPH",
]);

export interface BrowserRenderCoordinatorOptions {
  localImageResolver?: LocalImageResolver;
  timeoutMs?: number;
}

export type CoordinatedTemplateRenderInput<TData extends JsonObject> =
  TemplateRenderInput<TData> & { revision: number };

export interface BrowserRenderCoordinatorSnapshot {
  readonly currentRevision: number | null;
  readonly lastValid: RenderResult | null;
  readonly preflightBlocked: boolean;
  readonly stale: boolean;
}

export interface BrowserRenderCoordinator {
  dispose(): void;
  getSnapshot(): BrowserRenderCoordinatorSnapshot;
  render<TData extends JsonObject>(
    template: RenderableTemplate<TData>,
    input: CoordinatedTemplateRenderInput<TData>,
  ): Promise<RenderResult>;
}

interface ParsedCoordinatorOptions {
  readonly localImageResolver?: LocalImageResolver;
  readonly timeoutMs: number;
}

type RenderJobOutcome =
  | { readonly error: unknown; readonly kind: "failure" }
  | { readonly kind: "success"; readonly result: RenderResult };

interface RenderJob<TData extends JsonObject = JsonObject> {
  cancelled: boolean;
  expectedFingerprint: string | undefined;
  readonly input: CoordinatedTemplateRenderInput<TData>;
  readonly jobId: number;
  readonly notBefore: number;
  phase: "preflight" | "queued" | "released" | "worker";
  readonly revision: number;
  reject(error: unknown): void;
  resolve(result: RenderResult): void;
  settled: boolean;
  readonly template: RenderableTemplate<TData>;
  timeout?: ReturnType<typeof setTimeout>;
  worker: Worker | undefined;
}

function coordinatorFailure(
  code: "INVALID_DATA" | "LIMIT_EXCEEDED" | "RENDER_FAILED" | "RENDER_TIMEOUT",
  message: string,
  path: readonly string[] = ["worker"],
): DocumentValidationError {
  return new DocumentValidationError([{ code, message, path }]);
}

function parseCoordinatorOptions(
  value: BrowserRenderCoordinatorOptions | undefined,
): ParsedCoordinatorOptions {
  if (value === undefined) {
    return {
      timeoutMs: DEFAULT_WORKER_TIMEOUT_MS,
    };
  }
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null)
  ) {
    throw coordinatorFailure(
      "INVALID_DATA",
      "Browser render coordinator options must be a plain object.",
      ["coordinatorOptions"],
    );
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (
      typeof key !== "string" ||
      !["localImageResolver", "timeoutMs"].includes(key) ||
      descriptors[key]?.get ||
      descriptors[key]?.set
    ) {
      throw coordinatorFailure(
        "INVALID_DATA",
        "Invalid browser render coordinator option.",
        ["coordinatorOptions", typeof key === "string" ? key : "symbol"],
      );
    }
  }
  const timeoutValue = descriptors.timeoutMs?.value as unknown;
  if (
    timeoutValue !== undefined &&
    (!Number.isSafeInteger(timeoutValue) ||
      (timeoutValue as number) < 1 ||
      (timeoutValue as number) > MAX_WORKER_TIMEOUT_MS)
  ) {
    throw coordinatorFailure(
      "INVALID_DATA",
      "timeoutMs must be an integer between 1 and 60000.",
      ["coordinatorOptions", "timeoutMs"],
    );
  }
  const resolverValue = descriptors.localImageResolver?.value as unknown;
  if (resolverValue !== undefined && typeof resolverValue !== "function") {
    throw coordinatorFailure(
      "INVALID_DATA",
      "localImageResolver must be a function.",
      ["coordinatorOptions", "localImageResolver"],
    );
  }
  return {
    ...(resolverValue === undefined
      ? {}
      : { localImageResolver: resolverValue as LocalImageResolver }),
    timeoutMs:
      (timeoutValue as number | undefined) ?? DEFAULT_WORKER_TIMEOUT_MS,
  };
}

function cloneResult(result: RenderResult): RenderResult {
  return {
    ...result,
    diagnostics: result.diagnostics.map((item) => ({
      ...item,
      ...(item.path ? { path: [...item.path] } : {}),
    })),
    finalDimensions: result.finalDimensions.map((item) => ({ ...item })),
    pdfBytes: new Uint8Array(result.pdfBytes),
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}

function isBoundedPath(value: unknown): value is readonly (number | string)[] {
  return (
    Array.isArray(value) &&
    value.length <= 32 &&
    value.every(
      (segment) =>
        (typeof segment === "string" && segment.length <= 120) ||
        (typeof segment === "number" && Number.isSafeInteger(segment)),
    )
  );
}

function parseWorkerResponse(
  value: unknown,
  job: RenderJob,
): RenderResult | DocumentValidationError {
  if (
    !isPlainRecord(value) ||
    value.protocolVersion !== PDF_RENDER_PROTOCOL_VERSION_V2 ||
    value.jobId !== job.jobId ||
    value.revision !== job.revision ||
    (value.type !== "result" && value.type !== "error")
  ) {
    return coordinatorFailure(
      "RENDER_FAILED",
      "The render worker returned an invalid response.",
    );
  }
  if (value.type === "error") {
    if (
      !hasExactKeys(value, [
        "issues",
        "jobId",
        "protocolVersion",
        "revision",
        "type",
      ]) ||
      !Array.isArray(value.issues) ||
      value.issues.length < 1 ||
      value.issues.length > 16 ||
      value.issues.some(
        (item) =>
          !isPlainRecord(item) ||
          !hasExactKeys(item, ["code", "message", "path"]) ||
          typeof item.code !== "string" ||
          !DOCUMENT_ERROR_CODES.has(item.code as DocumentErrorCode) ||
          typeof item.message !== "string" ||
          item.message.length > DOCUMENT_LIMITS.generalStringCharacters ||
          !isBoundedPath(item.path),
      )
    ) {
      return coordinatorFailure(
        "RENDER_FAILED",
        "The render worker returned an invalid error.",
      );
    }
    const issues: DocumentIssue[] = value.issues.map((item) => ({
      code: (item as { code: DocumentErrorCode }).code,
      message: "The render worker could not complete the document.",
      path: ["worker"],
    }));
    const [first, ...rest] = issues;
    return new DocumentValidationError(
      first
        ? [first, ...rest]
        : [
            {
              code: "RENDER_FAILED",
              message: "The render worker could not complete the document.",
              path: ["worker"],
            },
          ],
    );
  }
  if (
    !hasExactKeys(value, [
      "jobId",
      "pdfBytes",
      "protocolVersion",
      "result",
      "revision",
      "type",
    ]) ||
    !(value.pdfBytes instanceof ArrayBuffer) ||
    !isPlainRecord(value.result) ||
    !hasExactKeys(value.result, [
      "diagnostics",
      "finalDimensions",
      "fingerprint",
      "pageCount",
      "revision",
    ]) ||
    value.pdfBytes.byteLength < 1 ||
    value.pdfBytes.byteLength > DOCUMENT_LIMITS.finalPdfBytes ||
    value.result.revision !== job.revision ||
    !Number.isSafeInteger(value.result.pageCount) ||
    (value.result.pageCount as number) < 1 ||
    (value.result.pageCount as number) > DOCUMENT_LIMITS.pages ||
    !Array.isArray(value.result.finalDimensions) ||
    value.result.finalDimensions.length !== value.result.pageCount ||
    !Array.isArray(value.result.diagnostics) ||
    value.result.diagnostics.length > 100 ||
    value.result.diagnostics.some(
      (item) =>
        !isPlainRecord(item) ||
        !(
          hasExactKeys(item, ["code", "message"]) ||
          hasExactKeys(item, ["code", "message", "path"])
        ) ||
        typeof item.code !== "string" ||
        item.code.length > 120 ||
        typeof item.message !== "string" ||
        item.message.length > DOCUMENT_LIMITS.generalStringCharacters ||
        (item.path !== undefined && !isBoundedPath(item.path)),
    ) ||
    value.result.finalDimensions.some(
      (item) =>
        !isPlainRecord(item) ||
        !hasExactKeys(item, ["heightMm", "heightPt", "widthMm", "widthPt"]) ||
        Object.values(item).some(
          (dimension) =>
            typeof dimension !== "number" ||
            !Number.isFinite(dimension) ||
            dimension <= 0,
        ),
    ) ||
    typeof value.result.fingerprint !== "string" ||
    !/^sha256:[a-f0-9]{64}$/u.test(value.result.fingerprint) ||
    value.result.fingerprint !== job.expectedFingerprint
  ) {
    return coordinatorFailure(
      "RENDER_FAILED",
      "The render worker returned an invalid result.",
    );
  }
  return {
    diagnostics: value.result.diagnostics as RenderResult["diagnostics"],
    finalDimensions: value.result
      .finalDimensions as RenderResult["finalDimensions"],
    fingerprint: value.result.fingerprint,
    pageCount: value.result.pageCount as number,
    pdfBytes: new Uint8Array(value.pdfBytes).slice(),
    revision: value.result.revision as number,
  };
}

export function createBrowserRenderCoordinator(
  options?: BrowserRenderCoordinatorOptions,
): BrowserRenderCoordinator {
  const parsedOptions = parseCoordinatorOptions(options);
  let active: RenderJob | undefined;
  let pending: RenderJob | undefined;
  let currentRevision: number | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let jobSequence = 0;
  let lastValid: RenderResult | null = null;
  let preflightBlocked = false;

  const pump = () => {
    if (active || !pending || disposed) return;
    const remainingDebounce = pending.notBefore - Date.now();
    if (remainingDebounce > 0) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = undefined;
        pump();
      }, remainingDebounce);
      return;
    }
    active = pending;
    pending = undefined;
    const job = active;
    job.phase = "preflight";
    void execute(job);
  };

  const settle = (job: RenderJob, outcome: RenderJobOutcome) => {
    if (job.settled) return;
    job.settled = true;
    if (job.timeout) clearTimeout(job.timeout);
    if (outcome.kind === "success") {
      const { result } = outcome;
      if (currentRevision === result.revision && job.jobId === jobSequence) {
        lastValid = cloneResult(result);
      }
      job.resolve(result);
    } else {
      job.cancelled = true;
      job.reject(outcome.error);
    }
  };

  const release = (job: RenderJob) => {
    if (job.phase === "released") return;
    const releasedPreflight = job.phase === "preflight";
    job.phase = "released";
    job.worker?.terminate();
    job.worker = undefined;
    if (active === job) active = undefined;
    if (releasedPreflight) preflightBlocked = false;
    queueMicrotask(pump);
  };

  const finish = (job: RenderJob, outcome: RenderJobOutcome) => {
    settle(job, outcome);
    release(job);
  };

  const execute = async (job: RenderJob) => {
    let preparedImages: PreparedLocalImages = [];
    try {
      const trustedTemplate = getRenderableTemplate(job.template.id);
      if (trustedTemplate !== job.template) {
        throw coordinatorFailure(
          "INVALID_DATA",
          "The interactive worker accepts only a statically installed template.",
          ["template", "id"],
        );
      }
      const { normalized, themeWasExplicit } =
        await normalizeTemplateInputForRender(
          job.template,
          job.input,
          async ({ imageIds, resolvedTheme }) => {
            if (imageIds.length > 0 && !parsedOptions.localImageResolver) {
              throw coordinatorFailure(
                "INVALID_DATA",
                "A local image resolver is required.",
                ["runtimeOptions", "localImageResolver"],
              );
            }
            if (imageIds.length > 0 && parsedOptions.localImageResolver) {
              preparedImages = await preflightLocalImages(
                imageIds,
                parsedOptions.localImageResolver,
              );
            }
            return {
              fontManifestIdentity: await createFontManifestIdentity(
                resolvedTheme.theme,
              ),
              localImageDescriptors: preparedImages.map(
                ({ descriptor }) => descriptor,
              ),
            };
          },
        );
      if (job.cancelled || job.jobId !== jobSequence) {
        preparedImages = [];
        release(job);
        return;
      }
      job.expectedFingerprint =
        await fingerprintNormalizedTemplateInput(normalized);
      if (job.cancelled || job.jobId !== jobSequence) {
        preparedImages = [];
        release(job);
        return;
      }
      const worker = new Worker(
        new URL("./render.worker.browser.ts", import.meta.url),
        { name: `docn-render-${job.jobId}`, type: "module" },
      );
      job.worker = worker;
      job.phase = "worker";
      const onFailure = () =>
        finish(job, {
          error: coordinatorFailure(
            "RENDER_FAILED",
            "The render worker terminated unexpectedly.",
          ),
          kind: "failure",
        });
      worker.addEventListener("error", onFailure, { once: true });
      worker.addEventListener("messageerror", onFailure, { once: true });
      worker.addEventListener("message", (event: MessageEvent<unknown>) => {
        if (
          job.cancelled ||
          job.jobId !== jobSequence ||
          currentRevision !== job.revision
        ) {
          return;
        }
        const response = parseWorkerResponse(event.data, job);
        finish(
          job,
          response instanceof DocumentValidationError
            ? { error: response, kind: "failure" }
            : { kind: "success", result: response },
        );
      });
      const request: RenderWorkerRequestV2 = {
        jobId: job.jobId,
        protocolVersion: PDF_RENDER_PROTOCOL_VERSION_V2,
        request: normalized as NormalizedTemplateInput<JsonObject>,
        themeWasExplicit,
        type: "render",
      };
      const imageTransfer = createRenderWorkerImagesV2(
        job.jobId,
        normalized.revision,
        preparedImages,
      );
      worker.postMessage(request);
      worker.postMessage(imageTransfer.message, [...imageTransfer.transfer]);
      preparedImages = [];
    } catch (error) {
      preparedImages = [];
      finish(job, { error, kind: "failure" });
    }
  };

  const cancel = (
    job: RenderJob | undefined,
    reason: string,
    code: "RENDER_FAILED" | "RENDER_TIMEOUT" = "RENDER_FAILED",
  ) => {
    if (!job || job.settled) return;
    job.cancelled = true;
    settle(job, {
      error: coordinatorFailure(code, reason),
      kind: "failure",
    });
    if (job.phase === "preflight") {
      preflightBlocked = true;
    } else {
      release(job);
    }
  };

  const expire = (job: RenderJob) => {
    if (pending === job) pending = undefined;
    cancel(
      job,
      "The render request exceeded its enqueue deadline.",
      "RENDER_TIMEOUT",
    );
  };

  const interruptForNavigation = () => {
    jobSequence += 1;
    cancel(active, "The render worker was interrupted by navigation.");
    cancel(pending, "The pending render was interrupted by navigation.");
    pending = undefined;
  };
  globalThis.addEventListener("pagehide", interruptForNavigation);

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      globalThis.removeEventListener("pagehide", interruptForNavigation);
      if (debounceTimer) clearTimeout(debounceTimer);
      jobSequence += 1;
      cancel(active, "The render coordinator was disposed.");
      cancel(pending, "The pending render was disposed.");
      pending = undefined;
    },
    getSnapshot() {
      return Object.freeze({
        currentRevision,
        lastValid: lastValid ? cloneResult(lastValid) : null,
        preflightBlocked,
        stale: lastValid !== null && lastValid.revision !== currentRevision,
      });
    },
    render<TData extends JsonObject>(
      template: RenderableTemplate<TData>,
      input: CoordinatedTemplateRenderInput<TData>,
    ) {
      if (disposed) {
        return Promise.reject(
          coordinatorFailure(
            "RENDER_FAILED",
            "The render coordinator is disposed.",
          ),
        );
      }
      if (preflightBlocked) {
        return Promise.reject(
          coordinatorFailure(
            "RENDER_TIMEOUT",
            "The render coordinator is waiting for a timed-out preflight to settle.",
            ["coordinator", "preflight"],
          ),
        );
      }
      const revisionDescriptor = Object.getOwnPropertyDescriptor(
        input,
        "revision",
      );
      const requestedRevision = revisionDescriptor?.value as unknown;
      if (
        !revisionDescriptor ||
        revisionDescriptor.get ||
        revisionDescriptor.set ||
        !Number.isSafeInteger(requestedRevision) ||
        (requestedRevision as number) < 1 ||
        (currentRevision !== null &&
          (requestedRevision as number) <= currentRevision)
      ) {
        return Promise.reject(
          coordinatorFailure(
            "INVALID_DATA",
            "Coordinator revisions must increase monotonically.",
            ["revision"],
          ),
        );
      }
      currentRevision = requestedRevision as number;
      jobSequence += 1;
      const jobId = jobSequence;
      return new Promise<RenderResult>((resolve, reject) => {
        const job: RenderJob<TData> = {
          cancelled: false,
          expectedFingerprint: undefined,
          input,
          jobId,
          notBefore: Date.now() + RENDER_DEBOUNCE_MS,
          phase: "queued",
          reject,
          revision: requestedRevision as number,
          resolve,
          settled: false,
          template,
          worker: undefined,
        };
        job.timeout = setTimeout(
          () => expire(job as unknown as RenderJob),
          parsedOptions.timeoutMs,
        );
        if (pending) {
          cancel(pending, "The pending render was superseded.");
        }
        pending = job as unknown as RenderJob;
        if (active) {
          cancel(active, "The active render was superseded.");
        }
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = undefined;
        }
        pump();
      });
    },
  };
}
