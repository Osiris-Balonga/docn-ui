import type {
  ResolvedLocalImage,
  ResolvedLocalImageLookup,
} from "../renderable-template";
import type { PreparedLocalImages } from "./local-images";
import type { LocalImageId } from "../template-contract";

export interface BrowserLocalImageRenderScope {
  readonly lookup: ResolvedLocalImageLookup;
  dispose(): void;
}

export function createBrowserLocalImageRenderScope(
  images: PreparedLocalImages,
): BrowserLocalImageRenderScope {
  const objectUrls: string[] = [];
  const resolved = new Map<LocalImageId, ResolvedLocalImage>();
  try {
    for (const { bytes, descriptor } of images) {
      const ownedBytes = new Uint8Array(bytes);
      const objectUrl = URL.createObjectURL(
        new Blob([ownedBytes], { type: descriptor.mimeType }),
      );
      objectUrls.push(objectUrl);
      const resolvedImage: ResolvedLocalImage = Object.freeze({
        id: descriptor.id,
        resolvedSource: objectUrl,
      });
      resolved.set(descriptor.id, resolvedImage);
    }
  } catch (error) {
    for (const objectUrl of objectUrls) URL.revokeObjectURL(objectUrl);
    throw error;
  }
  let disposed = false;
  return {
    lookup: resolved,
    dispose() {
      if (disposed) return;
      disposed = true;
      resolved.clear();
      for (const objectUrl of objectUrls) URL.revokeObjectURL(objectUrl);
      objectUrls.length = 0;
    },
  };
}
