"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { templateCatalog } from "@docn-ui/documents/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterCatalog,
  serializeCatalogFilters,
  type CatalogFilters,
} from "./catalog-filter";

const formatOptions = [
  { id: "card-85x55", label: "85 × 55 mm" },
  { id: "card-90x50", label: "90 × 50 mm" },
  { id: "card-us", label: "US · 88.9 × 50.8 mm" },
] as const;

function readFilters(searchParams: URLSearchParams): CatalogFilters {
  const family = searchParams.get("family");
  const format = searchParams.get("format");
  return {
    q: searchParams.get("q") ?? undefined,
    family: family === "business-card" ? family : undefined,
    format: formatOptions.some((option) => option.id === format)
      ? (format ?? undefined)
      : undefined,
  };
}

export function TemplateCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const results = filterCatalog(templateCatalog, filters);

  function updateFilters(next: CatalogFilters) {
    const query = serializeCatalogFilters(next);
    router.replace(query ? `/templates/?${query}` : "/templates/", {
      scroll: false,
    });
  }

  const resultLabel = `${results.length} ${results.length === 1 ? "template" : "templates"}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
      <header className="max-w-3xl">
        <p className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
          Template catalog
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Start from a document that fits the format.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Browse real PDF compositions, then edit validated data and export the
          exact preview locally in your browser.
        </p>
      </header>

      <section
        aria-labelledby="catalog-filters"
        className="mt-10 border-y py-5"
      >
        <h2 id="catalog-filters" className="sr-only">
          Catalog filters
        </h2>
        <div className="grid gap-4 md:grid-cols-[minmax(15rem,1fr)_13rem_13rem_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="template-search">Search templates</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="template-search"
                value={filters.q ?? ""}
                placeholder="Name, style, or capability"
                className="pl-8"
                onChange={(event) =>
                  updateFilters({ ...filters, q: event.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-family">Family</Label>
            <Select
              value={filters.family ?? "all"}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  family: value && value !== "all" ? value : undefined,
                })
              }
            >
              <SelectTrigger id="template-family" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All families</SelectItem>
                <SelectItem value="business-card">Business cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-format">Format</Label>
            <Select
              value={filters.format ?? "all"}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  format: value && value !== "all" ? value : undefined,
                })
              }
            >
              <SelectTrigger id="template-format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                {formatOptions.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            className="justify-self-start md:mb-0.5"
            disabled={!filters.q && !filters.family && !filters.format}
            onClick={() => updateFilters({})}
          >
            <X aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      </section>

      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="text-sm font-medium" aria-live="polite">
          {resultLabel}
        </p>
        <p className="hidden text-sm text-muted-foreground sm:block">
          All thumbnails come from the generated PDFs.
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((template) => (
            <li key={template.id}>
              <Link
                href={`/templates/${template.slug}/`}
                className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border bg-muted/35 p-7 transition-colors group-hover:border-foreground/25 sm:p-9">
                  <Image
                    src={template.thumbnail.src}
                    alt={`${template.title} PDF preview`}
                    width={template.thumbnail.width}
                    height={template.thumbnail.height}
                    className="h-auto w-full shadow-lg ring-1 ring-foreground/10 transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none"
                  />
                </div>
                <div className="px-1 pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-primary">
                        {template.familyLabel}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">
                        {template.title}
                      </h2>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{template.sides} sides</Badge>
                    <Badge variant="outline">
                      {template.supportedFormatIds.length} formats
                    </Badge>
                    {template.capabilities.qr ? (
                      <Badge variant="outline">Vector QR</Badge>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="mt-5 rounded-xl border border-dashed px-6 py-14 text-center">
          <h2 className="text-lg font-semibold">No templates found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Try a different name or remove one of the active filters.
          </p>
          <Button
            className="mt-5"
            variant="outline"
            onClick={() => updateFilters({})}
          >
            Clear all filters
          </Button>
        </section>
      )}
    </div>
  );
}
