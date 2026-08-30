import { createLabelPlan, type LabelPlanOptions } from "../plan";
import { labelProductMetadata } from "./metadata";

export function createLabelProductPlan(
  input: unknown,
  options?: LabelPlanOptions,
) {
  return createLabelPlan(input, labelProductMetadata, "product", options);
}
