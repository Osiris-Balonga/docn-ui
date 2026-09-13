# PDF document contracts

Normative contract for the released V1 model and the additive post-V1 API. The
L17 signatures below are implementation requirements, not claims that S01
already added runtime code.

## 1. Identity, formats, and themes

The released `TemplateDefinition` is a non-generic catalog/generator record. It describes display metadata, capabilities, supported IDs, and `renderSample`; it does not own a Zod schema, render data, defaults, or a general composition function. Its serializable catalog projection remains separate from React. The post-V1 `TemplateDescriptor<TData>` and `RenderableTemplate<TData>` contracts defined in section 8 are additive and distinct.

`RenderRequest` contains `protocolVersion: 1`, `revision`, `templateId`, `templateVersion`, `data`, `formatId`, permitted format options, `themeId`, bounded overrides, `locale`, `printProfile`, and permitted assets. Incompatibility produces a structured error, never silent conversion.

`RenderResult` contains `revision`, `pdfBytes`, `pageCount`, final dimensions, diagnostics, and a fingerprint of normalized inputs. The fingerprint never leaves memory and is not used as telemetry.

A fixed format declares width/height in mm; a continuous format declares width and maximum height. Orientation transforms dimensions exactly once. Canonical conversion: `pt = mm * 72 / 25.4`, rounding only for display. Size assertion tolerance: 0.1 pt.

A theme contains engine-compatible RGB/hex colors, permitted font families, point sizes, spacing, and rules. Do not send CSS variables, OKLCH, or Tailwind classes to the engine. The three themes `neutral`, `editorial`, and `bold` share the same roles; structural adaptations stay in templates.

## 2. Formats and print profiles

- Trim size: final physical size, excluding bleed.
- Bleed: background extension around the trim, configurable from the allowed list.
- Safe area: inner inset for text and QR; no essential information in the bleed.
- Crop marks: optional graphics outside the trim with a dedicated outer margin; they must not cross content.

V1 provides `screen` (trim size, no marks) and `print` (explicit bleed/margins). Test example: 85×55 mm trim + 3 mm bleed gives 91×61 mm without marks; enabling marks adds an outer margin on both sides. Define every box in PDF coordinates, converting the layout's top-left origin to the PDF boxes' bottom-left origin.

L02 verifies MediaBox/TrimBox/BleedBox support. If the engine does not expose required boxes, use isolated, qualified post-processing or remove the affected option until an explicit decision. Preview and download always use the final post-processed result. No CMYK, ICC profile, or PDF/X claim.

Front/back means two equally sized pages in front/back order, not universal duplex imposition. Flip instructions depend on the printer; check a test sheet and never mirror text. Label sheets are separate documents from individual label formats.

## 3. Data schemas

Strict schemas without unknown keys; errors by field path. Normalize strings without removing accents. ISO date inputs, explicit locale, invoice dates without implicit time-zone conversion. Events use separate instants and IANA time zones. Reproducible examples use fixed dates.

### Business card

`name`, `role?`, `organization?`, `email?`, `phone?`, `website?`, `address?`, `logoAssetId?`, `qrPayload?`. At least one contact detail. Long names wrap, then error if overflowing; never shrink below the template minimum.

### Ticket

`eventName`, `startsAt`, `timeZone`, `venue`, `attendeeName?`, `ticketId`, `category?`, `seat?`, `qrPayload`. The QR encodes exactly the validated string; it provides no cryptographic signature, uniqueness, or access control. A detachable area is a graphic marker, not physical cutting.

### Receipt and invoice

Use a shared monetary line-item core: identifier, label, V1 integer quantity, integer minor-unit price, tax rate in basis points. One currency per document, with a known exponent (examples: XAF, EUR, USD), a bound below `Number.MAX_SAFE_INTEGER`, and overflow checks.

V1 policy: prices exclude tax; line subtotal = quantity × price; line tax rounds to the minor unit with an explicit half-up policy; total = sum of lines and rounded taxes. No binary floating-point amounts, discounts/compound taxes, credit notes, or fractional quantities in V1. Inform users that this policy may require adaptation to tax rules.

Invoice: seller, customer, number, dates, currency, lines, notes, terms, and bounded free-text legal fields. Receipt: merchant, number, instant/time zone, lines, currency, and textual payment method; never a full card number.

### Label

`title`, `subtitle?`, `reference?`, `lines[]`, `qrPayload?`, `logoAssetId?`. A list of labels may populate a sheet. Sheet geometry is independent of data.

## 4. Initial limits to implement

| Input / resource      | V1 limit                                               |
| --------------------- | ------------------------------------------------------ |
| Data JSON             | 256 KiB UTF-8; maximum depth 8                         |
| General string        | 2,000 characters, stricter per-field limits            |
| Short name/title      | 120 characters, visual capacity checked separately     |
| QR payload            | 512 UTF-8 bytes; reject density incompatible with size |
| User images           | PNG/JPEG only; 2 images, 5 MiB each, 16 Mpx each       |
| Invoice/receipt lines | 200; receipts also bounded by final height             |
| Labels per export     | 100                                                    |
| Custom trim size      | 20–420 mm per fixed side, within template limits       |
| Continuous receipt    | 58/80 mm width, maximum height 2,000 mm                |
| Pages                 | Maximum 50                                             |
| Final PDF             | Maximum 20 MiB                                         |
| Generation            | 15 s timeout; terminate worker, then explicit recovery |

These are initial product budgets. Changes require justification and tests; never automatically cut content to satisfy a limit.

Validate image headers, decoding, and dimensions; extensions/declared MIME types alone are insufficient. Normalize EXIF orientation and strip metadata during local re-encoding. Reject imported SVG/HTML/PDF and user URLs (no server means no remote SSRF, but client-side exfiltration must still be prevented). Textual HTTP(S)/mailto/tel links are not image sources and are validated separately.

## 5. Layout and overflow

Required primitives: DocumentFrame, PageFrame, Text/Heading, Stack/Row, Separator, Image, QRCode, FieldPair, Table/Row/Cell, KeepTogether, PageNumber. Avoid universal components with dozens of flags.

Fixed frames reject unresolved overflow; flow documents paginate. Do not wrap an entire invoice in `wrap={false}`. Repeated headers must not overlap content; keep totals/signatures together where possible and detect trailing blank pages. A table row taller than the available area must be split by a defined rule or rejected with an explanation.

Character limits do not prove that fixed frames cannot overflow. Test with the actual font and provide geometric preflight based on text measurement and output inspection. Adversarial fixtures include wide characters, URLs without spaces, and multiple lines.

L02 qualifies automatic receipt height. If it fails in the selected version, deterministic premeasurement using the same font/layout is required; never estimate height from character count. Exceeding 2,000 mm returns an error, not a truncated receipt.

## 6. Fonts, QR, and assets

Compatible static TTF/WOFF PDF fonts, explicitly registered weights, verified French/English accents. Do not blindly reuse the site's WOFF2/variable fonts. Proposed base: static Noto Sans and Noto Serif with verified licenses, limited to used weights. No font downloads from a CDN during rendering.

Vector QR, light background, dark modules, quiet zone of at least four modules; verify by decoding a rasterization of the final PDF. Do not promise that an arbitrarily long QR fits a small card; reject with an actionable message.

`AssetResolver` resolves manifest IDs to same-origin buffers/URLs in the browser and verified absolute paths in Node. No arbitrary file reads from `data`. Inventory hashes and licenses for every distributable asset.

## 7. Errors and revisions

Stable codes: `INVALID_DATA`, `UNSUPPORTED_FORMAT`, `UNSUPPORTED_GLYPH`, `ASSET_REJECTED`, `LAYOUT_OVERFLOW`, `QR_TOO_DENSE`, `LIMIT_EXCEEDED`, `RENDER_TIMEOUT`, `RENDER_FAILED`. Diagnostics contain no personal data; stacks are development-only.

A revision identifies data, format, theme, locale, images, and print profile. Any such change invalidates the previous download. The last valid result may remain visible as "previous preview". After correction, clear the error and resume generation; results from older requests must never replace the latest.

## 8. Post-V1 unified template input

L17 adds a template-oriented input without changing the released protocol-1
surface. The public quick-render call remains flat:

```ts
type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
type JsonObject = { readonly [key: string]: JsonValue };

export const TEMPLATE_IDS = [
  "resume-classic",
  "resume-accountant",
  "resume-designer",
  "invoice-spacious",
  "invoice-vertical",
  "invoice-corporate",
  "invoice-photo-header",
  "receipt-order-confirmation",
  "receipt-product-barcode",
  "receipt-cash-register",
  "report-product-analytics",
  "report-marketplace-revenue",
  "report-customer-support",
  "badge-profile-lanyard",
  "badge-qr-portrait-light",
  "badge-qr-portrait-blue",
  "business-card-coral-qr",
  "business-card-violet-founder",
] as const;

type TemplateId = (typeof TEMPLATE_IDS)[number];

function assertTemplateIdSet(
  ids: readonly string[],
): asserts ids is readonly TemplateId[];

interface TemplateRenderInput<TData extends JsonObject> {
  data: TData;
  theme?: ThemeInput;
  format?: FormatInput;
  locale?: DocumentLocale;
  printProfile?: PrintProfile;
  revision?: number;
}

renderPdf<TData extends JsonObject>(
  template: RenderableTemplate<TData>,
  input: TemplateRenderInput<TData>,
  runtimeOptions?,
): Promise<RenderResult>
```

There is no nested `options` property in the second argument. `RenderResult`
retains exactly `pdfBytes`, `finalDimensions`, `pageCount`, `diagnostics`,
`fingerprint`, and `revision`. Each platform entry point defines its own
runtime-options type without importing the other platform.

The caller or render coordinator owns a supplied positive, monotonically
increasing `revision`; the facade copies it without incrementing it. A one-shot
call may omit the field and receives revision 1. A worker drops obsolete
completions and the UI derives stale state by comparing revisions. `stale` is
not a `RenderResult` field.

`TEMPLATE_IDS` lives in the non-React template-contract module and is the
canonical V1 identity inventory. Legacy `TemplateDefinition.id`, new descriptor
IDs, static worker loaders, and catalog generation use `TemplateId`. In S02, a
shared `assertTemplateIdSet(ids: readonly string[])` rejects duplicates, missing
IDs, and extras in `templateDefinitions` and the generated catalog. The partial
L17 adapter/loader maps are checked for unique `TemplateId` membership; L20
applies the exact-set assertion once all 18 renderable descriptors exist. This
is a check against the canonical tuple, not another maintained list.

`data` is always required. Neither `defaultData` nor `exampleData` is substituted
for it, shallow-merged into it, or applied by `renderPdf`; those two descriptor
fixtures exist only for explicit form initialization and demonstrations.

### 8.1 Format selection

The final public selection type is discriminated so invalid combinations are
not representable:

```ts
type PresetFormatId = Exclude<FormatId, "label-custom">;

type FormatInput =
  | PresetFormatId
  | {
      id: "label-custom";
      widthMm: number;
      heightMm: number;
      orientation?: Orientation;
    };
```

A string never carries dimensions. This includes continuous `receipt-58` and
`receipt-80`; passing dimensions or orientation for either is invalid. The
`label-custom` identifier is not accepted as a string because its width and
height are required. Width and height are validated against the existing custom
format ranges before orientation is applied exactly once, matching
`resolveFormat`. Templates declare `defaultFormatId`, which must occur in their
`supportedFormatIds`; an omitted `format` resolves that default.

### 8.2 Preset, advanced, and quick-render themes

The released `ThemeId`, `PdfTheme`, `themes`, `getPdfTheme`, and existing
`createPdfTheme(themeId, overrides)` call remain source compatible. Advanced
primitive/plan users may continue to use the legacy overload, including its
spacing and type-scale overrides. That advanced capability is not silently
accepted by the geometry-safe quick-render path.

L17 adds the complete validated subtype and an additive overload:

```ts
type CustomPdfTheme = PdfTheme & {
  readonly baseThemeId: ThemeId;
};

interface CustomPdfThemeOptions {
  baseThemeId: ThemeId;
  colors?: Partial<PdfTheme["colors"]>;
  fonts?: Partial<Pick<PdfTheme["fonts"], "body" | "heading">>;
}

function createPdfTheme(
  themeId: ThemeId,
  overrides?: PdfThemeOverrides,
): PdfTheme; // unchanged legacy overload

function createPdfTheme(options: CustomPdfThemeOptions): CustomPdfTheme;

type ThemeInput =
  ThemeId | (PdfTheme & { readonly baseThemeId?: never }) | CustomPdfTheme;
```

The object overload is the Theme Studio and safe custom-theme syntax. It
resolves the complete base preset, sets `id` to the base ID, attaches
`baseThemeId`, validates, deep-clones, and deep-freezes the result. A
`CustomPdfTheme` is valid only when `id === baseThemeId`. Its weights,
`typeScale`, and `spacing` must be structurally identical to
`themes[baseThemeId]`.

The quick-render `ThemeInput` accepts a `ThemeId`, a structurally exact preset
`PdfTheme`, or a `CustomPdfTheme`. A bare `PdfTheme` object without
`baseThemeId` is accepted only when it is deeply equal to `themes[input.id]`;
object identity is never used because worker serialization loses it. A modified
`PdfTheme` such as `getPdfTheme(id, accent)` is rejected unless represented by a
valid `CustomPdfTheme`. Existing advanced callers remain unaffected.

The initial shared compatibility envelope permits changes to validated color
roles only. Font-family changes are rejected by default even between Noto Sans
and Noto Serif: changing metrics is not globally geometry-safe. A template may
opt in per body/heading role and per manifest-qualified family only after its
overflow and page-count evidence is recorded. Font weights, type scale, and
spacing cannot opt in during L17–L22. Resolution checks `baseThemeId` against
the template's `supportedThemeIds` before checking this narrower envelope.

### 8.3 Descriptor before renderable composition

S02 introduces the minimal non-React contract needed by pure normalization;
S03 extends it with composition behavior. The canonical family union for this
new API is exactly:

```ts
type TemplateFamily =
  "badge" | "business-card" | "invoice" | "receipt" | "report" | "resume";

type QualifiedPdfFontFamily = PdfTheme["fonts"]["body"];

interface TemplateDescriptor<TData extends JsonObject> {
  id: TemplateId;
  version: string;
  schemaVersion: number;
  family: TemplateFamily;
  schema: z.ZodType<TData, z.ZodTypeDef, unknown>;
  defaultData: TData;
  exampleData: TData;
  supportedFormatIds: readonly FormatId[];
  defaultFormatId: PresetFormatId;
  supportedThemeIds: readonly ThemeId[];
  defaultThemeId: ThemeId;
  supportedLocales: readonly DocumentLocale[];
  defaultLocale: DocumentLocale;
  supportedPrintProfileKinds: readonly PrintProfile["kind"][];
  defaultPrintProfile: PrintProfile;
  themeCompatibility: {
    bodyFontFamilies?: readonly QualifiedPdfFontFamily[];
    headingFontFamilies?: readonly QualifiedPdfFontFamily[];
  };
  extractLocalImageIds(data: TData): readonly LocalImageId[];
}
```

`TData` is constrained as `TData extends JsonObject`. The schema must be strict.
Registration and normalization use one non-reentrant pipeline for caller data,
`defaultData`, and `exampleData`: inspect the raw value as JSON, call
`schema.parse` exactly once with the inspected value, then inspect the schema
output as JSON. The final inspected schema output is the normalized data; it is
not parsed again. This preserves size/depth limits, finite JSON numbers,
JSON-only prototypes and NFC normalization without applying schema transforms
twice. Any raw or output inspection issue rejects the value before composition.
Raw/output inspection issues keep `INVALID_DATA` or `LIMIT_EXCEEDED`; schema
issues use `INVALID_DATA`. Paths are rooted at `data`, `defaultData`, or
`exampleData` and append the original inspection/Zod path without flattening it.

`defaultData` is only an explicit form initializer and `exampleData` is only a
demonstration fixture; neither is a render fallback. Image IDs are extracted
from the final inspected schema output, canonicalized, deduplicated,
limited to the existing maximum of two, and sorted by ID. `supportedFormatIds`,
`supportedThemeIds`, locale defaults, family, and print-profile declarations
are checked as descriptor invariants. `defaultPrintProfile.kind` must occur in
`supportedPrintProfileKinds`. The continuous feasibility descriptor supports
only `screen` in L17; any requested `print` profile is rejected before plan
creation rather than ignored or rewritten.

The released core `TemplateMetadata` union remains unchanged, including its
historical label/ticket values. The new six-family `TemplateFamily` does not
silently widen or rewrite that interface. The React-oriented legacy
`TemplateDefinition` used by the catalog generator also remains a distinct
type; it is neither renamed nor treated as `RenderableTemplate`.

### 8.4 Local-image preflight and normalized descriptors

Template data contains local image IDs only. The platform-only resolver is
asynchronous and returns bytes plus an untrusted declared MIME type, never a
URL, path, `File`, or worker object:

```ts
declare const localImageIdBrand: unique symbol;

type LocalImageId = string & {
  readonly [localImageIdBrand]: "LocalImageId";
};

function parseLocalImageId(
  value: unknown,
  path?: readonly (number | string)[],
): LocalImageId;

type LocalImageMimeType = "image/png" | "image/jpeg";

interface LocalImageSource {
  bytes: Uint8Array;
  declaredMimeType: LocalImageMimeType;
}

type LocalImageResolver = (id: LocalImageId) => Promise<LocalImageSource>;

interface LocalImageDescriptor {
  id: LocalImageId;
  mimeType: LocalImageMimeType;
  byteLength: number;
  widthPx: number;
  heightPx: number;
  sha256: `sha256:${string}`;
}

interface PreparedLocalImage {
  bytes: Uint8Array;
  descriptor: LocalImageDescriptor;
}

type PreparedLocalImages = readonly PreparedLocalImage[];

function preflightLocalImages(
  imageIds: readonly LocalImageId[],
  resolver: LocalImageResolver,
): Promise<PreparedLocalImages>;

interface ResolvedLocalImage {
  id: LocalImageId;
  resolvedSource: string;
}

type ResolvedLocalImageLookup = ReadonlyMap<LocalImageId, ResolvedLocalImage>;

interface LocalImageRenderScope {
  lookup: ResolvedLocalImageLookup;
  dispose(): void;
}

function createLocalImageRenderScope(
  images: PreparedLocalImages,
  platform: "browser" | "node",
): Promise<LocalImageRenderScope>;
```

`parseLocalImageId` NFC-normalizes and accepts only 1–120 lowercase kebab-case
ASCII characters (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Invalid identifiers produce
`INVALID_DATA` at the supplied data path. Schema fields that identify local
images use this parser, so extraction never brands an unchecked string.

An async shared preflight calls the resolver and immediately copies its
`Uint8Array` into a private owned buffer before any decode or digest operation.
It never retains or trusts the resolver's view. It sniffs and decodes the owned
bytes, checks that the claimed MIME matches the content, enforces
byte/pixel/count limits, normalizes supported image orientation
deterministically, and recomputes SHA-256 from the final owned bytes. It returns
logically immutable prepared bytes plus a pure JSON descriptor. The descriptor
set must match the canonical extracted IDs exactly; missing and extra
descriptors are errors.

PNG structural validation covers every chunk CRC and aborts zlib inflation as
soon as output exceeds the exact non-interlaced or Adam7 raster budget declared
by IHDR. Resolver results are strict plain data objects snapshotted once under a
structured error boundary; accessors and abnormal proxies are rejected.

PNG inputs and JPEG inputs with a non-identity EXIF orientation are emitted as
deterministic metadata-free PNGs. An identity-oriented JPEG is fully decoded
for pixel validation, then retains its compressed scan while EXIF, ancillary
APP metadata, and comments are stripped; APP0 and APP14 decoder-control
segments are retained. The scan-aware parser removes metadata between scans,
requires a terminal EOI, and rejects trailing bytes. The final normalized
representation, not just the resolver input, must remain within the five-MiB
limit.

`PreparedLocalImages` is sorted by descriptor ID and contains one logically
immutable entry per canonical ID. Immutability means no external alias to its
owned bytes is exposed or reused; `readonly` alone is not treated as protection
for a mutable typed array. The coordinator passes only its descriptor
projection to normalization. L18 creates another private copy for each
transferable `ArrayBuffer`, so transfer/detachment cannot mutate the preflight
copy. The resolver and declared MIME value are not serialized into normalized
input or protocol messages.

The rendering runtime owns `createLocalImageRenderScope`. It converts prepared
bytes to engine-consumable sources and gives `TemplatePlanContext` only the
`ResolvedLocalImageLookup`. Browser sources are bounded object URLs; Node
sources are bounded engine-supported data sources. The coordinator creates one
scope per render; `dispose` is idempotent and is called in `finally` on success, validation/render
failure, cancellation, supersession, timeout, or worker termination. Templates
only look up `resolvedSource` by validated ID and never create, cache, transfer,
or revoke a source themselves.

The pure S02 normalizer receives descriptors, not the resolver or bytes. Its
normalized input contains the descriptors in stable ID order and fingerprints
their complete values, including `sha256`. Binary bytes are kept in a separate
prepared payload and L18 transfers each `ArrayBuffer` separately. Any temporary
worker-side object URL is revoked after render, cancellation, failure, or
worker disposal. Neither `core` nor the normalized JSON depends on the assets
or themes implementation modules; the non-React template-contract layer
orchestrates those dependencies above `core`.

### 8.5 Normalization and fingerprints

S02 adds these library contracts, not worker protocol messages:

```ts
interface FontManifestIdentity {
  assetIds: readonly string[];
  schemaVersion: number;
  sha256: `sha256:${string}`;
}

interface NormalizationContext {
  fontManifestIdentity: FontManifestIdentity;
  localImageDescriptors: readonly LocalImageDescriptor[];
}

type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

interface ResolvedTemplateTheme {
  baseThemeId: ThemeId;
  theme: DeepReadonly<PdfTheme>;
}

interface NormalizedTemplateInput<TData extends JsonObject> {
  data: TData;
  fontManifestIdentity: FontManifestIdentity;
  format: ResolvedFormat;
  localImageDescriptors: readonly LocalImageDescriptor[];
  locale: DocumentLocale;
  printProfile: PrintProfile;
  revision: number;
  templateId: TemplateId;
  templateVersion: string;
  schemaVersion: number;
  theme: ResolvedTemplateTheme;
}

function normalizeTemplateInput<TData extends JsonObject>(
  template: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
  context: NormalizationContext,
): NormalizedTemplateInput<TData>;

function fingerprintNormalizedTemplateInput<TData extends JsonObject>(
  input: NormalizedTemplateInput<TData>,
): Promise<`sha256:${string}`>;
```

`FontManifestIdentity.assetIds` is the sorted set of qualified font assets used
by the resolved theme. Its `sha256` is recomputed from the canonical projection
of those manifest entries, including family, weight, format, byte count, and
asset digest; it is not a caller label. Normalization is pure once the validated
image descriptors and font-manifest identity are supplied. It validates data,
descriptor invariants, defaults, format, locale, print profile, theme
base/envelope, and revision; then it deep-clones and deep-freezes the resolved
theme, manifest identity, and image descriptors before fingerprinting.

The normalized fingerprint covers template ID/version/schema version,
normalized data, resolved format, complete frozen theme and base ID, locale,
print profile, revision, qualified font-manifest identity, and sorted local
image descriptors/digests. Raw image bytes are excluded because their
recomputed digests represent them.

The released `PDF_RENDER_PROTOCOL_VERSION = 1`, `RenderRequest`,
`validateRenderRequest`, and `fingerprintRenderRequest` stay unchanged in L17.
No protocol-1 field is repurposed for a complete theme or descriptors.
`RenderRequestV2`, serialization, and the interruptible worker protocol belong
to L18 only.

### 8.6 Renderable templates and plan kinds

S03 adds the React/plan extension:

```ts
interface LegacyTemplateStyleProjection {
  colors?: Partial<DeepReadonly<PdfTheme["colors"]>>;
  fontFamilies?: {
    body?: QualifiedPdfFontFamily;
    heading?: QualifiedPdfFontFamily;
  };
}

interface TemplatePlanContext<TData extends JsonObject> {
  data: TData;
  format: ResolvedFormat;
  legacyStyle?: LegacyTemplateStyleProjection;
  localImages: ResolvedLocalImageLookup;
  locale: DocumentLocale;
  printProfile: PrintProfile;
  resolvedTheme: ResolvedTemplateTheme;
}

type TemplateRenderPlan =
  | { kind: "fixed"; plan: FixedDocumentRenderPlan }
  | { kind: "flow"; plan: FixedDocumentRenderPlan }
  | { kind: "continuous"; plan: ContinuousDocumentRenderPlan };

interface RenderableTemplate<
  TData extends JsonObject,
> extends TemplateDescriptor<TData> {
  createPlan(context: TemplatePlanContext<TData>): TemplateRenderPlan;
}
```

The discriminant describes composition behavior. It wraps the existing
`FixedDocumentRenderPlan` and `ContinuousDocumentRenderPlan` without renaming
or weakening either advanced API. Flow uses a `FixedDocumentRenderPlan` whose
document is the existing wrapping `DocumentFrame` composition; it is distinct
from a non-wrapping fixed composition at the template level.

`resolvedTheme` is the deep-frozen, fingerprinted full theme used by public
theme-aware components. Because its weights, type scale, and spacing equal the
base preset, new compositions preserve the qualified geometry. `legacyStyle`
is optional and differential. When the caller omits `theme`, it is `undefined`,
so an adapter does not modify the source-owned composition or palette. When a
theme is explicit, the coordinator compares it with the descriptor's default
resolved theme and includes only requested color roles whose values differ plus
requested, differing body/heading families allowed by that template's
compatibility envelope. An empty difference is normalized to `undefined`.

A legacy adapter may merge only this projection into its source-owned legacy
`style` prop. It must not replace the complete palette from `resolvedTheme` or
translate weights, type scale, spacing, page geometry, or any other theme field.
An absent `fontFamilies` entry means no legacy family override.

L17 evidence uses one additive fixed-template adapter, the existing
`ComponentDocument`/`DocumentFrame` flow specimen, and the continuous
feasibility fixture. It does not adapt a catalog receipt or claim that one is
already continuous. Measured migration and versioning of all three catalog
receipts remains L20 work.

In the browser, `RenderableTemplate`, its Zod schema, `createPlan`,
`runtimeOptions`, and the local-image resolver stay on the coordinating side
and never cross `postMessage`. The worker receives protocol-V2 serializable
input and transferred image buffers in L18, resolves the template through a
static trusted ID-to-loader map, and rejects unknown IDs. No dynamic import path
comes from user data.

### 8.7 Platform runtime options

L18 implements these runtime-only options at the corresponding entry point:

```ts
interface NodeRenderRuntimeOptions {
  fontAssetDirectory?: string;
  localImageResolver?: LocalImageResolver;
}

interface BrowserRenderRuntimeOptions {
  fontAssetBaseUrl?: string | URL;
  localImageResolver?: LocalImageResolver;
}
```

The Node default is the module-relative `../../assets/` directory already used
by `createNodeAssetResolver`; installed registry source therefore resolves the
consumer's root `assets/` directory. An explicit `fontAssetDirectory` is
resolved to an absolute directory and remains subject to manifest containment
and digest checks. The Node facade snapshots each verified font into an
immutable data source before plan dispatch, so the facade-owned registration
does not reopen its configured path. If React PDF's process-global font store
already contains exact family, weight, and style registrations, the facade
asynchronously verifies every source before dispatch. Canonical WOFF data URIs
and local paths contained by the configured asset directory may coexist only
when their current size and SHA-256 match the same manifest entry; remote,
unknown, and mismatched sources are rejected. The facade retains its
digest-bound registration without clearing unrelated user fonts. An equivalent
earlier local source may remain React PDF's first match; mutation of that file
or the process-global registry after the verified read is outside the supported
process-local render boundary. The browser default is
`globalThis.location.origin`; an
explicit `fontAssetBaseUrl` must resolve to that same origin, and manifest
public paths remain rooted below it. No remote font fallback is permitted.

`localImageResolver` is optional only when validated data extracts no image
IDs. It is consumed by `preflightLocalImages` on the coordinating side and is
never stored in normalized input. Neither runtime-options interface, resolver,
Zod schema, template object, plan factory, `URL`, nor any other function or
platform object is a protocol field. Protocol V2 contains only JSON values,
validated descriptors, and separately transferred `ArrayBuffer`s.
