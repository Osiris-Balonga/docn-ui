# V1 template catalog — seventeen compositions

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
| `badge-profile-sideband`       | Badge         | Portrait identity badge with a black vertical brand sideband         |
| `badge-qr-portrait`            | Badge         | Two-sided portrait badge with QR code and original patterned variant |
| `business-card-coral-qr`       | Business card | Two-page coral and white card with QR contact details                |
| `business-card-violet-founder` | Business card | Two-page violet and black founder identity card                      |

Themes change template-owned tokens, not composition IDs. Every template keeps its own baseline palette and typography so a future theme builder can apply controlled substitutions without altering layout.

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

## Invoice limitations

Invoices use deterministic integer-based sample calculations. They are not tax, bookkeeping, or certified electronic-invoicing software. Consumers must adapt legal fields and calculation rules for their jurisdiction. See the [invoice guide](../guides/INVOICES.md) for pagination, format, and print limits.
