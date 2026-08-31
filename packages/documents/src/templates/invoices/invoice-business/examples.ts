import type { InvoiceData } from "../schema";

export const businessInvoiceExample = {
  seller: {
    name: "Kivu Advisory Group",
    address: ["8 Boulevard du Commerce", "Gombe, Kinshasa"],
    email: "finance@kivu-advisory.example",
    phone: "+243 81 555 09 11",
    taxIdentifier: "ID NAT 01-B4200-N2026",
  },
  customer: {
    name: "Makala Infrastructure",
    address: ["45 Industrial Avenue", "Lubumbashi"],
    email: "payables@makala.example",
    taxIdentifier: "ID NAT 06-A0311-K2025",
  },
  number: "KA-2026-118",
  issueDate: "2026-08-30",
  dueDate: "2026-09-14",
  currency: "USD",
  project: "Operations review - Q3",
  lines: [
    {
      id: "assessment",
      label: "Operational assessment",
      description:
        "Stakeholder interviews, process review, and findings synthesis.",
      quantity: 1,
      unitPriceMinor: 380_000,
      taxRateBasisPoints: 1_600,
    },
    {
      id: "workshops",
      label: "Implementation workshops",
      quantity: 3,
      unitPriceMinor: 95_000,
      taxRateBasisPoints: 1_600,
    },
    {
      id: "roadmap",
      label: "Executive roadmap",
      quantity: 1,
      unitPriceMinor: 165_000,
      taxRateBasisPoints: 1_600,
    },
  ],
  notes: "Please reference the invoice number with your payment.",
  terms: "Payment due within 15 days. Prices exclude applicable taxes.",
  legalFields: [
    { label: "Registration", value: "RCCM CD/KIN/RCCM/26-B-118" },
    { label: "Bank reference", value: "KIVU-OPS-Q3" },
  ],
} satisfies InvoiceData;
