import type { ReceiptData } from "../schema";

export const serviceReceiptExample = {
  merchant: {
    name: "Atelier Nzela",
    address: "Poto-Poto, Brazzaville",
    contact: "atelier-nzela.example",
  },
  number: "SRV-2026-031",
  occurredAt: "2026-08-30T09:15:00.000Z",
  timeZone: "Africa/Brazzaville",
  currency: "XAF",
  lines: [
    {
      id: "consultation",
      label: "Brand consultation",
      quantity: 2,
      unitPriceMinor: 18000,
      taxRateBasisPoints: 1800,
    },
    {
      id: "proof",
      label: "Print proof preparation",
      quantity: 1,
      unitPriceMinor: 8500,
      taxRateBasisPoints: 1800,
    },
  ],
  paymentMethod: "Bank transfer",
  customer: "Common Form Studio",
  notes: "Paid in full. Keep this receipt for your records.",
} as const satisfies ReceiptData;
