import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { templateCatalog } from "@docn-ui/documents/catalog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const qualifiedFoundations = [
  "Exact physical dimensions and print boxes",
  "Local fonts, pagination, and measured receipts",
  "Browser generation with a local PDF.js preview",
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-14 sm:px-6 sm:py-20">
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

      <section aria-labelledby="templates-heading" className="mt-14 sm:mt-16">
        <h2 id="templates-heading" className="sr-only">
          Qualified PDF templates
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {templateCatalog.map((template) => (
            <li key={template.id}>
              <Link
                href={`/templates/${template.slug}/`}
                className="group block rounded-xl border bg-muted/25 p-4 outline-none transition-colors hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden px-4 py-5 sm:px-6">
                  <Image
                    src={template.thumbnail.src}
                    alt={`${template.title} PDF preview`}
                    width={template.thumbnail.width}
                    height={template.thumbnail.height}
                    className="h-auto w-full shadow-lg ring-1 ring-foreground/10 transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                  <div>
                    <h3 className="font-semibold">{template.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.supportedFormatIds.length} formats ·{" "}
                      {template.sides} sides
                    </p>
                  </div>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

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
