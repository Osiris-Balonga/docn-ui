import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getTemplateCatalogEntry,
  templateCatalog,
} from "@docn-ui/documents/catalog";
import { TemplateCatalog } from "@/features/catalog/template-catalog";

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

  return <TemplateCatalog featuredSlug={template.slug} />;
}
