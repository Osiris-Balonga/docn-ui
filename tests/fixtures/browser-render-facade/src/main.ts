import {
  createBrowserRenderCoordinator,
  renderPdf,
} from "@docn-ui/documents/browser";
import {
  continuousFeasibilityRenderable,
  flowFeasibilityRenderable,
} from "@docn-ui/documents/continuous-evidence";
import { registerDocumentFonts } from "@docn-ui/documents/internal-fonts";
import { assetManifest } from "@docn-ui/documents/internal-manifest";
import { violetFounderBusinessCardRenderable } from "@docn-ui/documents/templates";
import { Font } from "@react-pdf/renderer";

declare global {
  interface Window {
    __docnBrowserResult?: {
      firstCopyHeader: string;
      continuous: {
        fingerprint: string;
        heightMm: number;
        pageCount: number;
        widthMm: number;
      };
      fingerprint: string;
      flow: {
        heightMm: number;
        pageCount: number;
        widthMm: number;
      };
      fontSourceCounts: readonly number[];
      worker: {
        latestRevision: number;
        staleDuringReplacement: boolean;
        superseded: boolean;
        timedOut: boolean;
        terminatedOnNavigation: boolean;
      };
      pageCount: number;
      revision: number;
      secondCopyHeader: string;
      sizes: readonly { heightMm: number; widthMm: number }[];
    };
  }
}

const status = document.querySelector("#status");

function fontSourceCount(): number {
  const families = Font.getRegisteredFonts() as Record<
    string,
    { sources: unknown[] } | undefined
  >;
  return ["Noto Sans", "Noto Serif"].reduce(
    (total, family) => total + (families[family]?.sources.length ?? 0),
    0,
  );
}

async function seedCanonicalAdvancedFontCache(): Promise<void> {
  const sources = new Map<string, string>();
  for (const asset of assetManifest.assets) {
    const bytes = new Uint8Array(
      await (await fetch(asset.publicPath)).arrayBuffer(),
    );
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    }
    sources.set(asset.id, `data:font/woff;base64,${btoa(binary)}`);
  }
  registerDocumentFonts({
    resolve(assetId) {
      const definition = assetManifest.assets.find(({ id }) => id === assetId);
      const source = sources.get(assetId);
      if (!definition || !source) throw new Error("Missing fixture font.");
      return { definition, source };
    },
  });
}

try {
  await seedCanonicalAdvancedFontCache();
  const result = await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
    revision: 23,
  });
  const firstCopy = new Uint8Array(result.pdfBytes);
  const secondCopy = new Uint8Array(result.pdfBytes);
  const fontSourceCounts = [fontSourceCount()];
  await renderPdf(violetFounderBusinessCardRenderable, {
    data: {},
    revision: 23,
  });
  fontSourceCounts.push(fontSourceCount());
  for (let index = 0; index < 3; index += 1) {
    Font.reset();
    await renderPdf(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 23,
    });
    fontSourceCounts.push(fontSourceCount());
  }
  const continuousResult = await renderPdf(continuousFeasibilityRenderable, {
    data: {},
    revision: 24,
  });
  const flowResult = await renderPdf(flowFeasibilityRenderable, {
    data: {},
    revision: 26,
  });
  const coordinator = createBrowserRenderCoordinator({ timeoutMs: 30_000 });
  const workerInitial = await coordinator.render(
    violetFounderBusinessCardRenderable,
    { data: {}, revision: 100 },
  );
  const supersededPromise = coordinator.render(
    violetFounderBusinessCardRenderable,
    { data: {}, revision: 101 },
  );
  const supersededCheck = supersededPromise.then(
    () => false,
    () => true,
  );
  const latestPromise = coordinator.render(
    violetFounderBusinessCardRenderable,
    {
      data: {},
      revision: 102,
    },
  );
  const staleDuringReplacement = coordinator.getSnapshot().stale;
  const workerLatest = await latestPromise;
  const superseded = await supersededCheck;
  coordinator.dispose();

  const timeoutCoordinator = createBrowserRenderCoordinator({ timeoutMs: 1 });
  const timedOut = await timeoutCoordinator
    .render(violetFounderBusinessCardRenderable, { data: {}, revision: 200 })
    .then(
      () => false,
      () => true,
    );
  timeoutCoordinator.dispose();

  const navigationCoordinator = createBrowserRenderCoordinator({
    timeoutMs: 30_000,
  });
  const navigationRender = navigationCoordinator
    .render(violetFounderBusinessCardRenderable, {
      data: {},
      revision: 300,
    })
    .then(
      () => false,
      () => true,
    );
  globalThis.dispatchEvent(new Event("pagehide"));
  const terminatedOnNavigation = await navigationRender;
  navigationCoordinator.dispose();
  window.__docnBrowserResult = {
    continuous: {
      fingerprint: continuousResult.fingerprint,
      heightMm: continuousResult.finalDimensions[0]?.heightMm ?? 0,
      pageCount: continuousResult.pageCount,
      widthMm: continuousResult.finalDimensions[0]?.widthMm ?? 0,
    },
    firstCopyHeader: new TextDecoder().decode(firstCopy.slice(0, 4)),
    fingerprint: result.fingerprint,
    flow: {
      heightMm: flowResult.finalDimensions[0]?.heightMm ?? 0,
      pageCount: flowResult.pageCount,
      widthMm: flowResult.finalDimensions[0]?.widthMm ?? 0,
    },
    fontSourceCounts,
    pageCount: result.pageCount,
    revision: result.revision,
    secondCopyHeader: new TextDecoder().decode(secondCopy.slice(0, 4)),
    sizes: result.finalDimensions.map(({ heightMm, widthMm }) => ({
      heightMm,
      widthMm,
    })),
    worker: {
      latestRevision: workerLatest.revision,
      staleDuringReplacement:
        workerInitial.revision === 100 && staleDuringReplacement,
      superseded,
      timedOut,
      terminatedOnNavigation,
    },
  };
  if (status) status.textContent = "ready";
} catch (error) {
  if (status) status.textContent = `error: ${String(error)}`;
  throw error;
}
