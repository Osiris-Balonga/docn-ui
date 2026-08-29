import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { DocsArticle } from "@/features/docs/docs-article";

export default function DocsPage() {
  return (
    <DocsArticle
      title="Build with docn-ui"
      description="Learn how the project approaches source-owned PDF templates and which foundations are available today."
    >
      <section aria-labelledby="available-guides">
        <h2
          id="available-guides"
          className="text-2xl font-semibold tracking-tight"
        >
          Available guides
        </h2>
        <Link
          href="/docs/getting-started/"
          className="group mt-4 inline-flex items-center gap-2 font-medium text-primary outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Getting started
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review the qualified foundation and the boundaries for upcoming
          templates.
        </p>
      </section>
    </DocsArticle>
  );
}
