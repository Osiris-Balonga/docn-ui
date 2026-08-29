import { CodeBlock, DocsArticle } from "@/features/docs/docs-article";

export default function GettingStartedPage() {
  return (
    <DocsArticle
      title="Getting started"
      breadcrumb="Getting started"
      description="docn-ui is under active development. The PDF pipeline is qualified, but the public registry and installable templates are not available yet."
    >
      <section aria-labelledby="ready-foundations">
        <h2
          id="ready-foundations"
          className="text-2xl font-semibold tracking-tight"
        >
          What is ready
        </h2>
        <p className="mt-4 text-muted-foreground">
          The project can generate PDFs locally in the browser, render them with
          a local worker, and preserve physical dimensions, fonts, print boxes,
          and deterministic pagination. The next lots turn those foundations
          into reusable document primitives and templates.
        </p>
      </section>
      <section aria-labelledby="planned-installation">
        <h2
          id="planned-installation"
          className="text-2xl font-semibold tracking-tight"
        >
          Planned installation model
        </h2>
        <p className="mt-4 text-muted-foreground">
          The public registry command below documents the intended interface. It
          is not published yet and should not be run until the registry lot is
          complete.
        </p>
        <div className="mt-5">
          <CodeBlock label="Planned command">
            npx shadcn@latest add @docn-ui/business-card
          </CodeBlock>
        </div>
      </section>
    </DocsArticle>
  );
}
