"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { CodeBlock } from "./docs-article";

const subscribe = () => () => {};

export function ComponentInstall({
  slug,
  exampleItems,
}: {
  slug: string;
  exampleItems: string[];
}) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "http://127.0.0.1:4173",
  );
  const command = (items: string[]) =>
    `corepack pnpm dlx shadcn@4.19.0 add ${items.map((item) => `${origin}/r/dev/${item}.json`).join(" ")}`;
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Add the component to an existing shadcn project. Your components.json
        and web theme stay unchanged.
      </p>
      <CodeBlock label="Install component">
        {command([`docn-${slug}`])}
      </CodeBlock>
      <details>
        <summary className="cursor-pointer py-2 text-sm outline-none focus-visible:underline">
          Install the complete example
        </summary>
        <div className="mt-3 space-y-4">
          <p className="text-sm text-muted-foreground">
            The example also uses these layout and theme helpers. Review
            existing files; do not use an overwrite flag.
          </p>
          <CodeBlock label="Example dependencies">
            {command([
              ...new Set([...exampleItems, "docn-fonts", "docn-theme-context"]),
            ])}
          </CodeBlock>
        </div>
      </details>
      <p className="text-sm text-muted-foreground">
        Prepare and register the qualified local fonts before rendering. Follow{" "}
        <Link
          href="/docs/local-assets/"
          className="underline underline-offset-4"
        >
          Local assets
        </Link>{" "}
        and the{" "}
        <Link
          href="/docs/installation/"
          className="underline underline-offset-4"
        >
          installation guide
        </Link>
        . The /r/dev registry is mutable and local, not a public release.
      </p>
    </div>
  );
}
