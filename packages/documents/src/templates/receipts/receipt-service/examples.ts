import type { ReceiptData } from "../schema";

export const serviceReceiptExample = {
  merchant: {
    name: "Northstar Cloud",
    address: "48 Mercer Street, London W1F 9AN",
    contact: "billing@northstar-cloud.example",
  },
  number: "RCPT-NSC-0830",
  occurredAt: "2026-08-30T09:15:00.000Z",
  timeZone: "Europe/London",
  currency: "USD",
  lines: [
    {
      id: "subscription",
      label: "Pro workspace · Aug 30 – Sep 29",
      quantity: 1,
      unitPriceMinor: 2000,
      taxRateBasisPoints: 0,
    },
  ],
  paymentMethod: "Card ending 4242",
  customer: "Avery Morgan · Common Form Studio",
  notes: "Payment received. Keep this receipt for your records.",
} as const satisfies ReceiptData;
