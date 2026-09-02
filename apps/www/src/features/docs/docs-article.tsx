import type { ReactNode } from "react";
import { CodeViewport } from "@/components/code-viewport";
import { CopyCodeButton } from "@/components/copy-code-button";
import { HighlightedCode } from "@/components/highlighted-code";
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
    <article className="mx-auto max-w-[40rem] [overflow-wrap:anywhere]">
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
  highlight = true,
}: {
  label: string;
  children: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg bg-muted/30">
      <div className="flex min-h-12 items-center justify-between gap-3 bg-muted/30 pl-4 pr-2 font-mono text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{label}</span>
        <CopyCodeButton compact label={`Copy ${label}`} text={children} />
      </div>
      <CodeViewport className="max-h-[36rem]" aria-label={`${label} code`}>
        {highlight ? (
          <HighlightedCode code={children} label={`${label} source`} />
        ) : (
          <code aria-label={`${label} source`}>{children}</code>
        )}
      </CodeViewport>
    </div>
  );
}
