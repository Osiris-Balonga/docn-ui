import { fileURLToPath } from "node:url";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  renderQualification,
  type QualificationRenderOptions,
} from "./qualification";

const nodeFontSource = fileURLToPath(
  new URL(
    "../../assets/fonts/noto-sans-latin-400-normal.woff",
    import.meta.url,
  ),
);

export function renderQualificationInNode(
  options: Omit<QualificationRenderOptions, "fontSource">,
): Promise<Uint8Array> {
  return renderQualification(
    { ...options, fontSource: nodeFontSource },
    async (document) => new Uint8Array(await renderToBuffer(document)),
  );
}
