import type { ReceiptData } from "../schema";

export const hospitalityReceiptExample = {
  merchant: {
    name: "M'Pila Table",
    address: "Quai du Djoué, Brazzaville",
    contact: "reservations@mpila.example",
  },
  number: "TABLE-1842",
  occurredAt: "2026-08-30T19:45:00.000Z",
  timeZone: "Africa/Brazzaville",
  currency: "XAF",
  lines: [
    {
      id: "starter",
      label: "Plantain and avocado",
      quantity: 2,
      unitPriceMinor: 4500,
      taxRateBasisPoints: 1800,
    },
    {
      id: "main",
      label: "River fish, saka-saka",
      quantity: 2,
      unitPriceMinor: 12500,
      taxRateBasisPoints: 1800,
    },
    {
      id: "drink",
      label: "Ginger and bissap",
      quantity: 3,
      unitPriceMinor: 2800,
      taxRateBasisPoints: 1800,
    },
  ],
  paymentMethod: "Cash",
  table: "Table 08",
  order: "Order 1842",
  notes: "Service is included. Thank you for dining with us.",
} as const satisfies ReceiptData;
