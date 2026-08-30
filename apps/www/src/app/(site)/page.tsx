import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-20">
      <section
        aria-labelledby="home-heading"
        className="mx-auto w-full max-w-3xl text-center"
      >
        <h1
          id="home-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Well-designed PDF templates, owned by your codebase.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          docn-ui extends the shadcn source workflow to printable documents:
          install the templates you need, edit them locally, and generate PDFs
          in the browser.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/templates/"
            className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}
          >
            Browse templates
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
    </div>
  );
}
