import type { ParsedCardConfig } from "@/features/card/config/schema";
import type { NormalizedCardData } from "@/features/card/domain/model";

export interface PreparedCardAssets {
  avatar: string;
  banner: string;
  clanBadge: string | null;
  avatarDecoration: string | null;
  nameplateHex?: string;
  nameplateBg?: string;
  nameplateAsset?: string;
  statusEmoji?: string;
  activityLargeImage?: string;
  activitySmallImage?: string;
  spotifyAlbumArt?: string;
  usesUnknownActivityImage: boolean;
  usesUnknownSpotifyImage: boolean;
}

export interface CardRenderContext extends NormalizedCardData {
  config: ParsedCardConfig;
  assets: PreparedCardAssets;
  flags: string[];
}
