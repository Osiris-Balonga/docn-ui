import Link from "next/link";
import { DocsArticle, CodeBlock } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { readDocumentationCatalog } from "@/features/docs/catalog-data";

export const metadata = {
  title: "Formats — docn-ui",
  description:
    "Supported PDF page sizes, safe areas and template compatibility in millimeters.",
};

export default async function FormatsPage() {
  const { formats } = await readDocumentationCatalog();
  return (
    <DocumentationShell
      sections={formats.map(({ id }) => ({ title: id, href: `#${id}` }))}
    >
      <DocsArticle
        title="Formats"
        description="Physical dimensions from the document contracts. Choose a format before composing its content."
        hideBreadcrumb
      >
        <p className="text-muted-foreground">
          Dimensions are in millimeters. Safe areas are insets from the trim
          edge, not bleed. DocumentFrame supports portrait A4 and Letter;
          PageFrame is for fixed single-page layouts. Receipt templates measure
          their own continuous height. See{" "}
          <Link
            href="/docs/formats-and-printing/"
            className="underline underline-offset-4"
          >
            printing guidance
          </Link>
          .
        </p>
        <CodeBlock label="Resolve a format">
          {
            'import { resolveFormat } from "../docn/core/formats";\n\nconst page = resolveFormat("a4");\nconst label = resolveFormat("label-custom", { widthMm: 80, heightMm: 40 });'
          }
        </CodeBlock>
        {formats.map((format) => (
          <section key={format.id} aria-labelledby={format.id}>
            <h2
              id={format.id}
              className="scroll-m-24 text-xl font-semibold tracking-tight"
            >
              {format.id}
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Dimensions</dt>
              <dd>
                {format.kind === "custom-fixed"
                  ? `${format.widthRangeMm.join("–")} × ${format.heightRangeMm.join("–")} mm`
                  : format.kind === "continuous"
                    ? `${format.widthMm} mm wide · measured height up to ${format.maxHeightMm} mm`
                    : `${format.widthMm} × ${format.heightMm} mm`}
              </dd>
              <dt className="text-muted-foreground">Safe area</dt>
              <dd>{format.safeAreaMm} mm</dd>
              <dt className="text-muted-foreground">Orientation</dt>
              <dd>
                {format.kind === "continuous"
                  ? "Continuous roll"
                  : `${format.allowedOrientations.join(" / ")} · default ${format.defaultOrientation}`}
              </dd>
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              Compatible templates
            </p>
            <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {format.templates.map((template) => (
                <li key={template.slug}>
                  <Link
                    className="inline-flex min-h-10 items-center underline underline-offset-4"
                    href={`/templates/?family=${template.family}`}
                  >
                    {template.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </DocsArticle>
    </DocumentationShell>
  );
}
