import { CodeBlock, DocsArticle } from "@/features/docs/docs-article";

export default function GettingStartedPage() {
  return (
    <DocsArticle
      title="Getting started"
      breadcrumb="Getting started"
      description="Use the local development registry to inspect, install, and customize a qualified PDF template. Public release URLs are not available yet."
    >
      <section aria-labelledby="ready-foundations">
        <h2
          id="ready-foundations"
          className="text-2xl font-semibold tracking-tight"
        >
          What is ready
        </h2>
        <p className="mt-4 text-muted-foreground">
          The project generates PDFs locally in the browser, renders them with a
          local worker, and preserves physical dimensions, fonts, print boxes,
          and deterministic pagination. The business-card templates now expose
          their complete versioned source and dependency closure on each detail
          page.
        </p>
      </section>
      <section aria-labelledby="development-installation">
        <h2
          id="development-installation"
          className="text-2xl font-semibold tracking-tight"
        >
          Install from the development registry
        </h2>
        <p className="mt-4 text-muted-foreground">
          Use a React 19 TypeScript project that already has a shadcn
          <code> components.json</code>. Keep its current aliases and style.
          Start this repository locally, then copy the origin-aware command from
          a template detail page. The default static preview command for the
          minimal card is:
        </p>
        <div className="mt-5">
          <CodeBlock label="Install source">
            corepack pnpm dlx shadcn@4.19.0 add
            http://127.0.0.1:4173/r/dev/docn-business-card-minimal.json
          </CodeBlock>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Review the displayed files before installation. Run the adjacent asset
          command afterwards, and never add an overwrite flag to the documented
          update workflow. The local <code>/r/dev/</code> path is mutable until
          an immutable public release is approved.
        </p>
      </section>
    </DocsArticle>
  );
}
