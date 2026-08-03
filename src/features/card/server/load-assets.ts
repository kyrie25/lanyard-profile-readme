import { NAMEPLATES } from "@/features/card/domain/constants";
import type { CardParameters, ParsedCardConfig } from "@/features/card/config/schema";
import type { NormalizedCardData } from "@/features/card/domain/model";
import type { PreparedCardAssets } from "@/features/card/render/types";
import type { LanyardTypes } from "@/types/lanyard";
import { fetchAvatarDecoration, fetchUserBanner, getLargeImage } from "@/utils/actions";
import { Color } from "@/utils/color";
import { encodeBase64 } from "@/utils/toBase64";

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

function getClanBadgeUrl(discordUser: LanyardTypes.DiscordUser): string | null {
  if (!discordUser.clan?.badge) return null;
  return `https://cdn.discordapp.com/clan-badges/${discordUser.clan.identity_guild_id}/${discordUser.clan.badge}.png?size=16`;
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

export async function loadCardAssets(
  normalized: NormalizedCardData,
  config: ParsedCardConfig,
  params: CardParameters,
): Promise<PreparedCardAssets> {
  const { data, activity, userStatus } = normalized;
  const user = data.discord_user;
  const nameplate = user.collectibles?.nameplate;
  const nameplateHex = nameplate
    ? config.theme === "dark"
      ? NAMEPLATES[nameplate.palette].darkBackground
      : NAMEPLATES[nameplate.palette].lightBackground
    : undefined;
  const nameplateBg =
    nameplateHex && config.backgroundColor !== "transparent"
      ? `linear-gradient(90deg, ${new Color(nameplateHex).toString(0.1)} 0%, ${new Color(nameplateHex).toString(0.4)} 100%)`
      : undefined;
  const clanBadgeUrl = getClanBadgeUrl(user);
  const usesUnknownActivityImage = !activity?.assets?.large_image && !activity?.application_id;
  const usesUnknownSpotifyImage = !data.spotify?.album_art_url;

  const [
    avatar,
    banner,
    clanBadge,
    avatarDecoration,
    nameplateAsset,
    statusEmoji,
    activityLargeImage,
    activitySmallImage,
    spotifyAlbumArt,
  ] = await Promise.all([
    encodeBase64(
      getAvatarUrl(user, config.avatarExtension),
      config.avatarExtension === "gif" ? 64 : user.avatar ? 128 : 100,
    ),
    fetchUserBanner(user.id, config.showBanner).then(url => (url ? encodeBase64(url, 400) : "")),
    clanBadgeUrl ? encodeBase64(clanBadgeUrl, 16) : null,
    config.hideDecoration
      ? null
      : fetchAvatarDecoration(user, params.animatedDecoration).then(url => (url ? encodeBase64(url, 100, false) : null)),
    !config.hideNameplate && !config.hideProfile && nameplate
      ? encodeBase64(`https://cdn.discordapp.com/assets/collectibles/${nameplate.asset}static.png`, 100, false)
      : undefined,
    userStatus?.emoji?.id
      ? encodeBase64(`https://cdn.discordapp.com/emojis/${userStatus.emoji.id}.${config.statusExtension}`, 32)
      : undefined,
    activity
      ? (usesUnknownActivityImage
          ? Promise.resolve(UNKNOWN_IMAGE_URL)
          : getLargeImage(activity.assets ?? null, activity.application_id)
        ).then(url => encodeBase64(url, usesUnknownActivityImage ? 64 : 196))
      : undefined,
    activity?.assets
      ? (() => {
          const url = getSmallActivityImageUrl(activity.assets!, activity.application_id);
          return url ? encodeBase64(url, 64) : undefined;
        })()
      : undefined,
    data.listening_to_spotify && data.spotify
      ? encodeBase64(data.spotify.album_art_url || UNKNOWN_IMAGE_URL, 80)
      : undefined,
  ]);

  return {
    avatar,
    banner,
    clanBadge,
    avatarDecoration,
    nameplateHex: config.backgroundColor === "transparent" ? undefined : nameplateHex,
    nameplateBg,
    nameplateAsset,
    statusEmoji,
    activityLargeImage,
    activitySmallImage,
    spotifyAlbumArt,
    usesUnknownActivityImage,
    usesUnknownSpotifyImage,
  };
}
