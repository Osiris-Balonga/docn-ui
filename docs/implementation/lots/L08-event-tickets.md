# L08 — Event tickets and vector QR

Initial status: **planned**. Branch: `feat/event-ticket-templates`.

Dependencies: L07. Requirements: FR-01, FR-09, FR-13, FR-16; NFR-05.

## Reading and entry criteria

Read the [master plan](../../../IMPLEMENTATION_PLAN.md) and [agent rules](../../../AGENTS.md). The preceding lot must be verified according to the selected Git mode. References: [reference 1](../../specs/DOCUMENT_MODEL.md), [reference 2](../../specs/TEMPLATE_CATALOG.md), [reference 3](../../TESTING.md).

## Scope and files

Three distinct tickets with useful formats and QR. QR represents data; no secure ticketing system is implemented.

Target files/responsibilities: packages/documents/src/primitives/qr, templates/event-tickets, family form, metadata, and registry.

## Stories and commits in order

### L08-S01 — `feat(tickets): add ticket schema and printable QR primitive`

- [ ] Event schema with instant/time zone/venue/identifier and validated payload; fixed sample data.
- [ ] Maintained/licensed encoder and vector primitive with quiet zone, minimum module size, and density checks.
- [ ] Error for overly dense payloads; no third-party link requested to generate QR.

**Acceptance:** Decoding the final PDF's QR reproduces the input; the date displays in the selected time zone.

**Targeted verification:** Date/payload validation unit tests at the appropriate level; one PDF QR test with rasterization and independent decoding.

### L08-S02 — `feat(tickets): add classic conference and live layouts`

- [ ] Implement three distinct compositions with bounded text areas and undistorted QR.
- [ ] Classic/live landscape formats; conference A6 and dedicated landscape layout, not simple proportional shrinking.
- [ ] Add family form, metadata, actual thumbnails, source, and registry items through the existing pipeline.

**Acceptance:** Three tickets available in the catalog; explicit supported formats and readable essential information.

**Targeted verification:** One parameterized family PDF suite with three nominal examples and one representative long title/name.

### L08-S03 — `test(tickets): qualify layout density and ticket export`

- [ ] Extend the QR suite for the genuinely new density boundary; do not exhaustively test the third-party algorithm.
- [ ] Select one ticket as a visual reference; review the three-template contact sheet.
- [ ] Document the distinction between graphic generation, access control, and printing/cutting.

**Acceptance:** No clipped QR or claim of tamper-proof tickets; all registry items validate.

**Targeted verification:** pnpm test:pdf ticket; pnpm verify:registry; reuse the existing export journey, not three new E2Es.

## Exit criteria

Six public compositions in total and a reusable QR primitive. Distinguish digital decoding from a printed trial.

Update [status](../status.json) and create `docs/qa/L08.md` from the [template](../templates/QA_REPORT.md). Record actual commits, completed checks, and deviations. No additional suite without a distinct risk to cover.

## Out of scope

No ticket signing, server scanning, reservations, payments, or attendee database.
