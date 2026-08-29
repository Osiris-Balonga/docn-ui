import Link from "next/link";
import { ArrowRightIcon, GitForkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const qualifiedFoundations = [
  "Exact physical dimensions and print boxes",
  "Local fonts, pagination, and measured receipts",
  "Browser generation with a local PDF.js preview",
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
      <section aria-labelledby="home-heading" className="max-w-3xl">
        <Badge variant="secondary">Open source · In development</Badge>
        <h1
          id="home-heading"
          className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Well-designed PDF templates, owned by your codebase.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          docn-ui is building a source-first document toolkit inspired by the
          shadcn model: install the templates you need, edit them locally, and
          generate PDFs in the browser.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs/getting-started/"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}
          >
            Read the foundation guide
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Link>
          <a
            href="https://github.com/Osiris-Balonga/docn-ui"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-10 px-4",
            )}
          >
            <GitForkIcon aria-hidden="true" data-icon="inline-start" />
            View on GitHub
          </a>
        </div>
      </section>

      <section
        aria-labelledby="qualified-heading"
        className="mt-20 border-t pt-8 sm:mt-24"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
          <div>
            <p className="font-mono text-xs font-medium tracking-wide text-primary uppercase">
              Current status
            </p>
            <h2 id="qualified-heading" className="mt-3 text-2xl font-semibold">
              The PDF foundation is qualified.
            </h2>
          </div>
          <div>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              The public template catalog and registry are still being built.
              The implementation has already verified the core browser PDF
              constraints that future templates will rely on.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {qualifiedFoundations.map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-primary/40 pl-4 text-sm leading-6"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
