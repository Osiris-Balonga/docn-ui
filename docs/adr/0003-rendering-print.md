# ADR 0003 — An actual PDF and bounded guarantees

Date: 2026-08-28. Status: accepted for fixed geometry and pagination in L02-S01; browser and receipt qualification remain blocking.

## Decision

Generate a PDF locally with React-pdf, then display those same bytes through PDF.js. Export uses the final accepted result for the same revision. The browser sends no data to a rendering service.

Format, theme, and composition are separate. Fixed-size formats reject overflow; flow documents paginate. Print profiles describe trim, bleed, safe areas, and marks; PDF boxes are tested independently.

## Alternatives excluded from V1

Capturing HTML/canvas as an image would lose text and document reliability. Server-side Chromium generation would add infrastructure and data transfer. A custom engine would shift work to pagination/fonts. These alternatives are not permanently prohibited; a measured L02 failure could justify reconsidering the engine.

## Required evidence

Worker with a static build, licensed static fonts, front/back, mm/pt sizes, automatic receipt height, pagination, print boxes, and timeout recovery. Post-processing such as `pdf-lib` is allowed only to fill a demonstrated capability gap, with license/version review and appropriate tests.

## L02-S01 finding

React-pdf 4.9.0 rendered the 85×55 mm card, a static local Noto Sans WOFF, two sides, accented French text, and a four-page A6 table. The raw probe contained only `MediaBox`. The isolated pdf-lib 1.17.1 step is therefore accepted for explicit crop, trim, and bleed boxes; it does not calculate layout. PDF.js 6.2.108 reads content and dimensions independently, while pdf-lib and pypdf inspect the page dictionaries. Browser execution and measured roll height remain open until S02/S03.

## Limits of the promise

No CMYK/PDF-X/PDF-UA or guaranteed printer precision. Digital preview is not a color soft proof. User instructions explain 100% scale, duplex settings, and hardware printable areas.
