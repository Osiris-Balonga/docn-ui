import Link from "next/link";
import { DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { guideIndex } from "@/content/docs/guide-index";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Documentation — docn-ui",
  description:
    "Install, render and adapt source-owned PDF documents in an existing shadcn project.",
  path: "/docs/",
});

export default function DocsPage() {
  return (
    <DocumentationShell>
      <DocsArticle
        title="Documentation"
        description="Extend your shadcn project to PDF. Install the source, prepare local assets, then build documents in your own codebase."
      >
        <section aria-labelledby="available-guides">
          <h2
            id="available-guides"
            className="text-xl font-semibold tracking-tight"
          >
            Available guides
          </h2>
          <ul className="mt-4 space-y-5">
            {guideIndex.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/docs/${guide.slug}/`}
                  className="inline-flex min-h-10 items-center font-medium outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {guide.title}
                </Link>
                <p className="text-sm leading-6 text-pretty text-muted-foreground">
                  {guide.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}
