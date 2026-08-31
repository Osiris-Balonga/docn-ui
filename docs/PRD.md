# PRD — docn-ui V1

Status: planning specification, 2026-08-28. Reference: [product](../PRODUCT.md). The IDs below connect requirements to lots and evidence.

## User outcome

A developer finds a document suited to the physical format, replaces sample data, obtains a PDF matching the preview, and installs the same template in their project without depending on the docn-ui site at runtime.

Primary journey: catalog → composition → data → compatible format → theme → PDF preview → download or installation → standalone rendering.

## Functional requirements

| ID    | Verifiable requirement                                                                                                                                         | Responsible lots |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| FR-01 | Catalog of 15 compositions across five families, with search and combinable filters                                                                            | L06, L08–L11     |
| FR-02 | Detail page with description, compatible formats, data, theme, source, and limitations                                                                         | L05, L06, L12    |
| FR-03 | Explicit physical dimensions; independent format, composition, and theme                                                                                       | L02, L04         |
| FR-04 | Preview of the actual generated PDF, pages/sides, zoom, revision status                                                                                        | L02, L05, L06    |
| FR-05 | Typed data editor, validation, reset; advanced JSON mode                                                                                                       | L05, L06         |
| FR-06 | Download the same PDF as the current preview, with a safe filename and visible errors                                                                          | L05, L06         |
| FR-07 | Three consistent themes; controlled accent and logo customization                                                                                              | L04, L06         |
| FR-08 | Three business cards, two sides, compatible formats, and safe areas                                                                                            | L05              |
| FR-09 | Three tickets, verified QR code, variable content without hidden truncation                                                                                    | L08              |
| FR-10 | Three receipts, 58/80 mm widths, content-dependent height, explicit limit                                                                                      | L09              |
| FR-11 | Three labels, individual export, and configurable sheets                                                                                                       | L10              |
| FR-12 | Three invoices, A4/Letter, multipage line items, deterministic calculations                                                                                    | L11              |
| FR-13 | Complete source viewable, retrievable, and installable as an additional registry through the official shadcn CLI and the consumer's existing `components.json` | L07, L12         |
| FR-14 | Verified installation in two fresh projects, browser and Node                                                                                                  | L07, L14         |
| FR-15 | Documentation for components, formats, themes, usage, and template creation                                                                                    | L12              |
| FR-16 | French/English document data support; English site content                                                                                                     | L04–L12          |
| FR-17 | Reusable PDF components covering the 24 inspected PDFx categories plus Barcode, with typed APIs, real PDF examples, working detail pages and individual shadcn registry installation | L12 |

A color variation does not count as a new composition. The precise template/format matrix is in the [catalog](specs/TEMPLATE_CATALOG.md). All project prose, including documentation and plans, must be in English; this does not remove document locale support.

Maintainer revision, 2026-08-31: prioritize documentation and reusable components before further template redesign. The [component contract](specs/COMPONENT_CATALOG.md) records the PDFx comparison, current gaps, initial proposed Code 128/EAN-13 barcode scope, and component availability criteria. Coverage means equivalent document-building capability, not PDFx import compatibility or adoption of its CLI. Static forms and signature areas do not imply interactive PDF fields or cryptographic signing.

## Nonfunctional requirements

| ID     | Contract                                                                                                                        | Verification / lots                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| NFR-01 | Entered data and images are never sent to a remote service                                                                      | Network interception, L06/L13/L14                |
| NFR-02 | Site usable with a keyboard, responsive layout, and reduced motion                                                              | axe + manual checks, L03/L13/L14                 |
| NFR-03 | Output independent of site DOM tokens/CSS                                                                                       | Boundary and external consumption tests, L04/L07 |
| NFR-04 | Heavy rendering isolated; latest input takes priority; resources released                                                       | Concurrency/timeout/navigation, L02/L06/L13      |
| NFR-05 | PDF verified structurally and visually; text preserved                                                                          | PDF suite, L02 then each family                  |
| NFR-06 | Reproducible versions, assets, and builds; tracked licenses                                                                     | Lockfile/hashes/CI, L01/L07/L15                  |
| NFR-07 | Bounded inputs; no code execution or loading of user URLs                                                                       | Negative tests, L06/L13                          |
| NFR-08 | Installation outside the monorepo without private imports or a docn-ui runtime dependency                                       | Consumer fixtures, L07/L14                       |
| NFR-09 | Explicit registry URL and version; no implicit publication                                                                      | L07/L15/L16                                      |
| NFR-10 | No untested printing or browser support advertised as guaranteed                                                                | QA and documentation, L12/L14/L16                |
| NFR-11 | Registry source has no required import-prefix convention and does not replace the consumer's shadcn UI aliases or configuration | Custom-alias consumer fixture, L07/L14           |

## Governance requirements added before L01

| ID     | Requirement                                                                                | Lot                  |
| ------ | ------------------------------------------------------------------------------------------ | -------------------- |
| GOV-01 | Confirmed public repository, required PRs on dev/main, no bypass or force push             | L00G                 |
| GOV-02 | Only dev from the same repository may target main, with a verified required check          | L00G                 |
| GOV-03 | Project, milestones, one issue per lot; linked stories/commits/evidence without duplicates | L00G, then every lot |
| GOV-04 | Update status at every transition; Done differs from local verification; verify release    | All lots             |

## Main journey acceptance criteria

### Find a template

On `/templates/`, combining family and format shows only compatible templates. The count matches, back navigation restores public filters, and a search with no results offers to clear them. Gallery filtering requires no PDF engine.

### Customize and export

On a business card, changing the name and then the logo announces generation and displays the PDF for that revision. The user can inspect the back. Downloading is blocked until the new revision is ready; downloaded bytes match the preview. Invalid data does not remove fields or replace values with sample data.

### Install

From the source view, following the registry command in an existing shadcn project installs all required files and dependencies without reinitializing shadcn. The project's existing `components.json` remains authoritative. Installed docn-ui files use relative internal imports and therefore do not require `@/*` or another fixed consumer import prefix. After documented asset setup, rendering works without access to the docn-ui domain.

## Excluded data and features

No accounts, cloud storage, document history, rendering server, payments, freeform editor, executable user code, arbitrary HTML/Markdown import, data sharing through URLs, server ticket scanning/validation, or paid template library. The browser opens only PDFs generated by the application, not uploaded external PDFs.

No tax certification for invoices; consumers must adapt legal fields. No CMYK/PDF-X/PDF-UA guarantee. No automatic persistence of contact details or logos. No guaranteed PWA/offline support at this stage.

## Definition of done

All 15 compositions exist and are distinct; every template has a schema, nominal example, edge cases, formats, source, detail page, PDF test, and registry entry. Both consumption modes are verified, journeys pass on target browsers, limitations are published, and no data is transmitted. L16 additionally requires authorization, a verified public version, and a documented rollback. Every exception must be explicitly accepted and narrow the corresponding public promise.
