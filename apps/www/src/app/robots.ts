import type { MetadataRoute } from "next";
import { siteIsIndexable, siteUrl } from "@/lib/site-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteIsIndexable
      ? { userAgent: "*", allow: "/", disallow: ["/generated/", "/r/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
