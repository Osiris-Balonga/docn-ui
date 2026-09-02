import { DocumentValidationError } from "../core/errors";

export function assertPrintText(
  value: string,
  path: string,
  maximum = 128,
): void {
  if (typeof value !== "string" || !value.trim() || value.length > maximum)
    invalidPrintData(
      `Expected nonempty text of at most ${maximum} characters.`,
      path,
    );
}

export function invalidPrintData(message: string, path: string): never {
  throw new DocumentValidationError([
    { code: "INVALID_DATA", message, path: [path] },
  ]);
}

export interface FormField {
  /** Unique field identifier across all groups. */
  id: string;
  /** Printed field label. */
  label: string;
  /** Optional prefilled printable value. */
  value?: string;
  /** Whether the label prints a required marker. */
  required?: boolean;
}

export interface FormGroup {
  /** Unique group identifier. */
  id: string;
  /** Printed group heading. */
  title: string;
  /** One, two or three equal printable columns. */
  columns?: 1 | 2 | 3;
  /** Ordered printable fields in the group. */
  fields: readonly FormField[];
}

export function assertFormGroups(groups: readonly FormGroup[]): void {
  if (!Array.isArray(groups) || !groups.length || groups.length > 12)
    invalidPrintData("A form needs one to twelve groups.", "groups");
  const groupIds = new Set<string>();
  const fieldIds = new Set<string>();
  for (const group of groups) {
    if (!group || typeof group !== "object")
      invalidPrintData("Expected a form group.", "groups");
    assertPrintText(group.id, "group.id");
    assertPrintText(group.title, "group.title");
    if (groupIds.has(group.id))
      invalidPrintData("Group IDs must be unique.", "group.id");
    groupIds.add(group.id);
    if (group.columns !== undefined && ![1, 2, 3].includes(group.columns))
      invalidPrintData(
        "Groups support one, two or three columns.",
        "group.columns",
      );
    if (!Array.isArray(group.fields) || !group.fields.length)
      invalidPrintData("Every group needs fields.", "group.fields");
    if (fieldIds.size + group.fields.length > 60)
      invalidPrintData("A form supports at most 60 fields.", "group.fields");
    for (const field of group.fields) {
      if (!field || typeof field !== "object")
        invalidPrintData("Expected a printable field.", "field");
      assertPrintText(field.id, "field.id");
      assertPrintText(field.label, "field.label");
      if (fieldIds.has(field.id))
        invalidPrintData("Field IDs must be unique across groups.", "field.id");
      fieldIds.add(field.id);
      if (field.value !== undefined && field.value !== "")
        assertPrintText(field.value, "field.value", 2000);
      if (field.required !== undefined && typeof field.required !== "boolean")
        invalidPrintData("Required must be a boolean.", "field.required");
    }
  }
}

export interface Signer {
  /** Printed signer-area label. */
  label: string;
  /** Optional printed signer name. */
  name?: string;
  /** Optional printed role or capacity. */
  role?: string;
  /** Optional printed date or date prompt. */
  date?: string;
}

export interface SignatureProps {
  /** One or two signer definitions. */
  signers: readonly Signer[];
  /** Stack metadata below the line or place it alongside the signing area. */
  layout?: "stacked" | "inline";
  /** Reserved handwritten-signature height in PDF points. */
  space?: number;
}

export function assertSignature({
  signers,
  layout = "stacked",
  space = 40,
}: SignatureProps): void {
  if (layout !== "stacked" && layout !== "inline")
    invalidPrintData("Unknown signature layout.", "layout");
  if (
    !Array.isArray(signers) ||
    signers.length < 1 ||
    signers.length > 2 ||
    (layout === "inline" && signers.length !== 1)
  )
    invalidPrintData(
      "Use one or two signers, or one signer inline.",
      "signers",
    );
  if (!Number.isFinite(space) || space < 24 || space > 96)
    invalidPrintData("Signature writing space must be 24–96 points.", "space");
  for (const signer of signers) {
    if (!signer || typeof signer !== "object")
      invalidPrintData("Expected a signer.", "signers");
    assertPrintText(signer.label, "signer.label");
    for (const key of ["name", "role", "date"] as const)
      if (signer[key] !== undefined)
        assertPrintText(signer[key], `signer.${key}`);
  }
}
