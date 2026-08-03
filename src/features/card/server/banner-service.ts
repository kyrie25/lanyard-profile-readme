import redis from "@/server/redis";

interface DiscordUserResponse {
  banner?: string | null;
}

interface UsrbgResponse {
  endpoint: string;
  bucket: string;
  prefix: string;
  users: Record<string, string>;
}

function discordBannerUrl(userId: string, banner: string, animated: boolean): string {
  return `https://cdn.discordapp.com/banners/${userId}/${banner}.${animated && banner.startsWith("a_") ? "gif?size=256" : "webp?size=1024"}`;
}

export async function fetchUserBanner(userId: string, showBanner: boolean | string): Promise<string> {
  if (!showBanner) return "";

  const cachedBanner = await redis.get(`banner-${userId}`).catch(() => null);
  if (cachedBanner) {
    try {
      return new URL(cachedBanner).toString();
    } catch {
      return discordBannerUrl(userId, cachedBanner, showBanner === "animated");
    }
  }

  const discordUser = await fetch(`${process.env.DISCORD_API_ENDPOINT}/${userId}`)
    .then(response => (response.ok ? (response.json() as Promise<DiscordUserResponse>) : null))
    .catch(() => null);
  if (discordUser?.banner) {
    await redis.set(`banner-${userId}`, discordUser.banner, "EX", 300).catch(() => null);
    return discordBannerUrl(userId, discordUser.banner, showBanner === "animated");
  }

  const usrbg = await fetch("https://usrbg.is-hardly.online/users")
    .then(response => (response.ok ? (response.json() as Promise<UsrbgResponse>) : null))
    .catch(() => null);
  const etag = usrbg?.users[userId];
  if (!usrbg || !etag) return "";

  const bannerUrl = `${usrbg.endpoint}/${usrbg.bucket}/${usrbg.prefix}${userId}?${etag}`;
  await redis.set(`banner-${userId}`, bannerUrl, "EX", 300).catch(() => null);
  return bannerUrl;
}
