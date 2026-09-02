# PRD — docn-ui V1

Status: planning specification, 2026-08-28. Reference: [product](../PRODUCT.md). The IDs below connect requirements to lots and evidence.

## User outcome

A developer finds a document suited to the physical format, replaces sample data, obtains a PDF matching the preview, and installs the same template in their project without depending on the docn-ui site at runtime.

Primary journey: catalog family → composition → generated PDF preview → download or source installation → standalone rendering.

## Functional requirements

| ID    | Verifiable requirement                                                                                                                                                               | Responsible lots |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| FR-01 | Catalog of 17 compositions across invoices, receipts, resumes, reports, badges, and business cards, with family navigation                                                           | L06, L11, L12    |
| FR-02 | Catalog specimen with title, actual generated preview, PDF download, complete source installation, and published limitations                                                         | L06, L07, L12    |
| FR-03 | Explicit physical dimensions; independent format, composition, and theme                                                                                                             | L02, L04         |
| FR-04 | Preview pages generated from the same template source as the downloadable PDF, with page/side navigation and zoom                                                                    | L02, L05, L06    |
| FR-05 | Withdrawn from the current static V1 catalog: no public data editor or advanced JSON mode                                                                                            | Maintainer scope |
| FR-06 | Download the fixture PDF represented by the current generated preview, with an accessible action                                                                                     | L06, L13         |
| FR-07 | Three document themes for reusable components; templates retain explicit source-owned baseline tokens                                                                                | L04, L12         |
| FR-08 | Two distinct two-sided business cards with compatible formats and safe areas                                                                                                         | L05, L12         |
| FR-09 | Withdrawn from V1 without a compatibility alias: event tickets are not a catalog family                                                                                              | Maintainer scope |
| FR-10 | Three receipts, 58/80 mm widths, content-dependent height, explicit limit                                                                                                            | L09              |
| FR-11 | Withdrawn from V1 without a compatibility alias: labels are not a catalog family                                                                                                     | Maintainer scope |
| FR-12 | Four invoices, A4/Letter compatibility as declared per template, and deterministic sample calculations                                                                               | L11, L12         |
| FR-13 | Complete source viewable, retrievable, and installable as an additional registry through the official shadcn CLI and the consumer's existing `components.json`                       | L07, L12         |
| FR-14 | Verified installation in two fresh projects, browser and Node                                                                                                                        | L07, L14         |
| FR-15 | Documentation for components, formats, themes, usage, and template creation                                                                                                          | L12              |
| FR-16 | French/English document data support; English site content                                                                                                                           | L04–L12          |
| FR-17 | Reusable PDF components covering the 24 inspected PDFx categories plus Barcode, with typed APIs, real PDF examples, working detail pages and individual shadcn registry installation | L12              |

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

On `/templates/`, selecting a family shows exactly its registered templates and preserves the family in the URL. Unsupported legacy family parameters canonicalize to the first available family. Gallery navigation and filtering require no PDF engine.

### Preview and download

From a template specimen, the user can open the generated preview, inspect every side/page, zoom, and download the corresponding fixture PDF. The current V1 site does not offer public customization; consumers edit the installed, source-owned template and data in their own application.

### Install

From the source view, following the registry command in an existing shadcn project installs all required files and dependencies without reinitializing shadcn. The project's existing `components.json` remains authoritative. Installed docn-ui files use relative internal imports and therefore do not require `@/*` or another fixed consumer import prefix. After documented asset setup, rendering works without access to the docn-ui domain.

## Excluded data and features

No accounts, cloud storage, document history, rendering server, payments, freeform editor, executable user code, arbitrary HTML/Markdown import, data sharing through URLs, server ticket scanning/validation, or paid template library. The browser opens only PDFs generated by the application, not uploaded external PDFs.

No tax certification for invoices; consumers must adapt legal fields. No CMYK/PDF-X/PDF-UA guarantee. No automatic persistence of contact details or logos. No guaranteed PWA/offline support at this stage.

## Definition of done

All 17 compositions exist and are distinct; every template has a schema, nominal example, formats, source, generated preview/PDF checks, and a registry entry. Both consumption modes are verified, current journeys pass on qualified browsers, limitations are published, and no document data is transmitted. L16 additionally requires authorization, a verified public version, and a documented rollback. Every exception must be explicit and narrow the corresponding public promise.
