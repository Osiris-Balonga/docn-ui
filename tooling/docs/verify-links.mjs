import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { JSDOM } from "jsdom";

const output = resolve(import.meta.dirname, "../../apps/www/out");
const origin = "http://docs.invalid";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const file = join(directory, entry.name);
        return entry.isDirectory()
          ? htmlFiles(file)
          : file.endsWith(".html")
            ? [file]
            : [];
      }),
    )
  ).flat();
}

const documents = new Map();
async function readDocument(file) {
  if (!documents.has(file)) {
    documents.set(
      file,
      new JSDOM(await readFile(file, "utf8")).window.document,
    );
  }
  return documents.get(file);
}

let linkCount = 0;
const pages = (await htmlFiles(output)).filter((file) => {
  const path = relative(output, file).split(sep).join("/");
  return !/^(404(?:\/|\.html$)|_not-found\/)/.test(path);
});
assert.ok(
  pages.length > 0,
  "Build the site before checking documentation links.",
);
for (const file of pages) {
  const url = new URL(
    file
      .slice(output.length)
      .split(sep)
      .join("/")
      .replace(/index\.html$/, ""),
    origin,
  );
  const document = await readDocument(file);
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  assert.ok(canonical, `${url.pathname}: missing canonical URL.`);
  assert.equal(
    new URL(canonical).pathname,
    url.pathname,
    `${url.pathname}: canonical path does not match the page.`,
  );
  assert.ok(
    document.querySelector('meta[name="description"]')?.content.trim(),
    `${url.pathname}: missing meta description.`,
  );
  assert.ok(document.title.trim(), `${url.pathname}: missing page title.`);
  assert.match(
    document.querySelector('meta[name="robots"]')?.content ?? "",
    /noindex/i,
    `${url.pathname}: unconfigured preview builds must not be indexed.`,
  );
  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = new URL(anchor.getAttribute("href"), url);
    if (href.origin !== origin) continue;
    let target = resolve(output, `.${decodeURIComponent(href.pathname)}`);
    assert.ok(
      target === output || target.startsWith(`${output}${sep}`),
      "Link escapes static output.",
    );
    let info;
    try {
      info = await stat(target);
    } catch {
      assert.fail(`${url.pathname}: missing ${href.pathname}`);
    }
    if (info.isDirectory()) target = join(target, "index.html");
    await stat(target);
    const checksStaticFragments =
      url.pathname.startsWith("/docs/") ||
      url.pathname.startsWith("/components/") ||
      ["/formats/", "/themes/"].includes(url.pathname);
    if (href.hash && target.endsWith(".html") && checksStaticFragments) {
      assert.ok(
        (await readDocument(target)).getElementById(
          decodeURIComponent(href.hash.slice(1)),
        ),
        `${url.pathname}: missing ${href.pathname}${href.hash}`,
      );
    }
    linkCount++;
  }
  assert.equal(
    document.querySelectorAll("main h1").length,
    1,
    `${dirname(file)} must have one page heading.`,
  );
}

const publicUrls = pages
  .map(
    (file) =>
      new URL(
        file
          .slice(output.length)
          .split(sep)
          .join("/")
          .replace(/index\.html$/, ""),
        origin,
      ).pathname,
  )
  .sort();
const sitemap = await readFile(join(output, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map(([, value]) => new URL(value).pathname)
  .sort();
assert.deepEqual(
  sitemapUrls,
  publicUrls,
  "The sitemap must list every public static page exactly once.",
);
assert.doesNotMatch(sitemap, /\/(generated|r)\//);

const robots = await readFile(join(output, "robots.txt"), "utf8");
assert.match(robots, /Disallow: \/(?:\r?\n|$)/);
assert.match(robots, /Sitemap: .*\/sitemap\.xml/);
console.log(
  `Verified ${pages.length} public pages, SEO metadata and ${linkCount} local links, including anchors.`,
);
