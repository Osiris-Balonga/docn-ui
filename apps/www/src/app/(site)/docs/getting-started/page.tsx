import type { Metadata } from "next";
import Link from "next/link";
import { DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";

export const metadata: Metadata = {
  title: "Getting started — docn-ui",
  description:
    "Choose a template, install its source and render independently with local assets.",
};

export default function GettingStartedPage() {
  return (
    <DocumentationShell
      sections={[
        { title: "What is ready", href: "#ready-foundations" },
        { title: "Your first document", href: "#first-document" },
      ]}
    >
      <DocsArticle
        title="Getting started"
        breadcrumb="Getting started"
        description="Start with your existing shadcn project. PDF source lives in your codebase, without a separate initializer or a hosted rendering service."
      >
        <section aria-labelledby="ready-foundations">
          <h2
            id="ready-foundations"
            className="text-xl font-semibold tracking-tight"
          >
            What is ready
          </h2>
          <p className="mt-4 text-muted-foreground">
            Seventeen templates cover invoices, receipts, resumes, reports,
            badges and business cards. The catalog shows actual PDF-derived
            previews and the relevant source files. Edit data, fonts and layouts
            in your code; there is no template customization form to configure
            first.
          </p>
          <p className="mt-4 text-muted-foreground">
            Complete template installation is qualified through the official
            shadcn CLI. Individual component detail pages and component-sized
            installation are being built in L12. Development registry paths are
            mutable; no immutable public release is available yet.
          </p>
        </section>
        <section aria-labelledby="first-document">
          <h2
            id="first-document"
            className="text-xl font-semibold tracking-tight"
          >
            Your first document
          </h2>
          <ol className="mt-4 list-decimal space-y-4 pl-5">
            <li>
              <GuideLink href="/docs/installation/">Install source</GuideLink>{" "}
              into the project that already holds your components.json.
            </li>
            <li>
              <GuideLink href="/docs/local-assets/">
                Prepare local assets
              </GuideLink>{" "}
              for browser or Node rendering.
            </li>
            <li>
              <GuideLink href="/docs/browser-and-node/">
                Run the verified example
              </GuideLink>
              , then replace its data with your own.
            </li>
            <li>
              <GuideLink href="/docs/limitations/">
                Review the limitations
              </GuideLink>{" "}
              and inspect an actual-size print before production use.
            </li>
          </ol>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}

function GuideLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}
