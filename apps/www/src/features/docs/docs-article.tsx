import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import { DocsBreadcrumbs } from "./docs-breadcrumbs";

type DocsArticleProps = {
  title: string;
  description: string;
  breadcrumb?: string;
  children: ReactNode;
};

export function DocsArticle({
  title,
  description,
  breadcrumb,
  children,
}: DocsArticleProps) {
  return (
    <article className="max-w-[72ch]">
      <DocsBreadcrumbs {...(breadcrumb ? { current: breadcrumb } : {})} />
      <h1 className="mt-5 scroll-m-20 text-4xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        {description}
      </p>
      <Separator className="my-8" />
      <div className="space-y-8 leading-7">{children}</div>
    </article>
  );
}

export function CodeBlock({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b bg-muted/50 px-4 py-2 font-mono text-xs text-muted-foreground">
        {label}
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6" tabIndex={0}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
