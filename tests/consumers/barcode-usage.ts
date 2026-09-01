// Append to the existing consumer entry points; reuse their local renderers/assets.
export const nodeBarcodeUsage = `
import { createPrimitiveBarcodesPlan } from "../docn/examples/primitive-barcodes";
const barcodeBytes = await renderDocumentInNode(createPrimitiveBarcodesPlan(), createNodeAssetResolver(resolve("assets")));
await writeFile("node-barcodes.pdf", barcodeBytes);
console.log("node-barcodes-complete", barcodeBytes.byteLength);
`;

export const browserBarcodeUsage = `
import { createPrimitiveBarcodesPlan } from "../docn/examples/primitive-barcodes";
const barcodeBytes = await renderDocumentInBrowser(createPrimitiveBarcodesPlan(), createBrowserAssetResolver(window.location.origin));
const barcodeLink = document.createElement("a");
const barcodeUrl = URL.createObjectURL(new Blob([barcodeBytes.slice().buffer], { type: "application/pdf" }));
barcodeLink.href = barcodeUrl;
barcodeLink.download = "browser-barcodes.pdf";
barcodeLink.textContent = "Download barcode PDF";
document.body.append(barcodeLink);
if (status) status.textContent = "ready-with-barcodes";
window.addEventListener("pagehide", () => URL.revokeObjectURL(barcodeUrl), { once: true });
`;
