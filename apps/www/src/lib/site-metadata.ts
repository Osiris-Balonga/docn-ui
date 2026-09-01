import type { Metadata } from "next";

const localSiteUrl = "http://127.0.0.1:3000";

function readSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (!configured) return new URL(localSiteUrl);
  const url = new URL(configured);
  if (
    url.protocol !== "https:" &&
    !["127.0.0.1", "localhost"].includes(url.hostname)
  )
    throw new Error("SITE_URL must use HTTPS unless it targets loopback.");
  if (url.pathname !== "/" || url.search || url.hash)
    throw new Error(
      "SITE_URL must be an origin without a path, query, or fragment.",
    );
  return url;
}

export const siteUrl = readSiteUrl();
export const siteIsIndexable =
  Boolean(process.env.SITE_URL?.trim()) &&
  process.env.DOCN_ALLOW_INDEXING === "true";

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: `/${string}`;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: new URL(path, siteUrl) },
  };
}
