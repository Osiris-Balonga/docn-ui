"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, Code2Icon, CopyIcon } from "lucide-react";
import {
  templateCatalog,
  type TemplateCatalogEntry,
} from "@docn-ui/documents/catalog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RegistrySourcePanel } from "@/features/registry/registry-source-panel";
import { copyText } from "@/features/registry/registry-source";
import { cn } from "@/lib/utils";

const subscribeToStaticOrigin = () => () => {};

function TemplateActions({ template }: { template: TemplateCatalogEntry }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    subscribeToStaticOrigin,
    () => window.location.origin,
    () => "http://127.0.0.1:4173",
  );
  const installCommand = `corepack pnpm dlx shadcn@4.19.0 add ${origin}/r/dev/docn-${template.id}.json`;

  async function copyInstallCommand() {
    const success = await copyText(installCommand).catch(() => false);
    setCopied(success);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        className="h-10 px-2.5"
        onClick={copyInstallCommand}
        aria-label={
          copied
            ? `Copied ${template.title} install command`
            : `Copy ${template.title} install command`
        }
      >
        {copied ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-2.5"
              aria-label={`View ${template.title} code`}
            />
          }
        >
          <Code2Icon aria-hidden="true" />
          <span className="hidden sm:inline">View Code</span>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full! gap-0 border-l-0 bg-background p-0 text-foreground sm:max-w-none! md:w-160! lg:w-175!"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{template.title} code</SheetTitle>
            <SheetDescription>
              Browse and copy the complete registry source for this template.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 p-3 pt-13">
            <RegistrySourcePanel
              itemName={`docn-${template.id}`}
              variant="drawer"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TemplateSpecimen({
  featured,
  template,
}: {
  featured: boolean;
  template: TemplateCatalogEntry;
}) {
  return (
    <article className={cn("min-w-0", featured && "lg:col-span-2")}>
      <div className="flex h-11 items-center justify-between gap-3 px-1 py-1.5 sm:px-3">
        <h2 className="truncate text-sm font-medium">{template.title}</h2>
        <TemplateActions template={template} />
      </div>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-xl bg-muted/35 p-6 sm:p-10",
          featured ? "h-80 sm:h-112" : "h-80 sm:h-96",
        )}
      >
        <Image
          src={template.thumbnail.src}
          alt={`${template.title} PDF preview`}
          width={template.thumbnail.width}
          height={template.thumbnail.height}
          className="max-h-full w-auto max-w-full object-contain shadow-lg ring-1 ring-foreground/10"
          priority={featured}
        />
      </div>
    </article>
  );
}

export function TemplateCatalog({ featuredSlug }: { featuredSlug?: string }) {
  const orderedTemplates = featuredSlug
    ? [...templateCatalog].sort((left, right) => {
        if (left.slug === featuredSlug) return -1;
        if (right.slug === featuredSlug) return 1;
        return 0;
      })
    : [...templateCatalog];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
      <header className="mx-auto flex max-w-3xl flex-col items-center pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Beautiful PDF Templates
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
          Production-ready PDF components built for real print formats. Browse
          the previews, copy a template, and adapt the source in your project.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button render={<a href="#business-cards" />}>
            Browse Templates
          </Button>
          <Button
            variant="outline"
            render={<Link href="/docs/getting-started/" />}
          >
            Documentation
          </Button>
        </div>
      </header>

      <nav
        aria-label="Template families"
        className="mt-14 overflow-x-auto sm:mt-20"
      >
        <ul className="flex min-w-max items-center gap-5">
          <li>
            <a
              href="#business-cards"
              aria-current="location"
              className="flex h-11 items-center rounded-md text-base font-medium text-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Business Cards
            </a>
          </li>
        </ul>
      </nav>

      <section id="business-cards" className="scroll-mt-28 pt-4">
        <h2 className="sr-only">Business card templates</h2>
        <div className="grid gap-x-6 gap-y-10 lg:grid-cols-2">
          {orderedTemplates.map((template, index) => (
            <TemplateSpecimen
              key={template.id}
              template={template}
              featured={index === 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
