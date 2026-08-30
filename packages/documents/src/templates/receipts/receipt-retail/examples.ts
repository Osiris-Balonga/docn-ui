import type { ReceiptData } from "../schema";

export const retailReceiptExample = {
  merchant: {
    name: "Nzela Corner Store",
    address: "14 avenue des Arts, Brazzaville",
    contact: "+242 06 555 01 24",
    taxIdentifier: "NIU M2400012345",
  },
  number: "RCPT-2026-0042",
  occurredAt: "2026-08-30T12:00:00.000Z",
  timeZone: "Africa/Brazzaville",
  currency: "XAF",
  lines: [
    {
      id: "cassava",
      label: "Roasted cassava flour",
      quantity: 2,
      unitPriceMinor: 2500,
      taxRateBasisPoints: 1800,
    },
    {
      id: "coffee",
      label: "Kivu coffee beans",
      quantity: 1,
      unitPriceMinor: 6800,
      taxRateBasisPoints: 1800,
    },
    {
      id: "soap",
      label: "Handmade shea soap",
      quantity: 3,
      unitPriceMinor: 1800,
      taxRateBasisPoints: 0,
    },
  ],
  paymentMethod: "Mobile money",
  notes: "Thank you for shopping locally.",
} as const satisfies ReceiptData;
