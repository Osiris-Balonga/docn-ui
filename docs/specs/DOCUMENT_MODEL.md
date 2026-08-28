# PDF document contracts

Normative contract for L02–L11. Signatures express intentions to type and test, not an existing API.

## 1. Identity, formats, and themes

`TemplateDefinition<T>` describes `id`, `version`, `schemaVersion`, `family`, metadata, `supportedFormatIds`, `supportedThemeIds`, `schema`, `defaultData`, fixtures, and a composition function. Serializable metadata lives in a module separate from the React function and Zod.

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

| Input / resource | V1 limit |
| --- | --- |
| Data JSON | 256 KiB UTF-8; maximum depth 8 |
| General string | 2,000 characters, stricter per-field limits |
| Short name/title | 120 characters, visual capacity checked separately |
| QR payload | 512 UTF-8 bytes; reject density incompatible with size |
| User images | PNG/JPEG only; 2 images, 5 MiB each, 16 Mpx each |
| Invoice/receipt lines | 200; receipts also bounded by final height |
| Labels per export | 100 |
| Custom trim size | 20–420 mm per fixed side, within template limits |
| Continuous receipt | 58/80 mm width, maximum height 2,000 mm |
| Pages | Maximum 50 |
| Final PDF | Maximum 20 MiB |
| Generation | 15 s timeout; terminate worker, then explicit recovery |

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
