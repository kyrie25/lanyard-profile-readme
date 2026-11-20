import type { ParsedCardConfig } from "@/features/card/config/schema";
import type { LanyardTypes } from "@/types/lanyard";

type Activity = LanyardTypes.Activity;
type Data = LanyardTypes.Data;
type Root = LanyardTypes.Root;

export interface CardDimensions {
  svgHeight: string;
  divHeight: string;
}

type CardPanel =
  { kind: "activity"; activity: Activity } | { kind: "spotify"; spotify: LanyardTypes.Spotify } | { kind: "idle" };

interface CardProfile {
  status: Activity | null;
  clan: LanyardTypes.ClanTag | null;
  nameplate: LanyardTypes.Nameplate | undefined;
  showDecoration: boolean;
}

export interface NormalizedCardData {
  data: Data;
  profile: CardProfile | null;
  panel: CardPanel | null;
  hasNitroIndicators: boolean;
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

function selectPanel(data: Data, config: ParsedCardConfig): CardPanel | null {
  if (config.hideActivity === "true") return null;

  const activity = selectPrimaryActivity(data, config.ignoreAppId);
  if (activity) return { kind: "activity", activity };
  if (data.listening_to_spotify && data.spotify && !config.hideSpotify) {
    return { kind: "spotify", spotify: data.spotify };
  }

  return config.hideActivity === "whenNotUsed" ? null : { kind: "idle" };
}

function getCardDimensions(profile: CardProfile | null, panel: CardPanel | null): CardDimensions {
  if (!profile) return { svgHeight: "130", divHeight: "120" };
  if (!panel) return { svgHeight: "80", divHeight: "80" };
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
  const status = data.activities[0]?.type === 4 ? data.activities[0] : null;
  const profile = config.hideProfile
    ? null
    : {
        status: config.hideStatus ? null : status,
        clan: config.hideClan ? null : discordUser.clan,
        nameplate: config.hideNameplate ? undefined : discordUser.collectibles?.nameplate,
        showDecoration: !config.hideDecoration,
      };
  const panel = selectPanel(data, config);

  return {
    data,
    profile,
    panel,
    hasNitroIndicators: Boolean(
      discordUser.avatar?.includes("a_") || status?.emoji?.id || discordUser.avatar_decoration_data,
    ),
    avatarBorderColor: getAvatarBorderColor(data.discord_status),
    dimensions: getCardDimensions(profile, panel),
    renderedAt,
  };
}
