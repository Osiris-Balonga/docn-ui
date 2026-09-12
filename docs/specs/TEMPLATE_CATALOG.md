# V1 template catalog — eighteen compositions

This catalog defines the launch scope. It contains only invoices, receipts, resumes, reports, badges, and business cards. Template IDs are stable for URLs, fixtures, generated previews, and registry items. Event tickets and labels are not V1 catalog families and have no compatibility aliases or catalog entries.

## Inventory

| ID                             | Family        | Composition and expected distinction                                 |
| ------------------------------ | ------------- | -------------------------------------------------------------------- |
| `invoice-spacious`             | Invoice       | Spacious service invoice with a compact original wordmark            |
| `invoice-vertical`             | Invoice       | Editorial invoice with vertical identity and payment area            |
| `invoice-corporate`            | Invoice       | Corporate header, alternating item table, and structured totals      |
| `invoice-photo-header`         | Invoice       | Large original landscape image, open details, and restrained totals  |
| `receipt-order-confirmation`   | Receipt       | Order summary with distinct product imagery and shipping metadata    |
| `receipt-product-barcode`      | Receipt       | Compact product receipt with a barcode footer                        |
| `receipt-cash-register`        | Receipt       | Narrow monochrome cash-register composition                          |
| `resume-classic`               | Resume        | Restrained two-column professional resume                            |
| `resume-accountant`            | Resume        | Dense single-column accountant resume                                |
| `resume-designer`              | Resume        | Profile-led designer resume with a skill sidebar                     |
| `report-product-analytics`     | Report        | KPI grid and source trend chart                                      |
| `report-marketplace-revenue`   | Report        | Focused comparison chart with an explanatory conclusion              |
| `report-customer-support`      | Report        | Survey dashboard with charts, quotations, and an original portrait   |
| `badge-profile-lanyard`        | Badge         | Two-sided portrait badge with a white face and dark brand reverse    |
| `badge-qr-portrait-light`      | Badge         | Light portrait badge with QR code and full-width header field        |
| `badge-qr-portrait-blue`       | Badge         | Blue portrait badge with QR code and full-bleed patterned background |
| `business-card-coral-qr`       | Business card | Two-page coral and white card with QR contact details                |
| `business-card-violet-founder` | Business card | Two-page violet and black founder identity card                      |

Themes change template-owned tokens, not composition IDs. Every template keeps a qualified default palette and typography while Theme Studio may apply a validated `PdfTheme` without altering layout.

## Post-V1 migration contract

L20 migrates all eighteen compositions; a three-template pilot is evidence for the API, not the completion boundary. Every migrated template must expose one renderable definition with strict data validation, defaults, compatibility metadata and a composition built from public docn components where those components match the required behavior.

The migration audit identified two component prerequisites that must land first in L19:

- Tables must support fixed `PageFrame` and continuous `ReceiptFrame` compositions without requiring `DocumentFrame` flow context. The non-flow contract requires an explicit container width, row-height bounds, compact density where selected, banding/emphasis options and bounded printable cells. Column widths must resolve within the container. Flow-only pagination remains explicit and must not be simulated inside a fixed page.
- Graphs must support grouped bars and labeled multi-series data up to 6 series × 30 points so report templates do not recreate comparison charts from raw React PDF shapes. Trusted composition-owned label/value formatters are supported but never serialized from user data. Single-series and radial behavior must remain compatible.
- L19 must exercise every additional public component promised below in its required frame mode. If a component cannot express the audited design without disproportionate abstraction, narrow the corresponding row and record a template-local exception before L20 rather than expanding a generic API speculatively.

Migration does not mean replacing every `View`, `Svg` or template-specific vector mark. It means removing local abstractions that duplicate a suitable public component, routing themes through the unified contract, and keeping bespoke composition where no public abstraction improves clarity.

Recommended family mapping:

| Family         | Public components expected where applicable                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Invoices       | `PageHeader`, `PageFooter`, `Table` or `DataTable`, `KeyValue`, `Section`, `Signature`, `QRCode`, `Image` |
| Receipts       | fixed/continuous-compatible `Table`, `KeyValue`, `Divider`, `Barcode`, `Image`                            |
| Reports        | multi-series `Graph`, `DataTable`, `Badge`, `Section`, `PageHeader`, `PageFooter`, `Image`                |
| Resumes        | `Section`, `List`, `Badge`, `KeyValue`, `Link`, `Image`                                                   |
| Badges         | `PageFrame`, `Row`, `Stack`, `Text`, `Image`, `QRCode`; bespoke identity vectors may remain local         |
| Business cards | `PageFrame`, `Card`, `KeyValue`, `Link`, `Image`, `QRCode`; bespoke identity vectors may remain local     |

Each family migration records intentional exceptions. Component use is semantic, not a quota.

### Template-by-template migration matrix

All rows require a strict schema, extraction of business data from the current presentation props, a legacy wrapper, and registry dependency updates in the same template story. `Fixed` below preserves the current page count and dimensions. No catalog row is treated as a flow template; L17/L18 flow evidence uses the existing `ComponentDocument`/`DocumentFrame` specimen.

| Template                       | Target geometry and version                                                                    | Business-data contract                                                                  | Public composition target and intentional exception                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `invoice-spacious`             | Fixed A4; preserve version unless data migration requires a declared major                     | Parties, invoice/due dates, currency, integer line items/totals, logo image ID          | Table/DataTable, KeyValue, PageHeader, Image, Link; original wordmark remains local                                    |
| `invoice-vertical`             | Fixed A4; preserve geometry                                                                    | Parties, dates, currency, integer lines/totals, payment QR payload                      | Table, KeyValue, Section, QRCode; vertical identity treatment remains local                                            |
| `invoice-corporate`            | Fixed A4; preserve geometry                                                                    | Parties, payment details, dates, currency, integer lines/tax/totals                     | Table/DataTable, KeyValue, PageHeader/Footer, Signature; original vector mark remains local                            |
| `invoice-photo-header`         | Fixed A4; preserve geometry                                                                    | Parties, dates, currency, integer lines/totals, header image ID                         | Image, Table, KeyValue, Section; photographic crop remains template-owned                                              |
| `receipt-order-confirmation`   | Continuous measured `receipt-80`; physical-height change requires a new major template version | Customer, order/date, payment/shipping, integer product amounts, logo/product image IDs | Table, KeyValue, Divider, Image; commerce arrangement remains local                                                    |
| `receipt-product-barcode`      | Continuous measured `receipt-80`; physical-height change requires a new major template version | Product identity, reference, integer amount/currency, barcode value                     | Compact Table/KeyValue, Divider, Barcode                                                                               |
| `receipt-cash-register`        | Continuous measured `receipt-80`; physical-height change requires a new major template version | Merchant, timestamp/zone, payment, currency, integer items/tax/totals, barcode value    | Compact banded Table, KeyValue, Divider, Barcode; dashed receipt rules may remain local if Divider cannot express them |
| `resume-classic`               | Fixed A4; preserve geometry                                                                    | Person/contact, summary, experience, education, projects, skills/languages              | Section, List, KeyValue, Link; two-column geometry remains template-owned                                              |
| `resume-accountant`            | Fixed A4; preserve geometry                                                                    | Person/contact, profile, employment, education, competencies                            | Section, List, KeyValue, Badge where semantically correct                                                              |
| `resume-designer`              | Fixed A4; preserve geometry                                                                    | Person/contact, profile, experience, education, skills, portrait image ID               | Image, Section, List, Badge, Link; sidebar geometry remains template-owned                                             |
| `report-product-analytics`     | Fixed A4; preserve geometry                                                                    | Period, KPI values, labeled acquisition series up to the Graph budget                   | Graph, DataTable, Badge, Section, PageHeader/Footer                                                                    |
| `report-marketplace-revenue`   | Fixed A4; preserve geometry                                                                    | Period, currencies/totals, labeled comparison series and conclusion                     | Grouped multi-series Graph, KeyValue, Section, PageHeader/Footer                                                       |
| `report-customer-support`      | Fixed A4; preserve geometry                                                                    | Period, service KPIs, bounded survey series, quotations, portrait image ID              | Graph, DataTable, Badge, Section, Image; quotation composition may remain local                                        |
| `badge-profile-lanyard`        | Fixed `badge-54x86`, two pages; preserve geometry                                              | Person, role/organization, identifier, portrait image ID                                | PageFrame, Image, KeyValue/Badge; original reverse identity and vectors remain local                                   |
| `badge-qr-portrait-light`      | Fixed `badge-54x86`; preserve geometry                                                         | Person, role/organization, identifier, portrait image ID, QR payload                    | Shared portrait layout, Image, QRCode, Text/Stack/Row                                                                  |
| `badge-qr-portrait-blue`       | Fixed `badge-54x86`; preserve geometry                                                         | Person, role/organization, identifier, portrait/pattern image IDs, QR payload           | Shared portrait layout, Image, QRCode, Text/Stack/Row; pattern remains template-owned                                  |
| `business-card-coral-qr`       | Fixed `card-90x50`, two pages; preserve geometry                                               | Person, role/organization, contacts, QR payload                                         | Card, KeyValue, Link, QRCode; original mark and contact icons may remain local                                         |
| `business-card-violet-founder` | Fixed `card-85x55`, two pages; preserve geometry                                               | Person, role/organization and contacts                                                  | Card, KeyValue, Link; original identity vectors remain local                                                           |

Before the first migration, L20 creates a baseline manifest and contact sheet covering all 18 accepted outputs. Each template story compares against that baseline, preserves its compatibility wrapper and updates its direct `registryDependencies`. A changed physical format, page count, money meaning or required data field is versioned according to the compatibility policy rather than hidden inside a refactor.

## Format compatibility

| Family         | V1 formats                                              | Constraints                                                               |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Invoices       | `a4`, `letter`                                          | Portrait; pagination only where declared by the template                  |
| Receipts       | `receipt-58`, `receipt-80`, or a declared document page | Thermal receipts use bounded automatic height and are not narrow A4 pages |
| Resumes        | `a4`, `letter`                                          | Portrait; content density must remain within the declared composition     |
| Reports        | `a4`, `letter`                                          | Portrait; graphs are PDF-native vectors with visible labels and legends   |
| Badges         | `badge-54x86`                                           | Portrait 53.98 × 85.6 mm page                                             |
| Business cards | `card-85x55`, `card-90x50`, `card-us`                   | Landscape; front and back are consecutive equally sized pages             |

Names are product presets, not claims of universal commercial standards. Display dimensions in millimeters and test at actual size. Each template declares its exact compatibility list; do not advertise the full Cartesian product.

## Source and identity policy

Each template has one source used by the catalog, preview, PDF export, and registry. Shipped samples must not include third-party logos, trademarked product identities, copied brand names, or remote assets. Use original vector marks, fictional organizations, and locally stored generated or license-reviewed imagery. Record image provenance in `tooling/docs/assets/README.md`.

Metadata includes ID, version, title, description, tags, family, formats, sides, asset capabilities, source, and license. Generate gallery images from nominal examples; never maintain them manually.

## Fixtures and testing effort

- Every composition receives one nominal generation and structure/content check through the parameterized PDF suite.
- Test shared risks at the lowest shared level; do not repeat them for every template.
- Validate physical page dimensions for every generated template and page count for front/back business cards.
- Review all generated thumbnails and representative full-page renders after a composition change.
- Preserve a pre-migration reference for every composition and perform human visual comparison. Add behavior tests only for changed shared risks; do not duplicate component tests across eighteen templates.
- Qualify one representative fixed template, the existing `ComponentDocument` flow specimen, and one continuous template at the render-facade level, then retain the existing parameterized dimension/content checks for the full catalog.
- Keep one parameterized PDF test file but make family and template selection filterable through the test runner. Maintain a schema-contract table with exactly one row for each of the 18 IDs so missing schemas/defaults fail as an inventory error.

## Invoice limitations

Invoices use deterministic integer-based sample calculations. They are not tax, bookkeeping, or certified electronic-invoicing software. Consumers must adapt legal fields and calculation rules for their jurisdiction. See the [invoice guide](../guides/INVOICES.md) for pagination, format, and print limits.
