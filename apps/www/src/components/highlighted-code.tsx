import {
  tokenizeSource,
  type SourceTokenKind,
} from "@/features/registry/registry-source";

const tokenClasses: Record<SourceTokenKind, string> = {
  comment: "text-muted-foreground italic",
  keyword: "text-sky-700 dark:text-sky-300",
  number: "text-amber-700 dark:text-amber-300",
  plain: "text-foreground",
  string: "text-emerald-700 dark:text-emerald-300",
};

export function HighlightedCode({
  code,
  label,
}: {
  code: string;
  label: string;
}) {
  return (
    <code aria-label={label}>
      {tokenizeSource(code).map((token, index) => (
        <span className={tokenClasses[token.kind]} key={index}>
          {token.value}
        </span>
      ))}
    </code>
  );
}
