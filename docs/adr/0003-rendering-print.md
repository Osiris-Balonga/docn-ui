# ADR 0003 — An actual PDF and bounded guarantees

Date: 2026-08-28. Status: proposed architecture; feasibility is a blocking gate in L02.

## Decision

Generate a PDF locally with React-pdf, then display those same bytes through PDF.js. Export uses the final accepted result for the same revision. The browser sends no data to a rendering service.

Format, theme, and composition are separate. Fixed-size formats reject overflow; flow documents paginate. Print profiles describe trim, bleed, safe areas, and marks; PDF boxes are tested independently.

## Alternatives excluded from V1

Capturing HTML/canvas as an image would lose text and document reliability. Server-side Chromium generation would add infrastructure and data transfer. A custom engine would shift work to pagination/fonts. These alternatives are not permanently prohibited; a measured L02 failure could justify reconsidering the engine.

## Required evidence

Worker with a static build, licensed static fonts, front/back, mm/pt sizes, automatic receipt height, pagination, print boxes, and timeout recovery. Post-processing such as `pdf-lib` is allowed only to fill a demonstrated capability gap, with license/version review and appropriate tests.

## Limits of the promise

No CMYK/PDF-X/PDF-UA or guaranteed printer precision. Digital preview is not a color soft proof. User instructions explain 100% scale, duplex settings, and hardware printable areas.
