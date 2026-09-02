import { createCanvas } from "@napi-rs/canvas";
import {
  BinaryBitmap,
  Code128Reader,
  EAN13Reader,
  HybridBinarizer,
  RGBLuminanceSource,
} from "@zxing/library";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/** Decode actual PDF raster regions. Never pass encoder modules to the oracle. */
export async function decodeBarcodeSpecimen(
  bytes: Uint8Array,
): Promise<string[]> {
  const task = getDocument({ data: bytes.slice(), useSystemFonts: false });
  try {
    const document = await task.promise;
    const page = await document.getPage(1);
    const scale = 3;
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );
    const context = canvas.getContext("2d");
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    return [
      new Code128Reader(),
      new EAN13Reader(),
      new Code128Reader(),
      new EAN13Reader(),
    ].map((reader, index) => {
      const image = context.getImageData(
        32 * scale,
        (130 + index * 160) * scale,
        360 * scale,
        120 * scale,
      );
      const gray = new Uint8ClampedArray(image.width * image.height);
      for (let pixel = 0; pixel < gray.length; pixel++)
        gray[pixel] =
          (image.data[pixel * 4]! +
            image.data[pixel * 4 + 1]! * 2 +
            image.data[pixel * 4 + 2]!) /
          4;
      const bitmap = new BinaryBitmap(
        new HybridBinarizer(
          new RGBLuminanceSource(gray, image.width, image.height),
        ),
      );
      return reader.decode(bitmap).getText();
    });
  } finally {
    await task.destroy();
  }
}
