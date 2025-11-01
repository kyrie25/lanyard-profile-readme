import type { renderToStaticMarkup as _renderToStaticMarkup } from "react-dom/server";
import { DisplayNameStyleEffectID, DisplayNameStyles, type DiscordUser } from "./LanyardTypes";
import redis from "./redis";

export let renderToStaticMarkup: typeof _renderToStaticMarkup;
import("react-dom/server").then(module => {
  renderToStaticMarkup = module.renderToStaticMarkup;
});
import { Color, generateColorShades } from "./color";

export const getFlags = (flag: number): string[] => {
  let flags: string[] = [];

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

export const nameplates = {
  crimson: {
    darkBackground: "#900007",
    lightBackground: "#E7040F",
    name: "Crimson",
  },
  berry: {
    darkBackground: "#893A99",
    lightBackground: "#B11FCF",
    name: "Berry",
  },
  sky: {
    darkBackground: "#0080B7",
    lightBackground: "#56CCFF",
    name: "Sky",
  },
  teal: {
    darkBackground: "#086460",
    lightBackground: "#7DEED7",
    name: "Teal",
  },
  forest: {
    darkBackground: "#2D5401",
    lightBackground: "#6AA624",
    name: "Forest",
  },
  bubblegum: {
    darkBackground: "#DC3E97",
    lightBackground: "#F957B3",
    name: "BubbleGum",
  },
  violet: {
    darkBackground: "#730BC8",
    lightBackground: "#972FED",
    name: "Violet",
  },
  cobalt: {
    darkBackground: "#0131C2",
    lightBackground: "#4278FF",
    name: "Cobalt",
  },
  clover: {
    darkBackground: "#047B20",
    lightBackground: "#63CD5A",
    name: "Clover",
  },
  lemon: {
    darkBackground: "#F6CD12",
    lightBackground: "#FED400",
    name: "Lemon",
  },
  white: {
    darkBackground: "#FFFFFF",
    lightBackground: "#FFFFFF",
    name: "White",
  },
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

/**
 * Fetch and cache user banner from Discord API or USRBG
 */
export async function fetchUserBanner(userId: string, showBanner: boolean | string): Promise<string> {
  if (!showBanner) return "";

  let banner = (await redis.get(`banner-${userId}`).catch(() => null)) || "";

  if (!banner) {
    const userData = await fetch(`${process.env.DISCORD_API_ENDPOINT}/${userId}`)
      .then(res => (res.ok ? res.json() : null))
      .catch(() => null);

    if (userData?.banner) {
      const animatedBanner = showBanner === "animated" && userData.banner.startsWith("a_");
      banner = `https://cdn.discordapp.com/banners/${userId}/${userData.banner}.${animatedBanner ? "gif?size=256" : "webp?size=1024"}`;

      // Cache for 5 minutes
      await redis.set(`banner-${userId}`, userData.banner, "EX", 300).catch(() => null);
    } else {
      // Fetch banner from USRBG
      const usrbg = await fetch("https://usrbg.is-hardly.online/users")
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null);
      if (usrbg?.users?.[userId]) {
        const {
          endpoint,
          bucket,
          prefix,
          users: { [userId]: etag },
        } = usrbg;
        banner = `${endpoint}/${bucket}/${prefix}${userId}?${etag}`;

        // Cache for 5 minutes
        await redis.set(`banner-${userId}`, banner, "EX", 300).catch(() => null);
      }
    }
  } else {
    // If cache is an URL, it's from USRBG
    try {
      new URL(banner);
    } catch {
      const animatedBanner = showBanner === "animated" && banner.startsWith("a_");
      banner = `https://cdn.discordapp.com/banners/${userId}/${banner}.${animatedBanner ? "gif?size=256" : "webp?size=1024"}`;
    }
  }

  return banner;
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

/**
 * Fetch avatar decoration URL for a Discord user
 */
export async function fetchAvatarDecoration(
  discordUser: DiscordUser,
  animatedDecoration: string | undefined,
): Promise<string | null> {
  if (discordUser.avatar_decoration_data?.asset) {
    return `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png?size=64&passthrough=${animatedDecoration || "false"}`;
  } else {
    // Fetch decoration from Decor
    const decorData = await fetch(
      encodeURI(`https://decor.fieryflames.dev/api/users?ids=${JSON.stringify([discordUser.id])}`),
    )
      .then(res => (res.ok ? res.json() : null))
      .catch(() => null);

    if (decorData?.[discordUser.id]) {
      return `https://ugc.decor.fieryflames.dev/${decorData[discordUser.id]}.png`;
    }
  }

  return null;
}
