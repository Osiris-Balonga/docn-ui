import { DOCUMENT_LIMITS } from "../core/contracts";
import { DocumentValidationError } from "../core/errors";

export function assertDestinationId(id: string): void {
  if (typeof id !== "string" || !/^[A-Za-z][A-Za-z0-9_.:-]{0,127}$/.test(id)) {
    throw new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "Use a destination ID starting with a letter and at most 128 safe characters.",
        path: ["id"],
      },
    ]);
  }
}

export function validateLink(href: string, label: string): string {
  const invalid = () =>
    new DocumentValidationError([
      {
        code: "INVALID_DATA",
        message:
          "Provide a readable label and an explicit HTTP(S), mailto, tel or internal destination link.",
        path: ["href"],
      },
    ]);
  if (
    typeof href !== "string" ||
    typeof label !== "string" ||
    !label.trim() ||
    label.length > DOCUMENT_LIMITS.generalStringCharacters ||
    href.length > DOCUMENT_LIMITS.generalStringCharacters ||
    /[\u0000-\u0020\u007f\\]/.test(href)
  )
    throw invalid();
  if (href.startsWith("#")) {
    assertDestinationId(href.slice(1));
    return href;
  }
  if (/^mailto:[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(href))
    return href;
  if (/^tel:\+?[0-9][0-9().-]{2,30}$/.test(href)) return href;
  try {
    const url = new URL(href);
    if (
      !/^https?:\/\//i.test(href) ||
      !["http:", "https:"].includes(url.protocol) ||
      !url.hostname ||
      url.username ||
      url.password
    )
      throw invalid();
  } catch {
    throw invalid();
  }
  return href;
}
