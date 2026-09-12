# Changelog

All notable changes to docn-ui are documented in this file. A section without
a release date describes candidate scope only; it is not evidence that a tag,
deployment, or GitHub release exists.

## 1.0.0 — Unreleased

The public site remains a non-indexed beta and its install examples continue to
use the mutable `/r/dev/` registry. This section records the intended v1.0.0
scope for review. The immutable registry, exact candidate qualification,
authorized promotion, deployment, tag, and GitHub release are still pending.

### Added

- Eighteen source-owned templates across six families: four invoices, three
  receipts, three resumes, three reports, three badges, and two two-sided
  business cards.
- A PDF component catalog with reusable content, layout, pagination, data,
  feedback, document, and barcode primitives, plus three validated themes.
- Browser and Node rendering paths with bounded inputs, local licensed fonts
  and images, deterministic sample calculations, explicit physical formats,
  print boxes, and print-profile post-processing.
- A static documentation and template catalog built from the same template
  sources as its generated PDF downloads and PDF-derived previews.
- Source installation through the official shadcn CLI into the consumer's
  existing project, without a docn-ui runtime dependency after installation.
- Proportionate PDF, visual, external-consumer, static-build, and Chromium
  qualification with fingerprinted build artifacts.

### Supported template formats

- Invoices, resumes, and reports declare A4 and/or Letter portrait support per
  template.
- Receipts declare 58 mm, 80 mm, or a bounded document page as appropriate to
  the composition.
- Badges use the declared 53.98 × 85.6 mm portrait format.
- Business cards declare supported 85 × 55 mm, 90 × 50 mm, and US card formats;
  their front and back are consecutive equally sized pages.

### Migration from the public beta

There is no earlier immutable docn-ui release to upgrade. Beta consumers must
not treat `/r/dev/` as frozen. After an authorized v1.0.0 publication, reinstall
the selected items from `/r/v1.0.0/` and review the installed source diff before
adopting it. No npm package publication is required for v1.

### Known limitations

- The current public registry is mutable and is not yet a versioned release.
- The catalog is a static preview, download, and source-installation experience;
  it does not include a public document-data editor, accounts, remote storage,
  or server-side PDF generation.
- Consumers remain responsible for jurisdiction-specific invoice fields,
  calculations, document accessibility alternatives, rendering cancellation,
  and final print qualification.
- Digital geometry and barcode decoding do not certify physical printers,
  duplex registration, scanners, or barcode-reader grades.
- Only the environments recorded in QA evidence are qualified. The project does
  not claim universal browser support, PDF/UA, PDF/X, CMYK, tax compliance, or
  secure-ticket validity.
