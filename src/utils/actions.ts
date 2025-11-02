"use server";
import type { LanyardTypes } from "@/types/lanyard";
type DiscordUser = LanyardTypes.DiscordUser;
type Assets = LanyardTypes.Assets;
import redis from "@/utils/redis";

export async function getUserCount() {
  const users = await redis.hgetall("users");
  if (!users) {
    return 0;
  }
  const count = Object.keys(users);

  return count.length;
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

export async function getLargeImage(asset: Assets | null, application_id?: string): Promise<string> {
  if (asset?.large_image) {
    return asset.large_image.startsWith("mp:external/")
      ? `https://media.discordapp.net/external/${asset.large_image.replace(
          "mp:external/",
          "",
        )}${asset.large_image.includes(".gif") ? "?width=160&height=160" : ""}`
      : asset.large_image.startsWith("mp:attachments/")
        ? `https://media.discordapp.net/attachments/${asset.large_image.replace("mp:attachments/", "")}${asset.large_image.includes(".gif") ? "&width=160&height=160" : ""}`
        : `https://cdn.discordapp.com/app-assets/${application_id}/${asset.large_image}.webp`;
  }

  const res = await fetch(`${process.env.DISCORD_API_ENDPOINT}/${application_id}`);
  const data = res.ok ? await res.json() : null;

  if (
    !data?.id ||
    (await fetch(`https://cdn.discordapp.com/app-icons/${application_id}/${data.avatar}.webp`, { method: "HEAD" }))
      .status !== 200
  ) {
    return "https://lanyard.kyrie25.dev/assets/unknown.png";
  }

  return `https://cdn.discordapp.com/app-icons/${application_id}/${data.avatar}.webp`;
}
