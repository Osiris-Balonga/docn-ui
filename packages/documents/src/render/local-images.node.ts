import type {
  ResolvedLocalImage,
  ResolvedLocalImageLookup,
} from "../renderable-template";
import type { PreparedLocalImages } from "./local-images";

export interface LocalImageRenderScope {
  readonly lookup: ResolvedLocalImageLookup;
  dispose(): void;
}

export function createNodeLocalImageRenderScope(
  images: PreparedLocalImages,
): LocalImageRenderScope {
  const resolved = new Map(
    images.map(({ bytes, descriptor }) => {
      const ownedBytes = new Uint8Array(bytes);
      const resolvedImage: ResolvedLocalImage = Object.freeze({
        id: descriptor.id,
        resolvedSource: `data:${descriptor.mimeType};base64,${Buffer.from(ownedBytes).toString("base64")}`,
      });
      return [descriptor.id, resolvedImage] as const;
    }),
  );
  let disposed = false;
  return {
    lookup: resolved,
    dispose() {
      if (disposed) return;
      disposed = true;
      resolved.clear();
    },
  };
}
