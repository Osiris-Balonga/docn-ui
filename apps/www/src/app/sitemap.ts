import type { MetadataRoute } from "next";
import { knownPages } from "@/features/docs/page-index";
import { siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...new Set(knownPages.map(({ href }) => href))]
    .sort()
    .map((path) => ({ url: new URL(path, siteUrl).href }));
}
