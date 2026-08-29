import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default function DocsPage() {
  return (
    <article className="max-w-[72ch]">
      <p className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
        Documentation
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Build with docn-ui
      </h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">
        Learn how the project approaches source-owned PDF templates and which
        foundations are available today.
      </p>
      <div className="mt-10 border-t pt-6">
        <Link
          href="/docs/getting-started/"
          className="group inline-flex items-center gap-2 font-medium text-primary outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Getting started
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review the qualified foundation and the boundaries for upcoming
          templates.
        </p>
      </div>
    </article>
  );
}
