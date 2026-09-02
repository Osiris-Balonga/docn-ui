import Link from "next/link";
import { DocsArticle } from "@/features/docs/docs-article";
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
        { title: "Requirements", href: "#requirements" },
        { title: "Install and render", href: "#install-and-render" },
        { title: "Next steps", href: "#next-steps" },
      ]}
    >
      <DocsArticle
        title="Getting started"
        breadcrumb="Getting started"
        description="Install one PDF document in an existing shadcn project and render it locally."
      >
        <section aria-labelledby="requirements">
          <h2
            id="requirements"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Requirements
          </h2>
          <p className="mt-4 text-muted-foreground">
            Use a React and TypeScript project with shadcn initialized and a
            working <code>components.json</code>. If you do not have one, finish
            the official framework setup first.
          </p>
          <ExternalGuideLink href="https://ui.shadcn.com/docs/installation">
            Set up shadcn
          </ExternalGuideLink>
        </section>
        <section aria-labelledby="install-and-render">
          <h2
            id="install-and-render"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Install and render
          </h2>
          <ol className="mt-4 list-decimal space-y-4 pl-5 text-muted-foreground marker:text-foreground">
            <li>
              <GuideLink href="/docs/installation/">
                Install the text example
              </GuideLink>{" "}
              with the official shadcn CLI.
            </li>
            <li>
              <GuideLink href="/docs/local-assets/">
                Prepare local assets
              </GuideLink>
              .
            </li>
            <li>
              <GuideLink href="/docs/browser-and-node/">
                Render the browser or Node example
              </GuideLink>
              , then edit the installed source and sample data.
            </li>
          </ol>
        </section>
        <section aria-labelledby="next-steps">
          <h2
            id="next-steps"
            className="text-xl font-semibold tracking-tight text-balance"
          >
            Next steps
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
              <GuideLink href="/docs/themes/">Map document themes</GuideLink>{" "}
              when you want to reuse selected brand decisions without inheriting
              the site theme.
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
