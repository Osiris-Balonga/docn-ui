# Invoices: calculations, pagination, and limits

docn-ui provides three source-owned invoice compositions: Minimal, Business, and Studio. Each accepts the same validated data contract and renders in A4 or Letter portrait format. The compositions differ in hierarchy and visual structure, not only color.

## Monetary policy

V1 stores prices as integer minor units and quantities as positive integers. Prices exclude tax. For each line, docn-ui calculates `quantity × unit price`, applies the tax rate in basis points, and rounds that line's tax half up to the currency's minor unit. The document total is the sum of the line subtotals and rounded line taxes.

This policy is deterministic, but it is not a tax or accounting certification. Tax rounding, required identifiers, wording, retention, numbering, and invoice dates vary by jurisdiction. Review and adapt the installed source and legal fields with qualified local advice before using it for regulated invoicing.

V1 does not implement discounts, compound taxes, fractional quantities, credit notes, certified electronic invoicing, payment collection, or bookkeeping.

## Pagination contract

Invoice tables flow across A4 or Letter pages with a repeated identity, party, column, and page-number header. Rows stay together. A label with more than five explicit lines is rejected with `LAYOUT_OVERFLOW` rather than clipped or split unpredictably. Totals, notes, terms, and legal fields are kept together where possible and remain after the final line.

The contract accepts 1–200 line items and a maximum of 50 rendered pages. The representative qualification fixture uses 72 lines across four A4 pages, including a long wrapping label. It verifies the first and last lines, repeated headers, final total, terms, and absence of a trailing blank page.

## Format and print limits

- A4: 210 × 297 mm, portrait.
- Letter: 215.9 × 279.4 mm, portrait.
- A5, landscape invoices, arbitrary page sizes, and automatic format conversion are not promised in V1.
- Screen and supported print profiles use the same generated PDF and explicit page boxes.
- Print at 100% / Actual size when physical dimensions matter. Printer margins and color output still require a hardware trial.

The PDF contains selectable text, but docn-ui does not claim PDF/UA, PDF/X, CMYK, or universal printer calibration.

## Source ownership

Install an invoice through the additional docn-ui registry with the official shadcn CLI. The files are copied below `~/docn`, use relative internal imports, and retain the consumer project's existing `components.json` and alias configuration. After local asset preparation, rendering does not depend on the docn-ui site.
