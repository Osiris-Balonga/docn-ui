import { Link as ReactPdfLink } from "@react-pdf/renderer";
import { usePdfTheme } from "./theme-context";
import { validateLink } from "./link-validation";

export interface LinkProps {
  /** Readable selectable link label. */
  children: string;
  /** Validated HTTP(S), mailto, tel or internal destination. */
  href: string;
  /** Whether to print an underline below the label. */
  underline?: boolean;
}

export function Link({ children, href, underline = true }: LinkProps) {
  const theme = usePdfTheme();
  return (
    <ReactPdfLink
      src={validateLink(href, children)}
      style={{
        color: theme.colors.text,
        fontFamily: theme.fonts.body,
        fontSize: theme.typeScale.body,
        lineHeight: 1.35,
        textDecoration: underline ? "underline" : "none",
      }}
    >
      {children}
    </ReactPdfLink>
  );
}
