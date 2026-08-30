# V1 catalog — fifteen compositions

This catalog defines launch scope. Three compositions per family, not three colors of the same layout. IDs are stable for URLs, fixtures, and registry items.

Implementation status on 2026-08-30: all fifteen IDs below have metadata, a nominal fixture, PDF-derived catalog image, static detail route, and shadcn registry block. The family suites qualify one representative adversarial risk per family instead of a format/theme matrix.

## Inventory

| ID | Family | Composition and expected distinction |
| --- | --- | --- |
| `business-card-minimal` | Business card | Aligned contact details, strong typographic hierarchy, brand on back |
| `business-card-editorial` | Business card | Serif/sans contrast, asymmetric organization, additional information on back |
| `business-card-studio` | Business card | Contrasting brand block, distributed contacts, QR and identity on back |
| `event-ticket-classic` | Ticket | Event on left, stub/identifier on right, isolated QR |
| `event-ticket-conference` | Ticket | Prominent attendee and category, secondary schedule/venue |
| `event-ticket-live` | Ticket | Expressive title, prominent date, dedicated QR/access area |
| `receipt-retail` | Receipt | Merchant, compact lines, taxes, total, payment |
| `receipt-hospitality` | Receipt | Optional table/order, readable groups, service footer |
| `receipt-service` | Receipt | SaaS subscription, customer, billing period, payment summary |
| `label-product` | Label | Product name, reference, short information, optional QR |
| `label-address` | Label | Prominent recipient/address, optional sender marker |
| `label-inventory` | Label | Prominent identifier, location and QR in a second area |
| `invoice-minimal` | Invoice | Light document, compact contact details, open table |
| `invoice-business` | Invoice | Formal identity, seller/customer blocks, structured table |
| `invoice-studio` | Invoice | Stronger visual identity, project and totals hierarchy |

The shared themes `neutral`, `editorial`, and `bold` change tokens, not composition IDs. All receipt themes retain a readable monochrome version. Never impose large dark backgrounds on a thermal printer.

## Format compatibility

| Family | V1 formats | Constraints |
| --- | --- | --- |
| Business cards | `card-85x55`, `card-90x50`, `card-us` (88.9×50.8 mm) | Landscape; equal front/back size; customization limited to presets |
| Tickets | `ticket-210x74`, `ticket-150x70`, `ticket-a6` (105×148 mm) | classic/live: both landscape formats; conference: A6 portrait and 150×70 with a dedicated layout |
| Receipts | `receipt-58`, `receipt-80` | Bounded automatic height; no conversion to A4 |
| Labels | `label-70x37`, `label-100x50`, `label-custom` | Width 40–120, height 25–100 mm; mandatory preflight |
| Invoices | `a4` (210×297), `letter` (215.9×279.4 mm) | Portrait and pagination; no A5 promise in V1 |

Names are product presets, not claims of universal commercial standards. Always display dimensions in mm; inch equivalents are optional for Letter/card-us. Each template declares its actual compatibility list; do not advertise the entire Cartesian product.

## Label sheets

A4 and Letter profiles. Parameters: label size, page margins, spacing, calculated row/column counts, row-major order, starting cell, quantity. Verify `margins + cells + gaps <= page` on both axes. Reject impossible placement.

The next page starts at its first cell; the starting cell applies only to page one. Positive quantity bounded at 100; ordered identifiers with no unintended duplication. Do not claim compatibility with an Avery reference without physically comparing that reference.

## Required template files

`<id>.tsx` (composition), `schema.ts`, `metadata.ts`, `examples.ts`, tests integrated into the family's PDF suite, and synthetic sample data. Extract a subcomponent only for a real responsibility or reuse. A family may share schemas/fixtures without copying identical files.

Metadata: ID, version, title, description, tags, family, formats/themes, sides, QR/logo/print capabilities, source, and license after confirmation. Generate gallery images from nominal examples; never maintain them manually.

## Fixtures and testing effort

- Every composition gets a nominal example: one generation and structure/content check through a parameterized family suite, not one test file per variant.
- Test shared risks (long names, fonts, URLs, image limits) at the lowest shared level; do not repeat them fifteen times.
- One representative adversarial fixture per family exercises its specific risk: card overflow, dense QR, long receipt, sheet overflow, multipage invoice.
- Test format boundaries when geometry differs; do not automatically cross every format × theme × language × browser.
- Selected visual references: one per family, plus a side or variant only when its structure is otherwise uncovered. Review all fifteen thumbnails as a contact sheet without creating fifteen screenshot suites.

## After V1

Reports, quotes, proposals, CVs, certificates, menus, brochures, badges, and invitations belong in a separate backlog. A new family needs its own need, composition, and constraint. Catalog quality takes priority over a large advertised count.

## Invoice limitations

Invoices use integer minor-unit prices, integer quantities, basis-point tax rates, and per-line half-up tax rounding. This deterministic calculation policy may not match every jurisdiction. The templates are not tax, bookkeeping, or certified electronic-invoicing software; consumers must adapt legal fields and calculation rules where required. See the [invoice guide](../guides/INVOICES.md) for pagination, format, and print limits.
