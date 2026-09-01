import Link from "next/link";
import { CodeBlock, DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata({
  title: "Getting started — docn-ui",
  description:
    "Add docn-ui PDF source to an existing shadcn project and render the first local document.",
  path: "/docs/getting-started/",
});

export default function GettingStartedPage() {
  return (
    <DocumentationShell
      sections={[
        { title: "Before you begin", href: "#before-you-begin" },
        { title: "Add the PDF layer", href: "#add-pdf-layer" },
        { title: "Your first PDF", href: "#first-pdf" },
        { title: "Theme boundaries", href: "#theme-boundaries" },
        { title: "Choose what follows", href: "#next-steps" },
      ]}
    >
      <DocsArticle
        title="Getting started"
        breadcrumb="Getting started"
        description="Start inside the shadcn project you already use. Add only the PDF source you need, render locally and keep ownership of every installed file."
      >
        <section aria-labelledby="before-you-begin">
          <h2
            id="before-you-begin"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Before you begin
          </h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              This path assumes a React and TypeScript application with shadcn
              already initialized. The quickest check is a working{" "}
              <code>components.json</code> at the application root and at least
              one shadcn component you can import.
            </p>
            <p>
              If that file does not exist, initialize shadcn for your framework
              first. Return here when its own component installation works;
              docn-ui does not replace or repeat that setup.
            </p>
          </div>
          <ExternalGuideLink href="https://ui.shadcn.com/docs/installation">
            Initialize shadcn in your framework
          </ExternalGuideLink>
        </section>
        <section aria-labelledby="add-pdf-layer">
          <h2
            id="add-pdf-layer"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Add the PDF layer, not another app
          </h2>
          <p className="mt-4 text-muted-foreground">
            docn-ui is distributed through the official shadcn CLI. The CLI
            reads your existing components.json, resolves the selected registry
            item and writes its source into a separate docn directory. It does
            not overwrite components/ui or introduce a second configuration.
          </p>
          <div className="mt-4">
            <CodeBlock label="The installation model" highlight={false}>
              {
                "your shadcn project\n  + one docn-ui registry item\n  + verified local PDF assets\n  = source-owned PDF rendering in the same application"
              }
            </CodeBlock>
          </div>
          <p className="mt-4 text-muted-foreground">
            The current registry is a mutable development registry. Use the
            exact local setup in the installation guide until an immutable
            public namespace is released.
          </p>
          <GuideLink href="/docs/installation/">
            Connect the registry and install source
          </GuideLink>
        </section>
        <section aria-labelledby="first-pdf">
          <h2
            id="first-pdf"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Render your first PDF
          </h2>
          <ol className="mt-4 list-decimal space-y-4 pl-5 text-muted-foreground marker:text-foreground">
            <li>
              Install the small text example or one template from the catalog
              through the shadcn CLI.
            </li>
            <li>
              <GuideLink href="/docs/local-assets/">
                Prepare local assets
              </GuideLink>{" "}
              on your own origin or Node filesystem.
            </li>
            <li>
              <GuideLink href="/docs/browser-and-node/">
                Run the verified browser or Node example
              </GuideLink>
              , confirm that a real PDF is produced, then replace its sample
              data.
            </li>
            <li>
              Commit the installed source and adapt it like any other shadcn
              registry item.
            </li>
          </ol>
        </section>
        <section aria-labelledby="theme-boundaries">
          <h2
            id="theme-boundaries"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Keep site and paper themes separate
          </h2>
          <p className="mt-4 text-muted-foreground">
            Your site may use shadcn CSS variables, Tailwind classes, dark mode
            and web fonts. The PDF renderer uses explicit print-safe roles for
            paper, text, muted text, accent, borders, spacing and registered
            fonts. Nothing is inherited automatically.
          </p>
          <p className="mt-4 text-muted-foreground">
            Map only deliberate choices such as a qualified brand accent. A
            white site foreground is not a valid default for text printed on
            white paper.
          </p>
          <GuideLink href="/docs/themes/">
            Map your design system deliberately
          </GuideLink>
        </section>
        <section aria-labelledby="next-steps">
          <h2
            id="next-steps"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Choose what follows
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-muted-foreground marker:text-foreground">
            <li>
              <GuideLink href="/templates/">Choose a composition</GuideLink>{" "}
              when you want a complete document.
            </li>
            <li>
              <GuideLink href="/components/">Choose PDF components</GuideLink>{" "}
              when you want to compose your own layout.
            </li>
            <li>
              <GuideLink href="/formats/">Review physical formats</GuideLink>{" "}
              before changing dimensions or printing.
            </li>
            <li>
              <GuideLink href="/docs/limitations/">
                Review qualified boundaries
              </GuideLink>{" "}
              before production use.
            </li>
          </ul>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}

function GuideLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

function ExternalGuideLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex min-h-10 items-center font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </a>
  );
}
