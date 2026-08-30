import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TemplateGallery } from "@/features/catalog/template-catalog";
import { cn } from "@/lib/utils";

const qualifiedFoundations = [
  "Exact physical dimensions and print boxes",
  "Local fonts, pagination, and measured receipts",
  "Browser generation with a local PDF.js preview",
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <section
        aria-labelledby="home-heading"
        className="mx-auto max-w-3xl text-center"
      >
        <h1
          id="home-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Well-designed PDF templates, owned by your codebase.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          docn-ui is building a source-first document toolkit inspired by the
          shadcn model: install the templates you need, edit them locally, and
          generate PDFs in the browser.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/templates/"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}
          >
            Browse templates
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Link>
          <Link
            href="/docs/getting-started/"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-10 px-4",
            )}
          >
            Read the foundation guide
          </Link>
        </div>
      </section>

      <TemplateGallery />

      <section
        aria-labelledby="qualified-heading"
        className="mt-16 border-t pt-8 sm:mt-20"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]">
          <div>
            <h2 id="qualified-heading" className="text-2xl font-semibold">
              The PDF foundation is qualified.
            </h2>
          </div>
          <div>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              The first three business cards are now available in the public
              catalog. The source registry and later document families are still
              being built on the qualified PDF foundation.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {qualifiedFoundations.map((item) => (
                <li key={item} className="text-sm leading-6">
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
