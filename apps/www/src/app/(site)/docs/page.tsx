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
    <DocumentationShell
      sections={[
        { title: "What docn-ui adds", href: "#what-docn-adds" },
        { title: "Start here", href: "#start-here" },
        { title: "Guides", href: "#available-guides" },
      ]}
    >
      <DocsArticle
        title="Extend shadcn to PDF"
        description="docn-ui adds printable document source to the shadcn workflow you already use. Keep your project, your components.json and your ownership of the code."
      >
        <section aria-labelledby="what-docn-adds">
          <h2
            id="what-docn-adds"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            What docn-ui adds
          </h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              Install PDF components and templates with the official shadcn CLI,
              then edit the source in your application. Your existing
              <code> components.json</code>, aliases and UI components stay in
              place.
            </p>
            <p>
              Installed document source lives under <code>docn/</code>. It uses
              PDF primitives and print-safe tokens rather than browser DOM,
              Tailwind classes or automatic site-theme inheritance.
            </p>
          </div>
          <Link
            href="/docs/themes/"
            className="mt-3 inline-flex min-h-10 items-center font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Understand document themes
          </Link>
        </section>
        <section aria-labelledby="start-here">
          <h2
            id="start-here"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Start from the project you have
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted-foreground marker:text-foreground">
            <li>Start from a working shadcn React project.</li>
            <li>Install one document with the shadcn CLI.</li>
            <li>Prepare its assets and render the PDF locally.</li>
          </ol>
          <Link
            href="/docs/getting-started/"
            className="mt-4 inline-flex min-h-10 items-center font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Follow the shadcn-first quick start
          </Link>
        </section>
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
