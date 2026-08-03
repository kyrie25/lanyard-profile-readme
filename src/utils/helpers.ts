import { DisplayNameStyleEffectID, NAMEPLATES } from "@/features/card/domain/constants";
import type { CardParameters, ParsedCardConfig, UserAssets } from "@/features/card/config/schema";
import { Color, hexToRgb, generateColorShades } from "@/utils/color";
import { fetchUserBanner, fetchAvatarDecoration } from "@/utils/actions";
import { encodeBase64 } from "@/utils/toBase64";
import type { LanyardTypes } from "@/types/lanyard";

type DiscordUser = LanyardTypes.DiscordUser;
type DisplayNameStyles = LanyardTypes.DisplayNameStyles;
type Data = LanyardTypes.Data;
type Activity = LanyardTypes.Activity;
type Timestamps2 = LanyardTypes.Timestamps2;

export const getFlags = (flag: number): string[] => {
  const flags: string[] = [];

  // In the order they appear on profiles
  if (flag & 1) flags.push("Discord_Employee"); // 1 << 0
  if (flag & 262144) flags.push("Discord_Certified_Moderator"); // 1 << 18
  if (flag & 2) flags.push("Partnered_Server_Owner"); // 1 << 1
  if (flag & 4) flags.push("HypeSquad_Events"); // 1 << 2
  if (flag & 64) flags.push("House_Bravery"); // 1 << 6
  if (flag & 128) flags.push("House_Brilliance"); // 1 << 7
  if (flag & 256) flags.push("House_Balance"); // 1 << 8
  if (flag & 8) flags.push("Bug_Hunter_Level_1"); // 1 << 3
  if (flag & 16384) flags.push("Bug_Hunter_Level_2"); // 1 << 14
  if (flag & 4194304) flags.push("Active_Developer"); // 1 << 22
  if (flag & 131072) flags.push("Early_Verified_Bot_Developer"); // 1 << 17
  if (flag & 512) flags.push("Early_Supporter"); // 1 << 9

  return flags;
};

export function getDisplayNameStyleClassname({ effect_id }: DisplayNameStyles): string {
  switch (effect_id) {
    case DisplayNameStyleEffectID.SOLID:
      return "solid";
    case DisplayNameStyleEffectID.GRADIENT:
      return "gradient";
    case DisplayNameStyleEffectID.NEON:
      return "neon";
    case DisplayNameStyleEffectID.TOON:
      return "toon";
    case DisplayNameStyleEffectID.POP:
      return "pop";
    case DisplayNameStyleEffectID.GLOW:
      return "glow";
    default:
      return "";
  }
}

export function getDisplayNameStyleEffectVars(styles: DisplayNameStyles | null): Record<string, string> {
  if (!styles) return {};

  const { effect_id, colors } = styles;
  if (!colors || colors.length === 0) return {};

  const mainColor = new Color().setFromInt(colors[0]).toHex();
  if (colors.length === 2 && effect_id === DisplayNameStyleEffectID.GRADIENT) {
    return {
      "--custom-display-name-styles-main-color": mainColor,
      "--custom-display-name-styles-gradient-start-color": mainColor,
      "--custom-display-name-styles-gradient-end-color": new Color().setFromInt(colors[1]).toHex(),
    };
  }

  const colorShades = generateColorShades(new Color().setFromInt(colors[0]).toHex());
  return {
    "--custom-display-name-styles-main-color": colorShades.main,
    "--custom-display-name-styles-light-1-color": colorShades.light1,
    "--custom-display-name-styles-light-2-color": colorShades.light2,
    "--custom-display-name-styles-dark-1-color": colorShades.dark1,
    "--custom-display-name-styles-dark-2-color": colorShades.dark2,
  };
}

export const getFormatFromMs = (ms: number) => {
  const daysDifference = Math.floor(ms / 60 / 60 / 24);
  ms -= daysDifference * 60 * 60 * 24;

  const hoursDifference = Math.floor(ms / 60 / 60);
  ms -= hoursDifference * 60 * 60;

  const minutesDifference = Math.floor(ms / 60);
  ms -= minutesDifference * 60;

  const secondsDifference = Math.floor(ms);

  return `${hoursDifference >= 1 ? ("0" + hoursDifference).slice(-2) + ":" : ""}${("0" + minutesDifference).slice(
    -2,
  )}:${("0" + secondsDifference).slice(-2)}`;
};

export const formatTime = (timestamps: Timestamps2) => {
  const { start, end } = timestamps;
  // End timestamps is prioritized over start timestamps and displayed accordingly.
  const startTime = new Date(end || start).getTime();
  const endTime = Number(new Date());
  const difference = end ? (startTime - endTime) / 1000 : (endTime - startTime) / 1000;
  if (difference < 0) return `00:00 ${end ? "left" : "elapsed"}`;

  return `${getFormatFromMs(difference)} ${end ? "left" : "elapsed"}`;
};

export const getBlendedColor = (color1: string, color2: string, theme: string, opacity = 1) => {
  if (color1 === "transparent") return "transparent";
  if (color2 === "transparent") color2 = "#fff";

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const midpoint = theme === "dark" ? 3 : 8;
  if (rgb1?.length !== 3 || rgb2?.length !== 3) return "#fff";

  const calculateBlend = (a: number, b: number) => {
    const baseColor = a < b ? a : b;
    const difference = Math.abs(a - b);
    return baseColor + Math.floor(difference / 11) * midpoint;
  };

  const avgR = calculateBlend(rgb1[0], rgb2[0]);
  const avgG = calculateBlend(rgb1[1], rgb2[1]);
  const avgB = calculateBlend(rgb1[2], rgb2[2]);

  return new Color(avgR, avgG, avgB).toString(opacity);
};

export function getPrefixActivityString(activity: Activity) {
  switch (activity.type) {
    case 1:
      return "Streaming";
    case 2:
      return "Listening to";
    case 3:
      return "Watching";
    case 5:
      return "Competing in";
    case 0:
    default:
      return "";
  }
}

/**
 * Get avatar URL for a Discord user
 */
export function getAvatarUrl(discordUser: DiscordUser, avatarExtension: string): string {
  if (discordUser.avatar) {
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`;
  } else {
    return `https://cdn.discordapp.com/embed/avatars/${
      discordUser.discriminator === "0"
        ? Number(BigInt(discordUser.id) >> BigInt(22)) % 6
        : Number(discordUser.discriminator) % 5
    }.png`;
  }
}

/**
 * Get clan badge URL for a Discord user
 */
export function getClanBadgeUrl(discordUser: DiscordUser): string | null {
  if (!discordUser.clan?.badge) return null;
  return `https://cdn.discordapp.com/clan-badges/${discordUser.clan.identity_guild_id}/${discordUser.clan.badge}.png?size=16`;
}

export async function prepareUserAssets(
  data: Data,
  config: ParsedCardConfig,
  params: CardParameters,
): Promise<UserAssets> {
  const { avatarExtension, backgroundColor, theme, hideDecoration, hideProfile, hideNameplate, showBanner } = config;

  // Fetch banner
  const banner = await fetchUserBanner(data.discord_user.id, showBanner);

  // Fetch and encode avatar
  const avatar = await encodeBase64(
    getAvatarUrl(data.discord_user, avatarExtension),
    avatarExtension === "gif" ? 64 : data.discord_user.avatar ? 128 : 100,
  );

  // Fetch and encode clan badge
  let clanBadge: string | null = null;
  const clanBadgeUrl = getClanBadgeUrl(data.discord_user);
  if (clanBadgeUrl) {
    clanBadge = await encodeBase64(clanBadgeUrl, 16);
  }

  // Fetch and encode avatar decoration
  let avatarDecoration: string | null = null;
  if (!hideDecoration) {
    const decorationUrl = await fetchAvatarDecoration(data.discord_user, params.animatedDecoration);
    if (decorationUrl) {
      avatarDecoration = await encodeBase64(decorationUrl, 100, false);
    }
  }

  // Process nameplate
  let nameplateHex: string | undefined = undefined;
  let nameplateBg: string | undefined = undefined;
  let nameplateAsset: string | undefined = undefined;
  const userNameplate = data.discord_user.collectibles?.nameplate;
  if (!hideNameplate && !hideProfile && userNameplate) {
    const hex =
      theme === "dark"
        ? NAMEPLATES[userNameplate.palette].darkBackground
        : NAMEPLATES[userNameplate.palette].lightBackground;
    const color = new Color(hex);
    nameplateHex = backgroundColor === "transparent" ? undefined : hex;
    nameplateBg =
      backgroundColor === "transparent"
        ? undefined
        : `linear-gradient(90deg, ${color.toString(0.1)} 0%, ${color.toString(0.4)} 100%)`;
    nameplateAsset = await encodeBase64(
      `https://cdn.discordapp.com/assets/collectibles/${userNameplate.asset}static.png`,
      100,
      false,
    );
  }

  return {
    avatar,
    banner,
    clanBadge,
    avatarDecoration,
    nameplateHex,
    nameplateBg,
    nameplateAsset,
  };
}

export function getAvatarBorderColor(status: string): string {
  switch (status) {
    case "online":
      return "#43B581";
    case "idle":
      return "#FAA61A";
    case "dnd":
      return "#F04747";
    case "offline":
    default:
      return "#747F8D";
  }
}

export function processActivities(data: Data, ignoreAppId: string[]): Activity | false {
  const activities = data.activities
    .filter((activity: Activity) => [0, 1, 2, 3, 5].includes(activity.type))
    .filter((activity: Activity) => !ignoreAppId.includes(activity.application_id ?? ""))
    .filter((activity: Activity) => !data.listening_to_spotify || activity.type !== 2)
    .sort((a: Activity, b: Activity) => a.type - b.type);

  return Array.isArray(activities) ? activities[0] : activities;
}

export function calculateDimensions(
  hideProfile: boolean,
  hideActivity: string,
  activity: any,
  listeningToSpotify: boolean,
  hideSpotify: boolean,
): { svgHeight: string; divHeight: string } {
  let svgHeight: string;
  let divHeight: string;

  if (hideProfile) {
    svgHeight = "130";
    divHeight = "120";
  } else if (hideActivity === "true") {
    svgHeight = "80";
    divHeight = "80";
  } else if (hideActivity === "whenNotUsed" && !activity && !listeningToSpotify) {
    svgHeight = "80";
    divHeight = "80";
  } else if (hideSpotify && listeningToSpotify) {
    svgHeight = "200";
    divHeight = "200";
  } else {
    svgHeight = "200";
    divHeight = "200";
  }

  return { svgHeight, divHeight };
}
