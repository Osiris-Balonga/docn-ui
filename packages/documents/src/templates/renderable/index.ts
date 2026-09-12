import { assertTemplateIdSubset } from "../../template-ids";
import { violetFounderBusinessCardRenderable } from "./violet-founder-business-card";

export { violetFounderBusinessCardRenderable } from "./violet-founder-business-card";
export type { VioletFounderBusinessCardData } from "./violet-founder-business-card";

export const renderableTemplates = Object.freeze({
  "business-card-violet-founder": violetFounderBusinessCardRenderable,
});

assertTemplateIdSubset(Object.keys(renderableTemplates), [
  "renderableTemplates",
]);

export type RenderableTemplateId = keyof typeof renderableTemplates;

export function getRenderableTemplate(templateId: string) {
  return Object.hasOwn(renderableTemplates, templateId)
    ? renderableTemplates[templateId as RenderableTemplateId]
    : undefined;
}
