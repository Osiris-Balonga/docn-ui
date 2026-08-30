import type { ReactNode } from "react";
import { CodeViewport } from "@/components/code-viewport";
import { cn } from "@/lib/utils";
import { DocsBreadcrumbs } from "./docs-breadcrumbs";

type DocsArticleProps = {
  title: string;
  description: string;
  breadcrumb?: string;
  rootHref?: string;
  rootTitle?: string;
  hideBreadcrumb?: boolean;
  children: ReactNode;
};

export function DocsArticle({
  title,
  description,
  breadcrumb,
  rootHref,
  rootTitle,
  hideBreadcrumb = false,
  children,
}: DocsArticleProps) {
  return (
    <article className="mx-auto max-w-[40rem]">
      {hideBreadcrumb ? null : (
        <DocsBreadcrumbs
          {...(breadcrumb ? { current: breadcrumb } : {})}
          {...(rootHref ? { rootHref } : {})}
          {...(rootTitle ? { rootTitle } : {})}
        />
      )}
      <h1
        className={cn(
          "scroll-m-20 text-3xl font-semibold tracking-tight text-balance",
          !hideBreadcrumb && "mt-4",
        )}
      >
        {title}
      </h1>
      <p className="mt-3 text-lg leading-8 text-muted-foreground">
        {description}
      </p>
      <div className="mt-10 space-y-10 leading-7">{children}</div>
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
      <CodeViewport>
        <code>{children}</code>
      </CodeViewport>
    </div>
  );
}
