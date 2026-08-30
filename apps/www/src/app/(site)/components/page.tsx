import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DocsArticle } from "@/features/docs/docs-article";
import { DocumentationShell } from "@/features/docs/documentation-shell";
import { cn } from "@/lib/utils";

const layoutPrimitives = [
  {
    name: "PageFrame",
    description:
      "Creates the physical page, safe frame, bleed, and crop marks.",
  },
  {
    name: "Stack",
    description: "Arranges document content vertically with theme spacing.",
  },
  {
    name: "Row",
    description: "Aligns related content horizontally inside a PDF page.",
  },
  {
    name: "Separator",
    description: "Adds a measured rule using document theme tokens.",
  },
] as const;

const contentPrimitives = [
  {
    name: "Heading",
    description: "Renders display and heading text with embedded local fonts.",
  },
  {
    name: "Text",
    description: "Renders validated body, label, and caption content.",
  },
  {
    name: "FieldPair",
    description: "Pairs a muted label with a readable document value.",
  },
  {
    name: "Image",
    description: "Places a permitted, resolved image without remote rendering.",
  },
  {
    name: "QRCode",
    description: "Generates a bounded vector QR code directly in the PDF.",
  },
] as const;

function PrimitiveGrid({
  items,
}: {
  items: readonly { name: string; description: string }[];
}) {
  return (
    <ul className="mt-5 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.name} className="bg-background p-5">
          <h3 className="font-mono text-sm font-semibold">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function ComponentsPage() {
  return (
    <DocumentationShell>
      <DocsArticle
        title="PDF components"
        description="Composable primitives for source-owned PDF documents. They use @react-pdf/renderer and document tokens, never DOM or Tailwind components."
        rootHref="/components/"
        rootTitle="Components"
      >
        <section aria-labelledby="layout-primitives">
          <h2
            id="layout-primitives"
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Layout primitives
          </h2>
          <p className="mt-4 text-muted-foreground">
            These components establish physical geometry before any content is
            placed on the page.
          </p>
          <PrimitiveGrid items={layoutPrimitives} />
        </section>

        <section aria-labelledby="content-primitives">
          <h2
            id="content-primitives"
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Content primitives
          </h2>
          <p className="mt-4 text-muted-foreground">
            Content remains validated and local while themes control type,
            color, and spacing.
          </p>
          <PrimitiveGrid items={contentPrimitives} />
        </section>

        <section aria-labelledby="template-examples">
          <h2
            id="template-examples"
            className="scroll-m-20 text-2xl font-semibold tracking-tight"
          >
            Template examples
          </h2>
          <p className="mt-4 text-muted-foreground">
            See how the primitives combine into qualified business-card PDFs,
            then inspect the complete source closure on a template page.
          </p>
          <Link
            href="/templates/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-5 h-10 px-3",
            )}
          >
            Browse templates
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Link>
        </section>
      </DocsArticle>
    </DocumentationShell>
  );
}
