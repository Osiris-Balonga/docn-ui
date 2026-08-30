"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, Code2Icon, CopyIcon } from "lucide-react";
import {
  templateCatalog,
  type TemplateCatalogEntry,
} from "@docn-ui/documents/catalog";
import { Button, buttonVariants } from "@/components/ui/button";
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

const templateFamilies = [
  { id: "business-card", label: "Business Cards" },
  { id: "ticket", label: "Event Tickets" },
  { id: "receipt", label: "Receipts" },
] as const satisfies readonly {
  id: TemplateCatalogEntry["family"];
  label: string;
}[];

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
          className="w-full! gap-0 border-l-0 bg-background p-0 text-foreground sm:w-[min(44rem,58vw)]! sm:max-w-none!"
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

function TemplateSpecimen({ template }: { template: TemplateCatalogEntry }) {
  return (
    <article className="min-w-0">
      <div className="flex h-11 items-center justify-between gap-3 px-1 py-1.5 sm:px-3">
        <h3 className="truncate text-sm font-medium">{template.title}</h3>
        <TemplateActions template={template} />
      </div>
      <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl bg-muted/35 p-5 sm:h-80 sm:p-7">
        <Image
          src={template.thumbnail.src}
          alt={`${template.title} PDF preview`}
          width={template.thumbnail.width}
          height={template.thumbnail.height}
          className="max-h-full w-auto max-w-full object-contain shadow-lg ring-1 ring-foreground/10"
        />
      </div>
    </article>
  );
}

export function TemplateGallery({ featuredSlug }: { featuredSlug?: string }) {
  const featuredTemplate = templateCatalog.find(
    (template) => template.slug === featuredSlug,
  );
  const [activeFamily, setActiveFamily] = useState<
    TemplateCatalogEntry["family"]
  >(featuredTemplate?.family ?? "business-card");
  const activeTemplates = templateCatalog
    .filter((template) => template.family === activeFamily)
    .sort((left, right) => {
      if (left.slug === featuredSlug) return -1;
      if (right.slug === featuredSlug) return 1;
      return 0;
    });
  const familyLabel = templateFamilies.find(
    (family) => family.id === activeFamily,
  )?.label;

  return (
    <>
      <nav
        aria-label="Template families"
        className="scrollbar-hidden mt-14 overflow-x-auto sm:mt-20"
      >
        <ul className="flex min-w-max items-center gap-5" role="tablist">
          {templateFamilies.map((family) => (
            <li key={family.id}>
              <button
                type="button"
                role="tab"
                aria-controls="template-family-panel"
                aria-selected={activeFamily === family.id}
                onClick={() => setActiveFamily(family.id)}
                className={cn(
                  "flex h-11 items-center rounded-sm text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  activeFamily === family.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {family.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="template-family-panel"
        role="tabpanel"
        className="scroll-mt-28 pt-4"
      >
        <h2 className="sr-only">{familyLabel} templates</h2>
        <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {activeTemplates.map((template) => (
            <TemplateSpecimen key={template.id} template={template} />
          ))}
        </div>
      </section>
    </>
  );
}

export function TemplateCatalog({ featuredSlug }: { featuredSlug?: string }) {
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
          <a href="#template-family-panel" className={buttonVariants()}>
            Browse Templates
          </a>
          <Link
            href="/docs/getting-started/"
            className={buttonVariants({ variant: "outline" })}
          >
            Documentation
          </Link>
        </div>
      </header>

      <TemplateGallery {...(featuredSlug ? { featuredSlug } : {})} />
    </div>
  );
}
