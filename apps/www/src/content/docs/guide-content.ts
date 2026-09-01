import {
  browserConsumerUsage,
  nodeConsumerBuildConfig,
  nodeConsumerUsage,
} from "@docn-ui/documents/examples/consumer-usage";
import type { GuideSlug } from "./guide-index";

export type GuideBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: readonly string[] }
  | { type: "code"; label: string; code: string; highlight?: boolean }
  | { type: "link"; text: string; href: string }
  | { type: "install"; item: string }
  | { type: "assets"; target: "browser" | "node" };

export interface GuideSection {
  id: string;
  title: string;
  blocks: readonly GuideBlock[];
}

export const guideContent: Record<GuideSlug, readonly GuideSection[]> = {
  installation: [
    {
      id: "prerequisites",
      title: "Keep your existing project",
      blocks: [
        {
          type: "paragraph",
          text: "Start with a React 19 TypeScript project that already has a working shadcn components.json. Keep its style, aliases and UI components. docn-ui adds source under a separate root-level docn directory; it does not reinitialize shadcn or require a docn runtime package.",
        },
        {
          type: "paragraph",
          text: "Qualification currently uses Node 24.18.0, pnpm 11.24.0, shadcn 4.19.0 and React 19.2.8. Other combinations are not guaranteed. Internal docn imports are relative, so a consumer using a different source alias does not need to adopt @/*.",
        },
        {
          type: "paragraph",
          text: "The registry is a local development registry, not an immutable public release. To serve your own checkout, run the following commands in the docn-ui repository. The preview defaults to port 4173. Leave it running while installing from a second terminal in your consumer project.",
        },
        {
          type: "code",
          label: "Serve the development registry",
          highlight: false,
          code: "corepack pnpm install --frozen-lockfile\ncorepack pnpm build\ncorepack pnpm preview",
        },
      ],
    },
    {
      id: "install-source",
      title: "Install the source",
      blocks: [
        {
          type: "paragraph",
          text: "Run this command from your consumer project. It uses the configured registry build URL, which defaults to port 4173 even if you view this documentation on another port. To host the registry elsewhere, set DOCN_REGISTRY_ORIGIN to its full /r/dev/ URL before building and serve it there. Install the composed component example while the template catalog is rebuilt.",
        },
        { type: "install", item: "docn-component-example" },
        {
          type: "paragraph",
          text: "Your existing components.json remains authoritative. Do not replace it with docn-ui's own site configuration. A future public @docn namespace will be an additional registries entry, not a second initializer. No public namespace or release URL is promised today.",
        },
      ],
    },
    {
      id: "prepare-assets",
      title: "Prepare assets, then render",
      blocks: [
        {
          type: "paragraph",
          text: "Source installation does not silently download binary fonts. Review the visible asset installer and run the appropriate browser or Node command before rendering. Missing assets are an error, not a reason to silently substitute a font.",
        },
        {
          type: "link",
          text: "Prepare local fonts and licenses",
          href: "/docs/local-assets/",
        },
        {
          type: "link",
          text: "Render your first PDF",
          href: "/docs/browser-and-node/",
        },
      ],
    },
  ],
  "local-assets": [
    {
      id: "browser-assets",
      title: "Browser assets",
      blocks: [
        {
          type: "paragraph",
          text: "After installing a template, run this command in the consumer project. It places the fonts and their OFL license under public/generated. Serve that directory from your own app so /generated/fonts/ URLs resolve on the consumer origin.",
        },
        { type: "assets", target: "browser" },
        {
          type: "paragraph",
          text: "createBrowserAssetResolver(window.location.origin) resolves the installed asset manifest against your application, not the docn-ui website. Nested deployment paths need explicit asset hosting at the manifest URLs; do not assume a framework base path rewrites them.",
        },
      ],
    },
    {
      id: "node-assets",
      title: "Node assets",
      blocks: [
        {
          type: "paragraph",
          text: "Use the Node target to prepare the same verified files under assets. Pass the absolute path of this directory to createNodeAssetResolver. Resolve it from your application's working directory or an explicit application root, not from user document data.",
        },
        { type: "assets", target: "node" },
      ],
    },
    {
      id: "asset-controls",
      title: "Verification and manual setup",
      blocks: [
        {
          type: "list",
          items: [
            "The installer checks file sizes and SHA-256 hashes, keeps requests on the manifest origin and rejects traversal or symlink destinations.",
            "Existing files are never silently overwritten. Compare them or prepare assets in a separate checkout when updating.",
            "Manual preparation is supported: download the manifest's listed files, preserve relative paths and verify every declared size and hash. Include the license file.",
            "After preparation, PDF generation needs only the consumer's local files or same-origin assets. It does not need a live connection to the docn-ui registry.",
          ],
        },
        {
          type: "link",
          text: "Use the prepared assets in browser or Node",
          href: "/docs/browser-and-node/",
        },
      ],
    },
  ],
  "browser-and-node": [
    {
      id: "browser-example",
      title: "Render in the browser",
      blocks: [
        {
          type: "paragraph",
          text: 'Install the Text document example and prepare browser assets first. Save the following module as src/main.ts in a Vite/TypeScript consumer with a <p id="status"> element. The imports assume docn/ sits beside src/. This is the same complete source exercised by the external browser installation test.',
        },
        { type: "install", item: "docn-text-example" },
        { type: "code", label: "src/main.ts", code: browserConsumerUsage },
        {
          type: "paragraph",
          text: "The example appends a download link for the actual generated bytes. In a long-lived app, revoke the previous object URL when replacing it and on teardown. Keep a separate byte copy if a PDF.js viewer transfers its buffer. In Next.js, invoke browser rendering only from client-side code; do not run this module during server rendering.",
        },
        {
          type: "paragraph",
          text: "This minimal example renders directly for clarity. For frequent or large documents, use a dedicated worker and bound concurrent work. Handle validation/render errors near the action, retain the last valid preview and prevent downloading stale bytes. The docn-ui site's worker coordinator is not installed with a template.",
        },
      ],
    },
    {
      id: "node-example",
      title: "Render in Node",
      blocks: [
        {
          type: "paragraph",
          text: "Install the composed component example and prepare Node assets. Save this source as src/node-entry.ts and compile it with your TypeScript-capable bundler before executing it from the consumer root. The qualification fixture uses a Vite SSR build; Node's native TypeScript execution is not a replacement for compiling the installed TSX document files.",
        },
        { type: "install", item: "docn-component-example" },
        { type: "code", label: "src/node-entry.ts", code: nodeConsumerUsage },
        {
          type: "code",
          label: "vite.config.mjs",
          code: nodeConsumerBuildConfig,
        },
        {
          type: "code",
          label: "Build and render in your Vite consumer",
          highlight: false,
          code: "corepack pnpm exec vite build\nnode dist-node/node-entry.mjs",
        },
        {
          type: "paragraph",
          text: "This writes components-output.pdf and reports its byte count. It is independent local Node usage, not a rendering API hosted by docn-ui. Both consumer examples are verified after the test registry has been stopped.",
        },
      ],
    },
    {
      id: "other-formats",
      title: "Use the appropriate renderer",
      blocks: [
        {
          type: "paragraph",
          text: "Fixed and flowing documents use renderDocumentInBrowser or renderDocumentInNode. Thermal receipts use the separate continuous-document renderer to measure actual content height before the final render. Do not pass a receipt plan to the fixed renderer or estimate roll height from character counts.",
        },
        {
          type: "link",
          text: "Understand format and printing behavior",
          href: "/docs/formats-and-printing/",
        },
      ],
    },
  ],
  themes: [
    {
      id: "pdf-tokens",
      title: "A PDF has its own theme tokens",
      blocks: [
        {
          type: "paragraph",
          text: "The site theme and document theme are independent. Switching the site to dark mode does not turn the printed paper black. neutral, editorial and bold currently provide monochrome starting palettes; they differ in typography and spacing.",
        },
        {
          type: "paragraph",
          text: "A render request selects themeId. The installed theme source defines canvas, surface, text, mutedText, accent, border and invertedText colors, registered font roles, point sizes and spacing. Keep these roles consistent when editing your owned source.",
        },
        {
          type: "code",
          label: "Choose a document theme",
          code: 'themeId: "neutral",\n// Also available: "editorial" and "bold".',
        },
      ],
    },
    {
      id: "shadcn-mapping",
      title: "Map your shadcn design deliberately",
      blocks: [
        {
          type: "list",
          items: [
            "Map a light paper background to canvas/surface, foreground to text, muted foreground to mutedText, primary to accent, and border to border. Check printed contrast separately.",
            "Resolve color values to the supported six-digit RGB hex representation before placing them in PDF tokens. CSS var(), Tailwind classes and OKLCH strings are not renderer colors.",
            "Use a qualified local PDF font for body/heading roles. A shadcn font setting or site WOFF2 file is not automatically a registered PDF font.",
            "The current request override surface is deliberately bounded. Arbitrary brand colors or unqualified fonts require adapting and validating the installed theme source; they cannot be assumed to work through a generic override object.",
          ],
        },
        {
          type: "paragraph",
          text: "There is no automatic shadcn-to-PDF theme converter in the current release. Configuration-compatible installation means keeping components.json intact, not silently copying CSS into the renderer.",
        },
      ],
    },
    {
      id: "qualified-fonts",
      title: "Use qualified fonts",
      blocks: [
        {
          type: "paragraph",
          text: "The bundled PDF assets are static Noto Sans and Noto Serif at weights 400 and 700, qualified for French and English. Adding another family, weight or script requires its license, actual font registration, glyph coverage checks and a render test. Do not silently fall back to a system font.",
        },
        {
          type: "link",
          text: "Review font and script limitations",
          href: "/docs/limitations/#fonts-and-scripts",
        },
      ],
    },
  ],
  "formats-and-printing": [
    {
      id: "physical-formats",
      title: "Select a supported physical format",
      blocks: [
        {
          type: "paragraph",
          text: "Format, composition and theme are separate. Select a formatId supported by the template metadata; changing width and height alone does not create a valid composition. Physical units are converted with points = millimeters × 72 / 25.4.",
        },
        {
          type: "list",
          items: [
            "The minimal card example uses card-85x55: an 85 × 55 mm trim, with front and back on two pages.",
            "Invoices support A4 (210 × 297 mm) and Letter (215.9 × 279.4 mm). Long content flows across pages with repeated identity and table headers.",
            "Thermal receipts use 58 or 80 mm paper width and measured content height, up to 2,000 mm. They are not narrow A4 pages.",
            "Portrait badges use the 53.98 × 85.6 mm badge preset. Business-card templates use landscape presets and place front and back on consecutive pages.",
          ],
        },
      ],
    },
    {
      id: "print-profiles",
      title: "Trim, bleed and safe areas",
      blocks: [
        {
          type: "paragraph",
          text: "The screen profile uses trim size without crop marks. A supported print profile adds explicit bleed and optional outer crop-mark space. Trim is the intended cut edge; bleed extends backgrounds outside it; safe areas keep important text and codes inside it. The preview and download must both use the final post-processed PDF.",
        },
        {
          type: "paragraph",
          text: "A document with 85 × 55 mm trim and 3 mm bleed is 91 × 61 mm before any extra crop-mark margin. That larger media size is intentional. Do not scale it back to the trim dimensions when printing bleed.",
        },
      ],
    },
    {
      id: "printer-check",
      title: "Verify your printer",
      blocks: [
        {
          type: "list",
          items: [
            "Print at 100% or actual size with fit-to-page disabled. Measure a test sheet before using production stock.",
            "Check the printer's hardware margins, especially on 58/80 mm rolls. Full paper width is not a guarantee of edge-to-edge printing.",
            "Front/back page order does not select duplex flip direction for your printer. Test orientation; never mirror text as a workaround.",
            "Digital geometry checks do not certify physical calibration, CMYK, PDF/X or color soft proofing.",
          ],
        },
        {
          type: "link",
          text: "Read the output limitations",
          href: "/docs/limitations/",
        },
      ],
    },
  ],
  "data-and-locales": [
    {
      id: "validated-data",
      title: "Start from the typed example",
      blocks: [
        {
          type: "paragraph",
          text: "Each installed template includes example data and a validated render-plan factory. Copy the example structure, replace data values and pass it to the factory. Unknown keys, incompatible formats and invalid values fail explicitly; the library does not silently replace them with demo data.",
        },
        {
          type: "paragraph",
          text: "Use the installed protocol constant and the template's metadata version. assetIds identifies prepared, permitted assets; it is not a list of arbitrary file paths or remote image URLs. A revision belongs to one complete data/format/theme/assets selection.",
        },
        {
          type: "link",
          text: "See complete render requests",
          href: "/docs/browser-and-node/",
        },
      ],
    },
    {
      id: "locale-and-money",
      title: "Make locale, dates and money explicit",
      blocks: [
        {
          type: "list",
          items: [
            "Use locale: en or fr. The site's English documentation does not limit the language of document data to English.",
            "Event and receipt instants include an explicit IANA time zone. Invoice issue/due dates are date-only values; do not convert them through an implicit local time zone.",
            "Money uses integer minor units, integer quantities, one currency per document and tax basis points. EUR/USD use two decimal places; XAF uses none.",
            "The current policy computes tax per line with half-up rounding, then sums lines. Fractional quantities, discounts, compound taxes and credit notes are not part of the V1 contract.",
          ],
        },
      ],
    },
    {
      id: "errors-and-privacy",
      title: "Handle errors without losing the last valid PDF",
      blocks: [
        {
          type: "paragraph",
          text: "Catch validation failures before rendering and show their field paths. Do not truncate long names or dense codes to force a document to fit. Keep the last valid output visible as stale if new data fails, and allow download only when it matches the current revision.",
        },
        {
          type: "paragraph",
          text: "The site accepts data, not executable JSX, JavaScript, HTML or user MDX. Keep personal data out of URLs, analytics and persistent browser storage. Local rendering does not make downstream application logging or storage automatically private; that remains the consumer application's responsibility.",
        },
      ],
    },
  ],
  "updating-source": [
    {
      id: "owned-files",
      title: "Installed source belongs to your project",
      blocks: [
        {
          type: "paragraph",
          text: "There is no hidden docn runtime package to update behind your edited components. Commit your current source and assets before considering an upstream revision. Review the source view and compare the same template and dependency closure in a separate consumer checkout.",
        },
      ],
    },
    {
      id: "review-changes",
      title: "Review and apply a change",
      blocks: [
        {
          type: "list",
          items: [
            "Record the registry origin, item name and source revision you are adopting. /r/dev/ is mutable and must not be treated as an immutable release.",
            "Install into the separate checkout using the same qualified CLI and your existing shadcn configuration. Do not add --overwrite to your normal project.",
            "Compare code, dependency versions, schemas, defaults, fonts and asset manifest hashes. Preserve your own changes when applying the diff.",
            "Render one representative document and your application's relevant edge cases. Inspect dimensions, text, final totals, pagination and machine-readable codes where used.",
            "Commit the reviewed source and matching assets together. Return to that commit if the update regresses your application.",
          ],
        },
      ],
    },
    {
      id: "asset-updates",
      title: "Update assets deliberately",
      blocks: [
        {
          type: "paragraph",
          text: "The asset installer refuses existing destinations. Prepare the new version separately and compare hashes instead of deleting your asset directory or forcing replacement. Keep the corresponding licenses with the files. A published immutable release path will not be reused for changed content.",
        },
        {
          type: "link",
          text: "Review asset verification",
          href: "/docs/local-assets/#asset-controls",
        },
      ],
    },
  ],
  limitations: [
    {
      id: "fonts-and-scripts",
      title: "Fonts and scripts",
      blocks: [
        {
          type: "paragraph",
          text: "French and English with the bundled static Noto fonts are qualified. Other scripts, right-to-left layout, emoji, variable fonts and site WOFF2 files are not guaranteed. Verify glyph coverage and shaping in the actual PDF before promising support. Silent fallback or replacement glyphs are not acceptable.",
        },
      ],
    },
    {
      id: "accessibility",
      title: "PDF accessibility",
      blocks: [
        {
          type: "paragraph",
          text: "Selectable PDF text and a keyboard-accessible website do not establish a correct PDF reading order, tagging or PDF/UA conformance. Provide an accessible HTML or structured-data alternative where required and qualify your output separately. An Image alt prop alone does not certify an accessible PDF.",
        },
      ],
    },
    {
      id: "codes-and-invoices",
      title: "Codes, signatures and invoices",
      blocks: [
        {
          type: "paragraph",
          text: "A QR code encodes data; it does not authenticate a ticket, enforce uniqueness or grant secure access. Final-PDF decoding checks do not replace hardware trials. Barcode components are planned in L12 and are not advertised as available yet.",
        },
        {
          type: "paragraph",
          text: "A printed signature line is not a cryptographic signature. Invoice calculations are deterministic but not jurisdictional tax advice, accounting software or certified electronic invoicing. Consumers must supply and verify their own required business fields and policies.",
        },
      ],
    },
    {
      id: "printing-and-limits",
      title: "Printing and bounded rendering",
      blocks: [
        {
          type: "paragraph",
          text: "The output is RGB. No CMYK, PDF/X, color-proofing or universal duplex/stock calibration is claimed. Physical printing remains unverified; run your own actual-size sample on the target device.",
        },
        {
          type: "list",
          items: [
            "Shared input limits include 256 KiB JSON, depth 8, bounded strings and 512 UTF-8 bytes for a QR payload; physical code density can impose a lower limit.",
            "Permitted user images are validated PNG/JPEG, up to two files, 5 MiB and 16 megapixels each. Imported SVG, HTML, external PDFs and arbitrary image URLs are outside the public input contract.",
            "Invoices and receipts allow at most 200 lines, documents 50 pages and final output 20 MiB. A receipt also has a 2,000 mm height limit.",
            "The site's render coordinator has a 15-second timeout. Standalone consumer calls must provide their own scheduling, timeout/recovery and resource cleanup.",
          ],
        },
      ],
    },
  ],
};
