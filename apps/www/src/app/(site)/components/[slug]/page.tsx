import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { componentCatalog } from "@docn-ui/documents/catalog/components";
import { DocsArticle, CodeBlock } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { readDocumentationCatalog } from "@/features/docs/catalog-data";
import { PdfExampleViewer } from "@/features/docs/pdf-example-viewer";
import { ComponentInstall } from "@/features/docs/component-install";

export const dynamicParams = false;
export function generateStaticParams() {
  return componentCatalog.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = componentCatalog.find((entry) => entry.slug === slug);
  return {
    title: `${entry?.title ?? "Component"} — docn-ui`,
    description: entry?.description,
  };
}
const heading = "mb-4 scroll-m-24 text-xl font-semibold tracking-tight";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { components } = await readDocumentationCatalog();
  const entry = components.find((entry) => entry.slug === slug);
  if (!entry) notFound();
  const sections = [
    "Preview",
    ...(entry.recipes.length ? ["Examples"] : []),
    "Installation",
    "Usage",
    "API reference",
    "Notes",
  ].map((title) => ({
    title,
    href: `#${title.toLowerCase().replaceAll(" ", "-")}`,
  }));
  return (
    <DocumentationShell sections={sections}>
      <DocsArticle
        title={entry.title}
        description={entry.description}
        breadcrumb={entry.title}
        rootHref="/components/"
        rootTitle="Components"
      >
        <section id="preview" aria-label="Preview" className="scroll-m-24">
          <PdfExampleViewer
            key={slug}
            title={entry.title}
            example={{ pdf: entry.pdf, pages: entry.pages }}
            itemName={`docn-${slug}`}
            code={
              <CodeBlock label={`${slug}-example.tsx`}>{entry.usage}</CodeBlock>
            }
          />
        </section>
        {entry.recipes.length ? (
          <section aria-labelledby="examples">
            <h2 id="examples" className={heading}>
              Examples
            </h2>
            <div className="space-y-10">
              {entry.recipes.map((recipe) => (
                <div key={recipe.title}>
                  <h3 className="mb-2 text-base font-medium">{recipe.title}</h3>
                  <p className="mb-4 max-w-[70ch] text-sm leading-6 text-muted-foreground">
                    {recipe.description}
                  </p>
                  <CodeBlock label={`${slug}-example.tsx`}>
                    {recipe.code}
                  </CodeBlock>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <section aria-labelledby="installation">
          <h2 id="installation" className={heading}>
            Installation
          </h2>
          <ComponentInstall slug={slug} exampleItems={entry.exampleItems} />
        </section>
        <section aria-labelledby="usage">
          <h2 id="usage" className={heading}>
            Usage
          </h2>
          <p className="mb-4 text-muted-foreground">
            The Code tab contains the exact typed example rendered above. Save
            it in <code>examples/{slug}.tsx</code> beside the installed{" "}
            <code>docn/</code> directory.
          </p>
          <p className="text-muted-foreground">
            {entry.height === 0
              ? "This example returns a page frame: place it directly inside a react-pdf Document."
              : 'Place this example inside a react-pdf Page, wrapped in PdfThemeProvider with getPdfTheme("neutral").'}{" "}
            {slug === "image"
              ? "Pass a permitted, locally resolved image as source."
              : ""}{" "}
            See{" "}
            <Link
              href="/docs/browser-and-node/"
              className="underline underline-offset-4"
            >
              rendering in Browser and Node
            </Link>
            .
          </p>
        </section>
        <section aria-labelledby="api-reference">
          <h2 id="api-reference" className={heading}>
            API reference
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Read from the exported TypeScript props. Defaults shown here come
            from parameter initializers; theme-dependent behavior is described
            in Notes.
          </p>
          {entry.api.map((api) => (
            <div key={api.name} className="mb-6">
              {entry.api.length > 1 ? (
                <h3 className="mb-3 font-medium">{api.name}</h3>
              ) : null}
              <div className="scrollbar-hidden overflow-x-auto">
                <table className="w-full min-w-[42rem] table-fixed text-left text-sm leading-6">
                  <caption className="sr-only">{api.name} properties</caption>
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="w-1/4 py-3 pr-4 font-medium" scope="col">
                        Prop
                      </th>
                      <th className="w-2/5 py-3 pr-4 font-medium" scope="col">
                        Type / default
                      </th>
                      <th className="py-3 font-medium" scope="col">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {api.props.map((prop) => (
                      <tr key={prop.name} className="border-t border-border/60">
                        <th
                          scope="row"
                          className="py-3 pr-4 align-top font-mono font-normal"
                        >
                          {prop.name}
                          {prop.required ? (
                            <span
                              className="ml-1 font-sans text-muted-foreground"
                              aria-label="required"
                            >
                              *
                            </span>
                          ) : null}
                        </th>
                        <td className="py-3 pr-4 align-top">
                          <code className="text-xs">{prop.type}</code>
                          {prop.default ? (
                            <p className="mt-1 text-muted-foreground">
                              Default: <code>{prop.default}</code>
                            </p>
                          ) : null}
                        </td>
                        <td className="py-3 align-top text-muted-foreground">
                          {prop.description ||
                            "See the component notes and source contract."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            * Required property. Source files contain the complete related
            types.
          </p>
        </section>
        <section aria-labelledby="notes">
          <h2 id="notes" className={heading}>
            Notes
          </h2>
          <p className="text-muted-foreground">{entry.notes}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            PDF primitives use document tokens, not DOM elements or Tailwind
            classes. Read the{" "}
            <Link
              href="/docs/limitations/"
              className="underline underline-offset-4"
            >
              supported boundaries
            </Link>{" "}
            before production use.
          </p>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}
