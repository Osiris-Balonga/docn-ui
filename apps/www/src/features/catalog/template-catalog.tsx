"use client";

import {
  type KeyboardEvent,
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, Code2Icon, CopyIcon } from "lucide-react";
import {
  templateCatalog,
  templateFamilies,
  type TemplateCatalogEntry,
  type TemplateFamily,
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
import { PdfPreviewDialog } from "@/features/pdf-preview/pdf-preview-dialog";
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
  const installCommand = `corepack pnpm dlx shadcn@4.19.1 add ${origin}/r/dev/docn-${template.id}.json`;

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
              Browse the template files and its direct family foundation.
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
      <PdfPreviewDialog
        title={template.title}
        pages={template.pages.map((page) => ({
          src: `${page.src}?v=${page.sha256.slice(0, 12)}`,
          width: page.width,
          height: page.height,
          alt: `${template.title} PDF preview, page ${page.page}`,
        }))}
        downloadHref={`${template.pdf.src}?v=${template.pdf.revision.slice(0, 12)}`}
        triggerClassName="h-72 rounded-xl bg-muted/35 p-5 sm:h-80 sm:p-7"
        previewImageClassName="max-h-full w-auto shadow-lg ring-1 ring-foreground/10"
      />
    </article>
  );
}

function EmptyTemplateSlot({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      data-empty-template-slot=""
      className={cn("min-w-0", className)}
    >
      <div className="h-11" />
      <div className="h-72 rounded-xl border border-dashed border-border/70 bg-transparent sm:h-80" />
    </div>
  );
}

export function TemplateGallery({ featuredSlug }: { featuredSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const featuredTemplate = templateCatalog.find(
    (template) => template.slug === featuredSlug,
  );
  const firstAvailableFamily = templateFamilies.find((family) =>
    templateCatalog.some((template) => template.family === family.id),
  );
  const requestedFamily = searchParams.get("family");
  const requestedFamilyIsAvailable = templateFamilies.some(
    (family) => family.id === requestedFamily,
  );
  const activeFamily: TemplateFamily = requestedFamilyIsAvailable
    ? (requestedFamily as TemplateFamily)
    : (featuredTemplate?.family ?? firstAvailableFamily?.id ?? "business-card");
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    if (!requestedFamily || requestedFamilyIsAvailable) return;
    const canonicalParams = new URLSearchParams(searchParamsString);
    canonicalParams.set("family", activeFamily);
    router.replace(`?${canonicalParams.toString()}`, { scroll: false });
  }, [
    activeFamily,
    requestedFamily,
    requestedFamilyIsAvailable,
    router,
    searchParamsString,
  ]);
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
  const mediumEmptySlots = activeTemplates.length % 2 === 0 ? 0 : 1;
  const largeEmptySlots =
    activeTemplates.length % 3 === 0 ? 0 : 3 - (activeTemplates.length % 3);

  function selectAdjacentFamily(event: KeyboardEvent<HTMLAnchorElement>) {
    const currentIndex = templateFamilies.findIndex(
      (family) => family.id === activeFamily,
    );
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      nextIndex = (currentIndex + 1) % templateFamilies.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      nextIndex =
        (currentIndex - 1 + templateFamilies.length) % templateFamilies.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = templateFamilies.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextFamily = templateFamilies[nextIndex];
    if (!nextFamily) return;
    const nextParams = new URLSearchParams(searchParamsString);
    nextParams.set("family", nextFamily.id);
    router.push(`?${nextParams.toString()}`, { scroll: false });
    const tabs = event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLAnchorElement>('[role="tab"]');
    tabs?.[nextIndex]?.focus();
  }

  return (
    <>
      <nav
        aria-label="Template families"
        className="scrollbar-hidden mt-14 overflow-x-auto sm:mt-20"
      >
        <ul className="flex min-w-max items-center gap-5" role="tablist">
          {templateFamilies.map((family) => (
            <li key={family.id}>
              <Link
                href={`?${new URLSearchParams({
                  ...Object.fromEntries(searchParams.entries()),
                  family: family.id,
                }).toString()}`}
                scroll={false}
                role="tab"
                tabIndex={activeFamily === family.id ? 0 : -1}
                aria-controls="template-family-panel"
                aria-selected={activeFamily === family.id}
                onKeyDown={selectAdjacentFamily}
                className={cn(
                  "flex h-11 items-center rounded-sm text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  activeFamily === family.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {family.label}
              </Link>
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
        {activeTemplates.length > 0 ? (
          <div className="grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {activeTemplates.map((template) => (
              <TemplateSpecimen key={template.id} template={template} />
            ))}
            {Array.from({ length: mediumEmptySlots }, (_, index) => (
              <EmptyTemplateSlot
                key={`medium-empty-${index}`}
                className="hidden md:block xl:hidden"
              />
            ))}
            {Array.from({ length: largeEmptySlots }, (_, index) => (
              <EmptyTemplateSlot
                key={`large-empty-${index}`}
                className="hidden xl:block"
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-xl bg-muted/25 px-6 py-12 text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-medium">No {familyLabel} yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This family is ready for new source-owned PDF templates built
                from the shared document components.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export function TemplateCatalog({ featuredSlug }: { featuredSlug?: string }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
      <header className="mx-auto flex max-w-3xl flex-col items-center pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          PDF Templates
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
          New source-owned templates will be added progressively, built from the
          shared document components and ready to adapt in your project.
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

      <Suspense
        fallback={<div className="mt-14 min-h-96" aria-hidden="true" />}
      >
        <TemplateGallery {...(featuredSlug ? { featuredSlug } : {})} />
      </Suspense>
    </div>
  );
}
