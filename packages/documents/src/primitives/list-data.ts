import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";

export interface ListItem {
  text: string;
  description?: string;
  checked?: boolean;
  children?: readonly ListItem[];
}

export const LIST_LIMITS = { items: 100, depth: 3 } as const;

export function assertListItems(items: readonly ListItem[]): void {
  let count = 0;
  function visit(group: readonly ListItem[], depth: number) {
    if (!Array.isArray(group)) invalid("List items must be an array.");
    if (depth > LIST_LIMITS.depth || count + group.length > LIST_LIMITS.items)
      invalid(
        "Lists support at most 100 items and three nesting levels.",
        "LIMIT_EXCEEDED",
      );
    count += group.length;
    for (const item of group) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.text !== "string" ||
        !item.text.trim() ||
        item.text.length > DOCUMENT_LIMITS.generalStringCharacters ||
        (item.description !== undefined &&
          (typeof item.description !== "string" ||
            item.description.length >
              DOCUMENT_LIMITS.generalStringCharacters)) ||
        (item.checked !== undefined && typeof item.checked !== "boolean")
      )
        invalid(
          "Each list item needs bounded text and valid optional description/check state.",
        );
      if (item.children !== undefined) visit(item.children, depth + 1);
    }
  }
  visit(items, 1);
}

function invalid(
  message: string,
  code: "INVALID_DATA" | "LIMIT_EXCEEDED" = "INVALID_DATA",
): never {
  throw new DocumentValidationError([{ code, message, path: ["items"] }]);
}
