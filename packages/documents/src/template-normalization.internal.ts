import type {
  JsonObject,
  LocalImageId,
  NormalizationContext,
  NormalizedTemplateInput,
  ResolvedTemplateTheme,
  TemplateDescriptor,
  TemplateRenderInput,
} from "./template-contract";

interface PreparedNormalization {
  readonly imageIds: readonly LocalImageId[];
  readonly opaque: unknown;
  readonly resolvedTheme: ResolvedTemplateTheme;
  readonly themeWasExplicit: boolean;
}

interface TemplateNormalizationInternals {
  complete(
    descriptor: TemplateDescriptor<JsonObject>,
    opaque: unknown,
    context: NormalizationContext,
  ): NormalizedTemplateInput<JsonObject>;
  prepare(
    descriptor: TemplateDescriptor<JsonObject>,
    input: TemplateRenderInput<JsonObject>,
  ): PreparedNormalization;
}

let implementation: TemplateNormalizationInternals | undefined;

export function registerTemplateNormalizationInternals(
  value: TemplateNormalizationInternals,
): void {
  implementation = value;
}

export async function normalizeTemplateInputForRender<TData extends JsonObject>(
  descriptor: TemplateDescriptor<TData>,
  input: TemplateRenderInput<TData>,
  createContext: (prepared: {
    readonly imageIds: readonly LocalImageId[];
    readonly resolvedTheme: ResolvedTemplateTheme;
  }) => Promise<NormalizationContext>,
): Promise<{
  readonly normalized: NormalizedTemplateInput<TData>;
  readonly themeWasExplicit: boolean;
}> {
  if (!implementation) {
    throw new Error("Template normalization internals were not initialized.");
  }
  const prepared = implementation.prepare(
    descriptor as unknown as TemplateDescriptor<JsonObject>,
    input as unknown as TemplateRenderInput<JsonObject>,
  );
  const context = await createContext({
    imageIds: prepared.imageIds,
    resolvedTheme: prepared.resolvedTheme,
  });
  return {
    normalized: implementation.complete(
      descriptor as unknown as TemplateDescriptor<JsonObject>,
      prepared.opaque,
      context,
    ) as NormalizedTemplateInput<TData>,
    themeWasExplicit: prepared.themeWasExplicit,
  };
}
