import type { InvoiceData } from "../schema";

export const studioInvoiceExample = {
  seller: {
    name: "Common Form Studio",
    address: ["21 Market Street", "London EC1A 1BB"],
    email: "studio@common-form.example",
    phone: "+44 20 7946 0138",
  },
  customer: {
    name: "Revue Latitude",
    address: ["27 rue des Éditions", "75011 Paris, France"],
    email: "production@revue-latitude.example",
  },
  number: "CFS-2608-17",
  issueDate: "2026-08-30",
  dueDate: "2026-09-29",
  currency: "EUR",
  project: "Latitude Vol. 01 - editorial production",
  lines: [
    {
      id: "art-direction",
      label: "Art direction",
      quantity: 1,
      unitPriceMinor: 180_000,
      taxRateBasisPoints: 2_000,
    },
    {
      id: "layout",
      label: "Editorial layout system",
      quantity: 1,
      unitPriceMinor: 265_000,
      taxRateBasisPoints: 2_000,
    },
    {
      id: "production",
      label: "Print-ready production",
      description: "Preflight, final artwork, and production coordination.",
      quantity: 1,
      unitPriceMinor: 140_000,
      taxRateBasisPoints: 2_000,
    },
  ],
  notes: "A pleasure to shape the first issue together.",
  terms: "Payment due within 30 days by bank transfer.",
  legalFields: [{ label: "Company number", value: "14726081" }],
} satisfies InvoiceData;
