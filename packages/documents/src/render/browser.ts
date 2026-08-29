import { pdf } from "@react-pdf/renderer";
import {
  renderQualification,
  type QualificationRenderOptions,
} from "./qualification";

const browserFontSource = "/generated/fonts/noto-sans-latin-400-normal.woff";

export function renderQualificationInBrowser(
  options: Omit<QualificationRenderOptions, "fontSource">,
): Promise<Uint8Array> {
  return renderQualification(
    { ...options, fontSource: browserFontSource },
    async (document) => {
      const blob = await pdf(document).toBlob();
      return new Uint8Array(await blob.arrayBuffer());
    },
  );
}
