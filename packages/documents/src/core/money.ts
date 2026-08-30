import { DocumentValidationError } from "./errors";

export const CURRENCIES = {
  EUR: { code: "EUR", exponent: 2 },
  USD: { code: "USD", exponent: 2 },
  XAF: { code: "XAF", exponent: 0 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export interface MonetaryLineInput {
  quantity: number;
  taxRateBasisPoints: number;
  unitPriceMinor: number;
}

export interface MonetaryLineTotals {
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
}

export interface MonetaryDocumentTotals extends MonetaryLineTotals {
  lines: readonly MonetaryLineTotals[];
}

const BASIS_POINTS_PER_UNIT = 10_000n;
const HALF_BASIS_POINT_UNIT = BASIS_POINTS_PER_UNIT / 2n;
const MAX_SAFE_MINOR = BigInt(Number.MAX_SAFE_INTEGER);

function limitError(message: string, path: readonly (number | string)[]) {
  return new DocumentValidationError([
    { code: "LIMIT_EXCEEDED", message, path },
  ]);
}

function assertSafeNonNegativeInteger(
  value: number,
  label: string,
  path: readonly (number | string)[],
): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw limitError(`${label} must be a non-negative safe integer.`, path);
  }
}

function toSafeMinor(
  value: bigint,
  path: readonly (number | string)[],
): number {
  if (value > MAX_SAFE_MINOR) {
    throw limitError(
      "The calculated monetary amount exceeds the safe integer limit.",
      path,
    );
  }
  return Number(value);
}

export function calculateMonetaryLine(
  line: MonetaryLineInput,
  path: readonly (number | string)[] = ["data", "lines"],
): MonetaryLineTotals {
  assertSafeNonNegativeInteger(line.quantity, "Quantity", [
    ...path,
    "quantity",
  ]);
  assertSafeNonNegativeInteger(line.unitPriceMinor, "Unit price", [
    ...path,
    "unitPriceMinor",
  ]);
  assertSafeNonNegativeInteger(line.taxRateBasisPoints, "Tax rate", [
    ...path,
    "taxRateBasisPoints",
  ]);
  if (line.taxRateBasisPoints > 10_000) {
    throw limitError("Tax rate cannot exceed 10,000 basis points.", [
      ...path,
      "taxRateBasisPoints",
    ]);
  }

  const subtotal = BigInt(line.quantity) * BigInt(line.unitPriceMinor);
  const tax =
    (subtotal * BigInt(line.taxRateBasisPoints) + HALF_BASIS_POINT_UNIT) /
    BASIS_POINTS_PER_UNIT;
  const total = subtotal + tax;

  return {
    subtotalMinor: toSafeMinor(subtotal, [...path, "subtotalMinor"]),
    taxMinor: toSafeMinor(tax, [...path, "taxMinor"]),
    totalMinor: toSafeMinor(total, [...path, "totalMinor"]),
  };
}

export function calculateMonetaryDocument(
  inputs: readonly MonetaryLineInput[],
): MonetaryDocumentTotals {
  let subtotal = 0n;
  let tax = 0n;
  const lines = inputs.map((line, index) => {
    const totals = calculateMonetaryLine(line, ["data", "lines", index]);
    subtotal += BigInt(totals.subtotalMinor);
    tax += BigInt(totals.taxMinor);
    return totals;
  });
  const total = subtotal + tax;

  return {
    lines,
    subtotalMinor: toSafeMinor(subtotal, ["data", "subtotalMinor"]),
    taxMinor: toSafeMinor(tax, ["data", "taxMinor"]),
    totalMinor: toSafeMinor(total, ["data", "totalMinor"]),
  };
}

export function formatMinorAmount(
  amountMinor: number,
  currency: CurrencyCode,
  locale: "en" | "fr",
): string {
  assertSafeNonNegativeInteger(amountMinor, "Amount", ["amountMinor"]);
  const definition = CURRENCIES[currency];
  const divisor = 10 ** definition.exponent;
  const major = Math.trunc(amountMinor / divisor);
  const minor = amountMinor % divisor;
  const groupedMajor = new Intl.NumberFormat(
    locale === "fr" ? "fr-FR" : "en-US",
    {
      maximumFractionDigits: 0,
      useGrouping: true,
    },
  ).format(major);
  const numeric =
    definition.exponent === 0
      ? groupedMajor
      : `${groupedMajor}${locale === "fr" ? "," : "."}${minor
          .toString()
          .padStart(definition.exponent, "0")}`;
  return `${numeric} ${currency}`;
}
