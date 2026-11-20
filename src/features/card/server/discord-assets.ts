import type { LanyardTypes } from "@/types/lanyard";

type Assets = LanyardTypes.Assets;
type DiscordUser = LanyardTypes.DiscordUser;

export async function fetchAvatarDecoration(
  discordUser: DiscordUser,
  animatedDecoration: boolean,
): Promise<string | null> {
  if (discordUser.avatar_decoration_data?.asset) {
    return `https://cdn.discordapp.com/avatar-decoration-presets/${discordUser.avatar_decoration_data.asset}.png?size=64&passthrough=${animatedDecoration}`;
  }

  const decorData = await fetch(
    encodeURI(`https://decor.fieryflames.dev/api/users?ids=${JSON.stringify([discordUser.id])}`),
    { signal: AbortSignal.timeout(3000) },
  )
    .then(response => (response.ok ? (response.json() as Promise<Record<string, string>>) : null))
    .catch(() => null);

  return decorData?.[discordUser.id]
    ? `https://ugc.decor.fieryflames.dev/${decorData[discordUser.id]}.png`
    : null;
}

export async function getLargeImage(assets: Assets | undefined, applicationId?: string): Promise<string | undefined> {
  if (assets?.large_image) {
    if (assets.large_image.startsWith("mp:external/")) {
      return `https://media.discordapp.net/external/${assets.large_image.replace("mp:external/", "")}${assets.large_image.includes(".gif") ? "?width=160&height=160" : ""}`;
    }
    if (assets.large_image.startsWith("mp:attachments/")) {
      return `https://media.discordapp.net/attachments/${assets.large_image.replace("mp:attachments/", "")}${assets.large_image.includes(".gif") ? "&width=160&height=160" : ""}`;
    }
    return applicationId ? `https://cdn.discordapp.com/app-assets/${applicationId}/${assets.large_image}.webp` : undefined;
  }

  const endpoint = process.env.DISCORD_API_ENDPOINT;
  if (!endpoint || !applicationId) return undefined;
  const application = await fetch(`${endpoint}/${applicationId}`, { signal: AbortSignal.timeout(5000) })
    .then(response => (response.ok ? (response.json() as Promise<{ id?: string; avatar?: string }>) : null))
    .catch(() => null);
  return application?.id && application.avatar
    ? `https://cdn.discordapp.com/app-icons/${applicationId}/${application.avatar}.webp`
    : undefined;
}
