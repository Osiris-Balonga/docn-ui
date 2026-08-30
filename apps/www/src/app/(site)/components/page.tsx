import { Badge } from "@/components/ui/badge";
import { DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";

const components = [
  "PageFrame",
  "Stack",
  "Row",
  "Separator",
  "Heading",
  "Text",
  "FieldPair",
  "Image",
  "QRCode",
] as const;

function ComponentName({
  children,
  isNew = false,
}: {
  children: string;
  isNew?: boolean;
}) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 text-sm font-medium">
      {children}
      {isNew ? (
        <Badge className="h-4 rounded-full border-0 bg-blue-600 px-1.5 text-[10px] leading-none text-white dark:bg-blue-500">
          New
        </Badge>
      ) : null}
    </span>
  );
}

export default function ComponentsPage() {
  return (
    <DocumentationShell>
      <DocsArticle
        title="Components"
        description="Here you can find all the PDF components available in the library. We are working on adding more components."
        hideBreadcrumb
      >
        <section aria-labelledby="new-components">
          <h2
            id="new-components"
            className="scroll-m-20 text-xl font-semibold tracking-tight"
          >
            New Components
          </h2>
          <div className="mt-3">
            <ComponentName isNew>QRCode</ComponentName>
          </div>
        </section>

        <section aria-labelledby="all-components">
          <h2
            id="all-components"
            className="scroll-m-20 text-xl font-semibold tracking-tight"
          >
            All Components
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
            {components.map((component) => (
              <li key={component}>
                <ComponentName isNew={component === "QRCode"}>
                  {component}
                </ComponentName>
              </li>
            ))}
          </ul>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}
