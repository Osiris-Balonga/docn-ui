import type { TemplateCatalogEntry } from "@docn-ui/documents/catalog";

export const PUBLIC_CATALOG_FILTERS = ["q", "family", "format"] as const;

export interface CatalogFilters {
  family?: string | undefined;
  format?: string | undefined;
  q?: string | undefined;
}

export function filterCatalog(
  entries: readonly TemplateCatalogEntry[],
  filters: CatalogFilters,
) {
  const query = filters.q?.trim().toLocaleLowerCase("en") ?? "";
  return entries.filter((entry) => {
    if (filters.family && entry.family !== filters.family) return false;
    if (filters.format && !entry.supportedFormatIds.includes(filters.format))
      return false;
    if (!query) return true;
    const searchable = [
      entry.title,
      entry.description,
      entry.familyLabel,
      ...entry.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("en");
    return searchable.includes(query);
  });
}

export function serializeCatalogFilters(filters: CatalogFilters) {
  const params = new URLSearchParams();
  const query = filters.q?.trim();
  if (query) params.set("q", query);
  if (filters.family) params.set("family", filters.family);
  if (filters.format) params.set("format", filters.format);
  return params.toString();
}
