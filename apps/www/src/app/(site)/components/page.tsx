import Link from "next/link";
import { componentCatalog } from "@docn-ui/documents/catalog/components";
import { DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Components — docn-ui",
  description:
    "Explore PDF components, real previews, source code and typed props.",
  path: "/components/",
});

function ComponentLink({
  slug,
  title,
  isNew = false,
}: {
  slug: string;
  title: string;
  isNew?: boolean;
}) {
  return (
    <Link
      href={`/components/${slug}/`}
      className="inline-flex min-h-10 items-center gap-2 rounded-sm text-sm font-medium outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {title}
      {isNew ? (
        <span className="size-1.5 rounded-full bg-blue-500">
          <span className="sr-only">New</span>
        </span>
      ) : null}
    </Link>
  );
}

export default function ComponentsPage() {
  return (
    <DocumentationShell>
      <DocsArticle
        title="Components"
        description="Here you can find all the PDF components available in the library. Explore their previews, code and API."
        hideBreadcrumb
      >
        <section aria-labelledby="new-components">
          <h2
            id="new-components"
            className="scroll-m-20 text-xl font-semibold tracking-tight"
          >
            New Components
          </h2>
          <div className="mt-3">
            <ComponentLink slug="barcode" title="Barcode" isNew />
          </div>
        </section>
        <section aria-labelledby="all-components">
          <h2
            id="all-components"
            className="scroll-m-20 text-xl font-semibold tracking-tight"
          >
            All Components
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
            {componentCatalog.map((entry) => (
              <li key={entry.slug}>
                <ComponentLink slug={entry.slug} title={entry.title} />
              </li>
            ))}
          </ul>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}
