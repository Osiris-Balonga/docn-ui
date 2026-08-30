import { describe, expect, it } from "vitest";
import { DocumentValidationError } from "../../core/errors";
import { parseInvoiceData } from "./schema";

const invoice = {
  seller: { name: "Atelier Nzela", address: ["14 avenue des Arts"] },
  customer: { name: "Common Form Studio", address: ["21 Market Street"] },
  number: "INV-2026-0042",
  issueDate: "2026-08-30",
  dueDate: "2026-09-29",
  currency: "EUR",
  lines: [
    {
      id: "identity-system",
      label: "Identity system",
      quantity: 1,
      unitPriceMinor: 240_000,
      taxRateBasisPoints: 2_000,
    },
  ],
  legalFields: [{ label: "Registration", value: "RCCM CG-BZV-01" }],
} as const;

describe("invoice contract", () => {
  it("accepts bounded parties, dates, lines, and legal fields", () => {
    expect(parseInvoiceData(invoice)).toMatchObject({
      number: "INV-2026-0042",
      currency: "EUR",
    });
  });

  it("rejects duplicate identifiers and rows too tall for one page", () => {
    expect(() =>
      parseInvoiceData({
        ...invoice,
        lines: [
          invoice.lines[0],
          { ...invoice.lines[0], label: "1\n2\n3\n4\n5\n6" },
        ],
      }),
    ).toThrow(DocumentValidationError);
    try {
      parseInvoiceData({
        ...invoice,
        lines: [
          invoice.lines[0],
          { ...invoice.lines[0], label: "1\n2\n3\n4\n5\n6" },
        ],
      });
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_DATA" });
      expect((error as DocumentValidationError).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "LAYOUT_OVERFLOW",
            path: ["data", "lines", 1, "label"],
          }),
        ]),
      );
    }
  });

  it("rejects a due date before the issue date", () => {
    expect(() =>
      parseInvoiceData({ ...invoice, dueDate: "2026-08-29" }),
    ).toThrow(/Due date cannot be earlier/);
  });
});
