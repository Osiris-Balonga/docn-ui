import { describe, expect, it } from "vitest";
import { DocumentValidationError } from "../../core/errors";
import {
  parseReceiptData,
  RECEIPT_LINE_LIMIT,
  type ReceiptData,
} from "./schema";

const receipt = {
  merchant: { name: "Nzela Corner Store", address: "Brazzaville" },
  number: "RCPT-2026-0042",
  occurredAt: "2026-08-30T12:00:00.000Z",
  timeZone: "Africa/Brazzaville",
  currency: "XAF",
  lines: [
    {
      id: "cassava-flour",
      label: "Roasted cassava flour",
      quantity: 2,
      unitPriceMinor: 2_500,
      taxRateBasisPoints: 1_800,
    },
  ],
  paymentMethod: "Mobile money",
} as const satisfies ReceiptData;

describe("receipt data contract", () => {
  it("accepts a strict receipt with explicit currency and integer lines", () => {
    expect(parseReceiptData(receipt)).toEqual(receipt);
  });

  it("rejects sensitive payment data and the shared line limit", () => {
    const cases = [
      {
        data: { ...receipt, paymentMethod: "Visa 4111 1111 1111 1111" },
        code: "INVALID_DATA",
        path: ["data", "paymentMethod"],
      },
      {
        data: {
          ...receipt,
          lines: Array.from({ length: RECEIPT_LINE_LIMIT + 1 }, (_, index) => ({
            ...receipt.lines[0],
            id: `line-${index}`,
          })),
        },
        code: "LIMIT_EXCEEDED",
        path: ["data", "lines"],
      },
    ];

    for (const fixture of cases) {
      try {
        parseReceiptData(fixture.data);
        throw new Error("Expected receipt validation to fail.");
      } catch (error) {
        expect(error).toBeInstanceOf(DocumentValidationError);
        expect(error).toMatchObject({ code: fixture.code });
        expect((error as DocumentValidationError).issues[0]?.path).toEqual(
          fixture.path,
        );
      }
    }
  });
});
