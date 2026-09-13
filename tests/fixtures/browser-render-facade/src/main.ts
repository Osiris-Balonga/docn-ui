import { renderPdf } from "@docn-ui/documents/browser";
import { violetFounderBusinessCardRenderable } from "@docn-ui/documents/templates";

declare global {
  interface Window {
    __docnBrowserResult?: {
      firstCopyHeader: string;
      fingerprint: string;
      pageCount: number;
      revision: number;
      secondCopyHeader: string;
      sizes: readonly { heightMm: number; widthMm: number }[];
    };
  }
}

const status = document.querySelector("#status");

try {
  const result = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
    revision: 23,
  });
  const firstCopy = new Uint8Array(result.pdfBytes);
  const secondCopy = new Uint8Array(result.pdfBytes);
  window.__docnBrowserResult = {
    firstCopyHeader: new TextDecoder().decode(firstCopy.slice(0, 4)),
    fingerprint: result.fingerprint,
    pageCount: result.pageCount,
    revision: result.revision,
    secondCopyHeader: new TextDecoder().decode(secondCopy.slice(0, 4)),
    sizes: result.finalDimensions.map(({ heightMm, widthMm }) => ({
      heightMm,
      widthMm,
    })),
  };
  if (status) status.textContent = "ready";
} catch (error) {
  if (status) status.textContent = `error: ${String(error)}`;
  throw error;
}
