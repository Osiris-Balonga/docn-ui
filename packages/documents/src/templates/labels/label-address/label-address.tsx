import { createLabelPlan, type LabelPlanOptions } from "../plan";
import { labelAddressMetadata } from "./metadata";

export function createLabelAddressPlan(
  input: unknown,
  options?: LabelPlanOptions,
) {
  return createLabelPlan(input, labelAddressMetadata, "address", options);
}
