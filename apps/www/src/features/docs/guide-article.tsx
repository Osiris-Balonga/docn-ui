import Link from "next/link";
import { CodeBlock, DocsArticle } from "./docs-article";
import { DocumentationShell } from "./documentation-shell";
import { guideContent, type GuideBlock } from "@/content/docs/guide-content";
import { guideIndex, type GuideSlug } from "@/content/docs/guide-index";

const registryBase =
  process.env.DOCN_REGISTRY_ORIGIN ?? "http://127.0.0.1:4173/r/dev/";

function GuideContentBlock({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="text-pretty text-muted-foreground">{block.text}</p>;
    case "list":
      return (
        <ul className="list-disc space-y-3 pl-5 text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <CodeBlock label={block.label} highlight={block.highlight ?? true}>
          {block.code}
        </CodeBlock>
      );
    case "install":
      return (
        <CodeBlock
          label="Install source"
          highlight={false}
        >{`corepack pnpm dlx shadcn@4.19.1 add ${new URL(`${block.item}.json`, registryBase).href}`}</CodeBlock>
      );
    case "assets":
      return (
        <CodeBlock
          label={`Prepare ${block.target} assets`}
          highlight={false}
        >{`node docn/assets/install.mjs --manifest ${new URL("assets/manifest.json", registryBase).href} --target ${block.target}`}</CodeBlock>
      );
    case "link":
      return (
        <Link
          href={block.href}
          className="inline-flex min-h-10 items-center font-medium underline decoration-muted-foreground/50 underline-offset-4 outline-none hover:decoration-foreground focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {block.text}
        </Link>
      );
  }
}

export function GuideArticle({ slug }: { slug: GuideSlug }) {
  const guide = guideIndex.find((entry) => entry.slug === slug)!;
  const sections = guideContent[slug];
  const index = guideIndex.indexOf(guide);
  const next = guideIndex[index + 1];
  return (
    <DocumentationShell
      sections={sections.map((section) => ({
        title: section.title,
        href: `#${section.id}`,
      }))}
    >
      <DocsArticle
        title={guide.title}
        description={guide.description}
        breadcrumb={guide.title}
      >
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <h2
              id={section.id}
              className="scroll-m-20 text-xl font-semibold tracking-tight text-balance"
            >
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, index) => (
                <GuideContentBlock key={index} block={block} />
              ))}
            </div>
          </section>
        ))}
        {next ? (
          <Link
            href={`/docs/${next.slug}/`}
            className="inline-flex min-h-10 items-center font-medium underline underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Continue: {next.title}
          </Link>
        ) : null}
      </DocsArticle>
    </DocumentationShell>
  );
}
