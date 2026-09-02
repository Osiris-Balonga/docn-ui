import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata({
  title: "docn-ui — PDF templates, in your codebase",
  description:
    "Install source-owned PDF templates, edit them locally and render in the browser.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="flex w-full flex-1 items-center px-4 py-4 sm:px-6 sm:py-6">
      <section
        aria-labelledby="home-heading"
        className="mx-auto w-full max-w-3xl text-center text-white"
      >
        <h1
          id="home-heading"
          className="text-4xl leading-tight font-semibold tracking-tight text-balance drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-6xl"
        >
          Well-designed PDF templates, owned by your codebase.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-pretty text-white/82 drop-shadow-[0_1px_10px_rgba(0,0,0,0.55)] sm:text-lg sm:leading-8">
          docn-ui extends the shadcn source workflow to printable documents:
          install the templates you need, edit them locally, and generate PDFs
          in the browser.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/templates/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-10 bg-white px-4 text-black shadow-sm transition-transform hover:bg-white/90 active:scale-[0.96]",
            )}
          >
            Browse templates
          </Link>
          <Link
            href="/docs/getting-started/"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-10 border-white/30 bg-black/20 px-4 text-white shadow-sm backdrop-blur-sm transition-transform hover:bg-black/35 hover:text-white active:scale-[0.96]",
            )}
          >
            Read the foundation guide
          </Link>
        </div>
      </section>
    </div>
  );
}
