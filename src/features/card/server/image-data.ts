import sharp from "sharp";

export type ImageDataUrl = `data:image/${string};base64,${string}`;

export async function loadImageDataUrl(url: string, width?: number): Promise<ImageDataUrl | undefined> {
  try {
    const response = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return undefined;

    const bytes = Buffer.from(await response.arrayBuffer());
    const image = sharp(bytes, { animated: true });
    if (width === undefined) {
      const { mediaType } = await image.metadata();
      const subtype = /^image\/(.+)$/.exec(mediaType ?? "")?.[1];
      return subtype ? `data:image/${subtype};base64,${bytes.toString("base64")}` : undefined;
    }

    const webp = await image.resize(width).webp({ quality: 50 }).toBuffer();
    return `data:image/webp;base64,${webp.toString("base64")}`;
  } catch {
    return undefined;
  }
}
