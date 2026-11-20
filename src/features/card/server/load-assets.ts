import { NAMEPLATES } from "@/features/card/domain/constants";
import type { ParsedCardConfig } from "@/features/card/config/schema";
import type { NormalizedCardData } from "@/features/card/domain/model";
import type { PreparedCardAssets } from "@/features/card/render/types";
import type { LanyardTypes } from "@/types/lanyard";
import { fetchUserBanner } from "@/features/card/server/banner-service";
import { fetchAvatarDecoration, getLargeImage } from "@/features/card/server/discord-assets";
import { loadImageDataUrl } from "@/features/card/server/image-data";
import { loadNameplateAsset } from "@/features/card/server/nameplate-service";
import { Color } from "@/utils/color";

type ActivityAssets = LanyardTypes.Assets;

const UNKNOWN_IMAGE_URL = "https://lanyard.kyrie25.dev/assets/unknown.png";

export function getAvatarUrl(discordUser: LanyardTypes.DiscordUser, avatarExtension: string): string {
  if (discordUser.avatar) {
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`;
  }

  const fallbackIndex =
    discordUser.discriminator === "0"
      ? Number(BigInt(discordUser.id) >> BigInt(22)) % 6
      : Number(discordUser.discriminator) % 5;
  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

function getSmallActivityImageUrl(assets: ActivityAssets, applicationId?: string): string | null {
  if (!assets.small_image) return null;
  if (assets.small_image.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${assets.small_image.replace("mp:external/", "")}${assets.small_image.includes(".gif") ? "?width=50&height=50" : ""}`;
  }
  if (assets.small_image.startsWith("mp:attachments/")) {
    return `https://media.discordapp.net/attachments/${assets.small_image.replace("mp:attachments/", "")}${assets.small_image.includes(".gif") ? "&width=50&height=50" : ""}`;
  }
  return applicationId ? `https://cdn.discordapp.com/app-assets/${applicationId}/${assets.small_image}.webp` : null;
}

async function loadArtwork(url: string | undefined, width: number, fallbackWidth = width) {
  const src = url ? await loadImageDataUrl(url, width) : undefined;
  return src
    ? { src, usesFallback: false }
    : { src: await loadImageDataUrl(UNKNOWN_IMAGE_URL, fallbackWidth), usesFallback: true };
}

export async function loadCardAssets(
  normalized: NormalizedCardData,
  config: ParsedCardConfig,
): Promise<PreparedCardAssets> {
  const { data, panel, profile } = normalized;
  const user = data.discord_user;
  const { clan, nameplate } = profile ?? {};
  const emoji = profile?.status?.emoji;
  const activity = panel?.kind === "activity" ? panel.activity : undefined;
  const spotify = panel?.kind === "spotify" ? panel.spotify : undefined;
  const activitySmallUrl = activity?.assets ? getSmallActivityImageUrl(activity.assets, activity.application_id) : null;
  const palette = nameplate && NAMEPLATES[nameplate.palette];
  const nameplateHex =
    palette && config.backgroundColor !== "transparent"
      ? palette[config.theme === "dark" ? "darkBackground" : "lightBackground"]
      : undefined;

  const [
    avatar,
    banner,
    clanBadge,
    avatarDecoration,
    nameplateAsset,
    statusEmoji,
    activityArtwork,
    activitySmallImage,
    spotifyArtwork,
  ] = await Promise.all([
    profile
      ? loadImageDataUrl(
          getAvatarUrl(user, config.avatarExtension),
          config.avatarExtension === "gif" ? 64 : user.avatar ? 128 : 100,
        )
      : undefined,
    fetchUserBanner(user.id, config.showBanner).then(url => (url ? loadImageDataUrl(url, 400) : undefined)),
    clan?.badge
      ? loadImageDataUrl(
          `https://cdn.discordapp.com/clan-badges/${clan.identity_guild_id}/${clan.badge}.png?size=16`,
          16,
        )
      : undefined,
    profile?.showDecoration
      ? fetchAvatarDecoration(user, config.animatedDecoration).then(url => (url ? loadImageDataUrl(url) : undefined))
      : undefined,
    nameplate ? loadNameplateAsset(nameplate, config.animatedNameplate) : undefined,
    emoji?.id
      ? loadImageDataUrl(`https://cdn.discordapp.com/emojis/${emoji.id}.${config.statusExtension}`, 32)
      : undefined,
    activity
      ? getLargeImage(activity.assets, activity.application_id).then(url => loadArtwork(url, 196, 64))
      : undefined,
    activitySmallUrl ? loadImageDataUrl(activitySmallUrl, 64) : undefined,
    spotify ? loadArtwork(spotify.album_art_url, 80) : undefined,
  ]);

  return {
    avatar,
    banner,
    clanBadge,
    avatarDecoration,
    nameplateHex,
    nameplateBg: nameplateHex
      ? `linear-gradient(90deg, ${new Color(nameplateHex).toString(0.1)} 0%, ${new Color(nameplateHex).toString(0.4)} 100%)`
      : undefined,
    nameplateAsset,
    statusEmoji,
    activityLargeImage: activityArtwork?.src,
    activitySmallImage,
    spotifyAlbumArt: spotifyArtwork?.src,
    usesUnknownActivityImage: activityArtwork?.usesFallback ?? false,
    usesUnknownSpotifyImage: spotifyArtwork?.usesFallback ?? false,
  };
}
