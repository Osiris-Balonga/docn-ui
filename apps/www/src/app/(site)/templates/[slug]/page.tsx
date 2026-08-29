import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTemplateCatalogEntry,
  templateCatalog,
} from "@docn-ui/documents/catalog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BusinessCardPlayground } from "@/features/playground/business-card-playground";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return templateCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateCatalogEntry(slug);
  if (!template) return {};
  return {
    title: `${template.title} — docn-ui`,
    description: template.description,
  };
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplateCatalogEntry(slug);
  if (!template) notFound();

  if (template.id === "business-card-minimal") {
    return <BusinessCardPlayground />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:px-12">
      <Link
        href="/templates/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All templates
      </Link>
      <div className="mt-7 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{template.familyLabel}</Badge>
            <Badge variant="outline">{template.sides} sides</Badge>
            <Badge variant="outline">
              {template.supportedFormatIds.length} formats
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            {template.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {template.description}
          </p>
          <p className="mt-7 max-w-xl text-sm leading-6 text-muted-foreground">
            This composition is already rendered from its source. Its reusable
            live editor is being connected in the current implementation lot.
          </p>
          <Link
            href="/templates/business-card-minimal/"
            className={cn(buttonVariants(), "mt-6")}
          >
            Try the live editor
          </Link>
        </div>
        <div className="flex aspect-[4/3] items-center rounded-xl border bg-muted/35 p-8">
          <Image
            src={template.thumbnail.src}
            alt={`${template.title} PDF preview`}
            width={template.thumbnail.width}
            height={template.thumbnail.height}
            className="h-auto w-full shadow-lg ring-1 ring-foreground/10"
            priority
          />
        </div>
      </div>
    </div>
  );
}
