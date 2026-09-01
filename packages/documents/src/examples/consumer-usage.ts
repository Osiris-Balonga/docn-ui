export const nodeConsumerUsage = `import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PDF_RENDER_PROTOCOL_VERSION } from "../docn/core/contracts";
import { createNodeAssetResolver } from "../docn/render/assets.node";
import { renderDocumentInNode } from "../docn/render/node";
import { createInvoiceBusinessPlan } from "../docn/templates/invoices/invoice-business/invoice-business";
import { businessInvoiceExample } from "../docn/templates/invoices/invoice-business/examples";
const { plan } = createInvoiceBusinessPlan({
  assetIds: [],
  data: businessInvoiceExample,
  formatId: "a4",
  locale: "en",
  printProfile: { kind: "screen" },
  protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
  revision: 1,
  templateId: "invoice-business",
  templateVersion: "1.0.0",
  themeId: "neutral",
});
const bytes = await renderDocumentInNode(plan, createNodeAssetResolver(resolve("assets")));
await writeFile("node-output.pdf", bytes);
console.log("node-render-complete", bytes.byteLength);
`;

export const browserConsumerUsage = `import { PDF_RENDER_PROTOCOL_VERSION } from "../docn/core/contracts";
import { createBrowserAssetResolver } from "../docn/render/assets.browser";
import { renderDocumentInBrowser } from "../docn/render/browser";
import { createBusinessCardMinimalPlan } from "../docn/templates/business-cards/business-card-minimal/business-card-minimal";
import { minimalBusinessCardExampleFr } from "../docn/templates/business-cards/business-card-minimal/examples";
const { plan } = createBusinessCardMinimalPlan({
  assetIds: [],
  data: minimalBusinessCardExampleFr,
  formatId: "card-85x55",
  locale: "fr",
  printProfile: { kind: "screen" },
  protocolVersion: PDF_RENDER_PROTOCOL_VERSION,
  revision: 1,
  templateId: "business-card-minimal",
  templateVersion: "1.0.0",
  themeId: "neutral",
});
const bytes = await renderDocumentInBrowser(plan, createBrowserAssetResolver(window.location.origin));
const link = document.createElement("a");
const downloadUrl = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: "application/pdf" }));
link.href = downloadUrl;
link.download = "browser-output.pdf";
link.textContent = "Download browser PDF";
document.body.append(link);
const status = document.getElementById("status");
if (status) status.textContent = "ready";
window.addEventListener("pagehide", () => URL.revokeObjectURL(downloadUrl), { once: true });
`;

export const nodeConsumerBuildConfig = `import { resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  build: { outDir: "dist-node", ssr: "src/node-entry.ts", rollupOptions: { output: { entryFileNames: "node-entry.mjs" } } },
});
`;
