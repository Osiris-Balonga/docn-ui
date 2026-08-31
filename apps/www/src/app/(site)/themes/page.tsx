import Link from "next/link";
import { DocsArticle, CodeBlock } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { readDocumentationCatalog } from "@/features/docs/catalog-data";
import { PdfExampleViewer } from "@/features/docs/pdf-example-viewer";

export const metadata = {
  title: "Themes — docn-ui",
  description:
    "Compare Neutral, Editorial and Bold PDF themes on identical document content.",
};

export default async function ThemesPage() {
  const { themes } = await readDocumentationCatalog();
  return (
    <DocumentationShell
      sections={themes.map(({ id }) => ({
        title: id[0]!.toUpperCase() + id.slice(1),
        href: `#${id}`,
      }))}
    >
      <DocsArticle
        title="Themes"
        description="The same document, three typographic directions. Every default theme starts with black ink on white paper."
        hideBreadcrumb
      >
        <p className="text-muted-foreground">
          Only the PDF tokens change below; the content and page dimensions are
          identical. Your site’s light/dark setting does not recolor the printed
          page. Map your shadcn colors explicitly with the{" "}
          <Link className="underline underline-offset-4" href="/docs/themes/">
            PDF theme guide
          </Link>
          .
        </p>
        <CodeBlock label="Select a PDF theme">
          {
            'import { getPdfTheme } from "../docn/themes/themes";\n\nconst theme = getPdfTheme("neutral"); // "editorial" or "bold"\n// Pass theme to PageFrame, DocumentFrame or PdfThemeProvider.'
          }
        </CodeBlock>
        {themes.map((theme) => (
          <section key={theme.id} aria-labelledby={theme.id}>
            <h2
              id={theme.id}
              className="mb-2 scroll-m-24 text-xl font-semibold tracking-tight capitalize"
            >
              {theme.id}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Body: {theme.tokens.fonts.body} · Headings:{" "}
              {theme.tokens.fonts.heading} · Body size:{" "}
              {theme.tokens.typeScale.body} pt
            </p>
            <PdfExampleViewer
              title={`${theme.id} theme`}
              example={{ pdf: theme.pdf, pages: theme.pages }}
            />
          </section>
        ))}
      </DocsArticle>
    </DocumentationShell>
  );
}
