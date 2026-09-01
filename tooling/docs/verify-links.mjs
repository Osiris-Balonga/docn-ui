import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
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
const pages = await htmlFiles(join(output, "docs"));
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
    if (href.hash && target.endsWith(".html")) {
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
console.log(
  `Verified ${pages.length} documentation pages and ${linkCount} local links, including anchors.`,
);
