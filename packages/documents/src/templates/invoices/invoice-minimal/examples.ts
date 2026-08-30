import type { InvoiceData } from "../schema";

export const minimalInvoiceExample = {
  seller: {
    name: "Atelier Nzela",
    address: ["14 avenue des Arts", "Brazzaville, Republic of the Congo"],
    email: "hello@atelier-nzela.example",
    phone: "+242 06 555 01 24",
  },
  customer: {
    name: "Common Form Studio",
    address: ["21 Market Street", "London EC1A 1BB"],
    email: "accounts@common-form.example",
  },
  number: "INV-2026-0042",
  issueDate: "2026-08-30",
  dueDate: "2026-09-29",
  currency: "EUR",
  project: "Identity system refinement",
  lines: [
    {
      id: "discovery",
      label: "Design discovery and direction",
      quantity: 1,
      unitPriceMinor: 120_000,
      taxRateBasisPoints: 2_000,
    },
    {
      id: "system",
      label: "Identity system refinement",
      quantity: 1,
      unitPriceMinor: 240_000,
      taxRateBasisPoints: 2_000,
    },
    {
      id: "handoff",
      label: "Production files and handoff",
      quantity: 2,
      unitPriceMinor: 45_000,
      taxRateBasisPoints: 2_000,
    },
  ],
  notes: "Thank you for the thoughtful collaboration.",
  terms: "Payment due within 30 days by bank transfer.",
  legalFields: [
    { label: "Registration", value: "RCCM CG-BZV-01-2026-B14-0042" },
  ],
} satisfies InvoiceData;
