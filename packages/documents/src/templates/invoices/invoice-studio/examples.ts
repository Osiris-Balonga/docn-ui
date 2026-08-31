import type { InvoiceData } from "../schema";

export const studioInvoiceExample = {
  seller: {
    name: "Northstar Cloud",
    address: ["48 Mercer Street", "London W1F 9AN"],
    email: "billing@northstar-cloud.example",
    phone: "+44 20 7946 0182",
  },
  customer: {
    name: "Common Form Studio",
    address: ["21 Market Street", "London EC1A 1BB"],
    email: "accounts@common-form.example",
  },
  number: "NSC-2026-0830",
  issueDate: "2026-08-30",
  dueDate: "2026-09-29",
  currency: "USD",
  project: "Workspace subscription · 30 Aug – 29 Sep 2026",
  lines: [
    {
      id: "workspace",
      label: "Northstar Pro workspace",
      description: "Monthly subscription for 8 members.",
      quantity: 1,
      unitPriceMinor: 16_000,
      taxRateBasisPoints: 0,
    },
    {
      id: "usage",
      label: "Additional document processing",
      description: "2,000 pages above the included monthly allowance.",
      quantity: 1,
      unitPriceMinor: 3_600,
      taxRateBasisPoints: 0,
    },
  ],
  notes: "Thank you for building with Northstar Cloud.",
  terms: "Paid automatically using the saved payment method.",
  legalFields: [
    { label: "Subscription", value: "sub_01J6N8V4P7YQ" },
    { label: "Payment reference", value: "pay_01J6N9BX3A2M" },
  ],
} satisfies InvoiceData;
