import { createLabelPlan, type LabelPlanOptions } from "../plan";
import { labelInventoryMetadata } from "./metadata";

export function createLabelInventoryPlan(
  input: unknown,
  options?: LabelPlanOptions,
) {
  return createLabelPlan(input, labelInventoryMetadata, "inventory", options);
}
