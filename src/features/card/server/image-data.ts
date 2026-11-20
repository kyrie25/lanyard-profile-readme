import sharp from "sharp";
import { readResponseBytes } from "@/features/card/server/read-response-bytes";

export type ImageDataUrl = `data:image/${string};base64,${string}`;
const maxImageBytes = 8_000_000;
const maxImagePixels = 4096 * 4096;

export async function loadImageDataUrl(url: string, width?: number): Promise<ImageDataUrl | undefined> {
  try {
    const response = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(5000) });
    const bytes = await readResponseBytes(response, maxImageBytes);
    if (!bytes) return undefined;

    const image = sharp(bytes, { animated: true, limitInputPixels: maxImagePixels });
    if (width === undefined) {
      const { mediaType } = await image.metadata();
      const subtype = /^image\/(.+)$/.exec(mediaType ?? "")?.[1];
      return subtype ? `data:image/${subtype};base64,${bytes.toString("base64")}` : undefined;
    }

    const webp = await image.resize({ width, height: width * 2, fit: "inside" }).webp({ quality: 50 }).toBuffer();
    return `data:image/webp;base64,${webp.toString("base64")}`;
  } catch {
    return undefined;
  }
}
