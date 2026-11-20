import { execFile } from "node:child_process";
import { promisify } from "node:util";

import ffmpegPath from "ffmpeg-static";
import { unstable_cache } from "next/cache";
import { loadImageDataUrl, type ImageDataUrl } from "@/features/card/server/image-data";
import type { LanyardTypes } from "@/types/lanyard";

const runFfmpeg = promisify(execFile);
const maxVideoBytes = 2_000_000;
const maxWebpBytes = 650_000;

const loadAnimatedNameplate = unstable_cache(async (skuId: string): Promise<ImageDataUrl> => {
  if (!ffmpegPath) throw new Error("FFmpeg is unavailable");

  const response = await fetch(`https://cdn.discordapp.com/media/v1/collectibles-shop/${skuId}/video`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok || Number(response.headers.get("content-length")) > maxVideoBytes) {
    throw new Error("Discord nameplate video is unavailable or too large");
  }

  const input = Buffer.from(await response.arrayBuffer());
  if (input.length > maxVideoBytes) throw new Error("Discord nameplate video is too large");

  // FFmpeg's native VP9 decoder drops the alpha channel in Discord's WebM files.
  const conversion = runFfmpeg(
    ffmpegPath,
    [
      "-loglevel",
      "error",
      "-threads",
      "2",
      "-c:v",
      "libvpx-vp9",
      "-f",
      "webm",
      "-i",
      "pipe:0",
      "-map",
      "0:v:0",
      "-filter_threads",
      "1",
      "-vf",
      "fps=12,scale=384:72:force_original_aspect_ratio=decrease:force_divisible_by=2",
      "-c:v",
      "libwebp_anim",
      "-threads",
      "1",
      "-quality",
      "60",
      "-compression_level",
      "1",
      "-loop",
      "0",
      "-f",
      "webp",
      "pipe:1",
    ],
    { encoding: "buffer", timeout: 5000, maxBuffer: maxWebpBytes, killSignal: "SIGKILL" },
  );
  conversion.child.stdin?.on("error", () => {}).end(input);
  const { stdout } = await conversion;
  if (!stdout.length) throw new Error("FFmpeg returned an empty nameplate image");

  return `data:image/webp;base64,${stdout.toString("base64")}`;
});

export async function loadNameplateAsset(nameplate: LanyardTypes.Nameplate, animated: boolean) {
  if (animated && /^\d+$/.test(nameplate.sku_id)) {
    const asset = await loadAnimatedNameplate(nameplate.sku_id).catch(() => undefined);
    if (asset) return asset;
  }

  return loadImageDataUrl(`https://cdn.discordapp.com/assets/collectibles/${nameplate.asset}static.png`);
}
