import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findGuide, guideIndex } from "@/content/docs/guide-index";
import { GuideArticle } from "@/features/docs/guide-article";

export const dynamicParams = false;

export function generateStaticParams() {
  return guideIndex.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();
  return { title: `${guide.title} — docn-ui`, description: guide.description };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();
  return <GuideArticle slug={guide.slug} />;
}
