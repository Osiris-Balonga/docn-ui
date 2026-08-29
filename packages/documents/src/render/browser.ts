import { pdf } from "@react-pdf/renderer";
import {
  renderQualification,
  type QualificationRenderOptions,
} from "./qualification";
import { createBrowserAssetResolver } from "./assets.browser";

export { createBrowserAssetResolver } from "./assets.browser";

export function renderQualificationInBrowser(
  options: Omit<QualificationRenderOptions, "assetResolver">,
): Promise<Uint8Array> {
  return renderQualification(
    { ...options, assetResolver: createBrowserAssetResolver() },
    async (document) => {
      const blob = await pdf(document).toBlob();
      return new Uint8Array(await blob.arrayBuffer());
    },
  );
}
