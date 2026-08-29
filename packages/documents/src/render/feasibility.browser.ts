import {
  renderFeasibilityFixture,
  type FeasibilityRenderOptions,
} from "./feasibility-fixtures";
import { createBrowserDocumentRuntime } from "./browser";

export function renderFeasibilityFixtureInBrowser(
  options: FeasibilityRenderOptions,
): Promise<Uint8Array> {
  return renderFeasibilityFixture(options, createBrowserDocumentRuntime());
}
