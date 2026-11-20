import type { ParsedCardConfig } from "@/features/card/config/schema";
import type { NormalizedCardData } from "@/features/card/domain/model";
import type { ImageDataUrl } from "@/features/card/server/image-data";

export interface PreparedCardAssets {
  avatar?: ImageDataUrl;
  banner?: ImageDataUrl;
  clanBadge?: ImageDataUrl;
  avatarDecoration?: ImageDataUrl;
  nameplateHex?: string;
  nameplateBg?: string;
  nameplateAsset?: ImageDataUrl;
  statusEmoji?: ImageDataUrl;
  activityLargeImage?: ImageDataUrl;
  activitySmallImage?: ImageDataUrl;
  spotifyAlbumArt?: ImageDataUrl;
  usesUnknownActivityImage: boolean;
  usesUnknownSpotifyImage: boolean;
}

export interface CardRenderContext extends NormalizedCardData {
  config: ParsedCardConfig;
  assets: PreparedCardAssets;
  flags: string[];
}
