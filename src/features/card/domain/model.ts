import type { ParsedCardConfig } from "@/features/card/config/schema";
import type { LanyardTypes } from "@/types/lanyard";

type Activity = LanyardTypes.Activity;
type Data = LanyardTypes.Data;
type Root = LanyardTypes.Root;

export interface CardDimensions {
  svgHeight: string;
  divHeight: string;
}

export interface NormalizedCardData {
  data: Data;
  activity: Activity | null;
  userStatus: Activity | null;
  avatarBorderColor: string;
  dimensions: CardDimensions;
  renderedAt: number;
}

export function selectPrimaryActivity(data: Data, ignoreAppId: string[]): Activity | null {
  return (
    data.activities
      .filter(activity => [0, 1, 2, 3, 5].includes(activity.type))
      .filter(activity => !ignoreAppId.includes(activity.application_id ?? ""))
      .filter(activity => !data.listening_to_spotify || activity.type !== 2)
      .sort((a, b) => a.type - b.type)[0] ?? null
  );
}

export function getCardDimensions(
  config: ParsedCardConfig,
  activity: Activity | null,
  data: Data,
): CardDimensions {
  if (config.hideProfile) return { svgHeight: "130", divHeight: "120" };
  if (config.hideActivity === "true") return { svgHeight: "80", divHeight: "80" };
  if (config.hideActivity === "whenNotUsed" && !activity && !data.listening_to_spotify) {
    return { svgHeight: "80", divHeight: "80" };
  }

  return { svgHeight: "200", divHeight: "200" };
}

export function getAvatarBorderColor(status: string): string {
  switch (status) {
    case "online":
      return "#43B581";
    case "idle":
      return "#FAA61A";
    case "dnd":
      return "#F04747";
    default:
      return "#747F8D";
  }
}

export function normalizeCardData(
  body: Root,
  config: ParsedCardConfig,
  renderedAt = Date.now(),
): NormalizedCardData {
  const discordUser = {
    ...body.data.discord_user,
    clan: body.data.discord_user.clan ?? body.data.discord_user.primary_guild,
    username:
      config.showDisplayName && body.data.discord_user.global_name
        ? body.data.discord_user.global_name
        : body.data.discord_user.username,
  };
  const data: Data = {
    ...body.data,
    discord_user: discordUser,
    activities: [...body.data.activities],
  };
  const activity = selectPrimaryActivity(data, config.ignoreAppId);

  return {
    data,
    activity,
    userStatus: data.activities[0]?.type === 4 ? data.activities[0] : null,
    avatarBorderColor: getAvatarBorderColor(data.discord_status),
    dimensions: getCardDimensions(config, activity, data),
    renderedAt,
  };
}
