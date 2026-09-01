import Link from "next/link";
import { CodeBlock, DocsArticle } from "@/features/docs/docs-article";
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
        { title: "The PDF layer", href: "#pdf-layer" },
        { title: "How it fits", href: "#how-it-fits" },
        { title: "Start here", href: "#start-here" },
        { title: "Guides", href: "#available-guides" },
      ]}
    >
      <DocsArticle
        title="Extend shadcn to PDF"
        description="docn-ui adds printable document source to the shadcn workflow you already use. Keep your project, your components.json and your ownership of the code."
      >
        <section aria-labelledby="pdf-layer">
          <h2
            id="pdf-layer"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            The missing PDF layer
          </h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              shadcn installs interface source into your application. docn-ui
              uses the same registry and CLI model for PDF components, templates
              and rendering helpers. It is not a hosted editor, a second project
              initializer or a parallel UI kit.
            </p>
            <p>
              Your existing shadcn setup remains authoritative. docn-ui adds a
              separate <code>docn/</code> source tree because PDF primitives run
              in a document renderer rather than the browser DOM.
            </p>
          </div>
        </section>
        <section aria-labelledby="how-it-fits">
          <h2
            id="how-it-fits"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            How it fits your project
          </h2>
          <CodeBlock label="Your existing application" highlight={false}>
            {
              "components.json       # your existing shadcn configuration\ncomponents/ui/       # your existing interface components\ndocn/                # installed PDF source\n  components/        # PDF-only primitives\n  templates/         # the compositions you choose\npublic/generated/    # verified local PDF assets"
            }
          </CodeBlock>
          <p className="mt-4 text-muted-foreground">
            Site and document themes are intentionally separate. You may map a
            brand accent or spacing decision into a PDF theme, but browser dark
            mode never turns printable text white or paper black.
          </p>
          <Link
            href="/docs/themes/"
            className="mt-3 inline-flex min-h-10 items-center font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Understand shadcn and PDF theme mapping
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
            <li>Confirm that the application has a working components.json.</li>
            <li>Add one docn-ui item with the official shadcn CLI.</li>
            <li>Prepare the verified fonts and assets used by that item.</li>
            <li>Render one local PDF, then edit the source you now own.</li>
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
