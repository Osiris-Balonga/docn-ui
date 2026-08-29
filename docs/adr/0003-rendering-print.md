# ADR 0003 — An actual PDF and bounded guarantees

Date: 2026-08-28. Status: accepted after the L02 feasibility gate.

## Decision

Generate a PDF locally with React-pdf, then display those same bytes through PDF.js. Export uses the final accepted result for the same revision. The browser sends no data to a rendering service.

Format, theme, and composition are separate. Fixed-size formats reject overflow; flow documents paginate. Print profiles describe trim, bleed, safe areas, and marks; PDF boxes are tested independently.

## Alternatives excluded from V1

Capturing HTML/canvas as an image would lose text and document reliability. Server-side Chromium generation would add infrastructure and data transfer. A custom engine would shift work to pagination/fonts. These alternatives are not permanently prohibited; a measured L02 failure could justify reconsidering the engine.

## Required evidence

Worker with a static build, licensed static fonts, front/back, mm/pt sizes, automatic receipt height, pagination, print boxes, and timeout recovery. Post-processing such as `pdf-lib` is allowed only to fill a demonstrated capability gap, with license/version review and appropriate tests.

## L02-S01 finding

React-pdf 4.9.0 rendered the 85×55 mm card, a static local Noto Sans WOFF, two sides, accented French text, and a four-page A6 table. The raw probe contained only `MediaBox`. The isolated pdf-lib 1.17.1 step is therefore accepted for explicit crop, trim, and bleed boxes; it does not calculate layout. PDF.js 6.2.108 reads content and dimensions independently, while pdf-lib and pypdf inspect the page dictionaries. The S02 static build renders in a dedicated worker, previews a copy through the local PDF.js worker, and retains the original bytes for download.

For roll receipts, render once against the configured maximum height, inspect actual PDF.js glyph positions and page count, then render again at the measured height plus a fixed 12 pt layout safety allowance. This uses the engine's real wrapping and selected font. It does not estimate characters. More than one probe page, a missing final marker, more than 300 input lines, or a measured result above the physical limit returns a structured error instead of truncating content.

## Limits of the promise

No CMYK/PDF-X/PDF-UA or guaranteed printer precision. Digital preview is not a color soft proof. User instructions explain 100% scale, duplex settings, and hardware printable areas.
