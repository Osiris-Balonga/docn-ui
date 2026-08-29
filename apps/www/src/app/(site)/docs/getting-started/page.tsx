export default function GettingStartedPage() {
  return (
    <article className="max-w-[72ch]">
      <p className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
        Foundations
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Getting started
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        docn-ui is under active development. The PDF pipeline is qualified, but
        the public registry and installable templates are not available yet.
      </p>
      <h2 className="mt-10 text-2xl font-semibold tracking-tight">
        What is ready
      </h2>
      <p className="mt-4 leading-7 text-muted-foreground">
        The project can generate PDFs locally in the browser, render them with a
        local worker, and preserve physical dimensions, fonts, print boxes, and
        deterministic pagination. The next lots turn those foundations into
        reusable document primitives and templates.
      </p>
    </article>
  );
}
