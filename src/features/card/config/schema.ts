import type { LanyardTypes } from "@/types/lanyard";

type Data = LanyardTypes.Data;

export type CardParameters = {
  theme?: string;
  bg?: string;
  clanbg?: string;
  animated?: string;
  animatedDecoration?: string;
  hideDiscrim?: string;
  hideStatus?: string;
  hideTimestamp?: string;
  hideBadges?: string;
  hideProfile?: string;
  hideActivity?: string;
  hideSpotify?: string;
  hideClan?: string;
  hideDecoration?: string;
  hideNameplate?: string;
  ignoreAppId?: string;
  showDisplayName?: string;
  useDisplayName?: string;
  borderRadius?: string;
  idleMessage?: string;
  animationDuration?: string;
  waveColor?: string;
  waveSpotifyColor?: string;
  gradient?: string;
  imgStyle?: string;
  imgBorderRadius?: string;
  showBanner?: string;
  bannerFilter?: string;
  forceGradient?: string;
  optimized: boolean;
};

export type HideActivityMode = "false" | "true" | "whenNotUsed";
export type CardParameterKey = Exclude<keyof CardParameters, "optimized" | "useDisplayName">;
export type ConfiguratorOptions = Partial<Record<CardParameterKey, string>>;

export interface ParsedCardConfig {
  avatarExtension: string;
  statusExtension: string;
  backgroundColor: string;
  theme: "dark" | "light";
  activityTheme: "dark" | "light";
  spotifyTheme: "dark" | "light";
  borderRadius: string;
  idleMessage: string;
  animationDuration: string;
  waveColor: string;
  waveSpotifyColor: string;
  gradient: string;
  imgStyle: string;
  imgBorderRadius: string;
  statusRadius: number;
  clanBackgroundColor: string;
  bannerFilter: string;
  hideStatus: boolean;
  hideTimestamp: boolean;
  hideBadges: boolean;
  hideProfile: boolean;
  hideActivity: HideActivityMode;
  hideSpotify: boolean;
  hideClan: boolean;
  hideDecoration: boolean;
  ignoreAppId: string[];
  hideDiscrim: boolean;
  showDisplayName: boolean;
  showBanner: boolean | "animated";
  hideNameplate: boolean;
  forceGradient: boolean;
}

export interface UserAssets {
  avatar: string;
  banner: string;
  clanBadge: string | null;
  avatarDecoration: string | null;
  nameplateHex?: string;
  nameplateBg?: string;
  nameplateAsset?: string;
}

export type ParameterDefinition = { deprecated?: boolean } & (
  | {
      parameter: CardParameterKey;
      type: "boolean";
      title: string;
      description?: string;
      options?: { defaultBool?: boolean };
      displayCondition?: (options: ConfiguratorOptions) => boolean;
    }
  | {
      parameter: CardParameterKey;
      type: "string";
      title: string;
      description?: string;
      options?: { placeholder?: string; omit?: string[] };
      displayCondition?: (options: ConfiguratorOptions) => boolean;
    }
  | {
      parameter: CardParameterKey;
      type: "list";
      title: string;
      description?: string;
      options: { list: Array<{ name: string; value: string }> };
      displayCondition?: (options: ConfiguratorOptions) => boolean;
    }
);

export const CARD_PARAMETER_INFO = [
  {
    parameter: "bg",
    type: "string",
    title: "Background Color",
    description:
      "Changes the background color to a hex color (no octothorpe). Can be set to 'transparent'. Nameplate will respect transparency.",
    options: {
      placeholder: "101320",
      omit: ["#"],
    },
  },
  {
    parameter: "gradient",
    type: "string",
    title: "Fallback Username Gradient",
    description:
      "Changes the gradient color of the username using hex colors (no octothorpe). Each color is separated by a dash.\n\nSingle colors are also accepted.\n\nBy default, Nitro display name styles will override this effect and it will only be used as fallback.\nTo force the gradient effect, enable the `Force Username Gradient` option.",
    options: {
      placeholder: "F1099A-B742B1-7754B1-3E589D-20537C-2A4858",
      omit: ["#"],
    },
    displayCondition(options) {
      return options.hideProfile !== "true";
    },
  },
  {
    parameter: "waveColor",
    type: "string",
    title: "Activity Wave Color",
    description:
      "Changes the activity wave color to a hex color (no octothorpe). Can be set to 'transparent'.\n\nYou can also change the color of the text by specifying theme following the hex color code.\nE.g. `FF597B-light` will make the text darker.",
    options: {
      placeholder: "7289DA",
      omit: ["#"],
    },
    displayCondition(options) {
      return options.hideActivity !== "true";
    },
  },
  {
    parameter: "waveSpotifyColor",
    type: "string",
    title: "Spotify Wave Color",
    description: "Changes the Spotify wave color to a hex color (no octothorpe). Can be set to 'transparent'.",
    options: {
      placeholder: "1DB954",
      omit: ["#"],
    },
    displayCondition(options) {
      return options.hideActivity !== "true" && options.hideSpotify !== "true";
    },
  },
  {
    parameter: "clanbg",
    type: "string",
    title: "Clan Background Color",
    description:
      "Changes the background color of the clan tag to a hex color (no octothorpe). Can be set to 'transparent'.",
    options: {
      placeholder: "3F444F",
      omit: ["#"],
    },
    displayCondition(options) {
      return options.hideClan !== "true";
    },
  },
  {
    parameter: "borderRadius",
    type: "string",
    title: "Border Radius",
    description: "Changes the border radius of the card. Follows the CSS <length> spec (px, rem, etc.).",
    options: {
      placeholder: "10px",
    },
  },
  {
    parameter: "imgBorderRadius",
    type: "string",
    title: "Image Border Radius",
    description: 'Changes the border radius of the images. Must be followed with "px".',
    options: {
      placeholder: "10px",
    },
  },
  {
    parameter: "idleMessage",
    type: "string",
    title: "Idle Message",
    description: 'Changes the idle message. Defaults to "I\'m not currently doing anything!".',
    options: {
      placeholder: "I'm not currently doing anything!",
    },
  },
  {
    parameter: "ignoreAppId",
    type: "string",
    title: "Hide App by ID",
    description: "Hide apps by their respective ID, as a comma-separated list.",
    options: {
      placeholder: "1302143410907648071, 1302132259368861759",
    },
  },
  {
    parameter: "theme",
    type: "list",
    title: "Theme",
    description: "Changes the background and text colors. Can be overridden with the `bg` parameter.",
    options: {
      list: [
        {
          name: "Light",
          value: "light",
        },
        {
          name: "Dark",
          value: "dark",
        },
      ],
    },
  },
  {
    parameter: "imgStyle",
    type: "list",
    title: "Image Style",
    description: "Change your profile picture/images style",
    options: {
      list: [
        {
          name: "Circle",
          value: "circle",
        },
        {
          name: "Square",
          value: "square",
        },
      ],
    },
  },
  {
    parameter: "showBanner",
    type: "list",
    title: "Banner Type",
    description:
      "Change your profile banner style.\n\nNote: This will dramatically increase the size of the image. If your image exceeds 5MB, it will not be served.",
    options: {
      list: [
        {
          name: "Static",
          value: "true",
        },
        {
          name: "Animated",
          value: "animated",
        },
      ],
    },
  },
  {
    parameter: "bannerFilter",
    type: "string",
    title: "Banner Filter",
    description: "Apply CSS filters on top of the banner.\n\ne.g. `brightness(0.8) blur(2px)`",
    options: {
      placeholder: "brightness(0.8) blur(2px)",
    },
    displayCondition: options => {
      return options.showBanner === "true" || options.showBanner === "animated";
    },
  },
  {
    parameter: "animated",
    type: "boolean",
    title: "Enable Animated Avatar",
    description: "Enables an animated avatar.",
    options: {
      defaultBool: true,
    },
  },
  {
    parameter: "showDisplayName",
    type: "boolean",
    title: "Show Display Name",
    description: "Shows your global display name alongside your username.",
  },
  {
    parameter: "animatedDecoration",
    type: "boolean",
    title: "Enable Animated Avatar Decoration",
    description: "Enables animated avatar decorations.",
    options: {
      defaultBool: false,
    },
  },
  {
    parameter: "forceGradient",
    type: "boolean",
    title: "Force Username Gradient",
    description: "Forces the custom username gradient even if Nitro display name styles are set.",
    displayCondition(options) {
      return options.hideProfile !== "true";
    },
  },
  {
    parameter: "hideDecoration",
    type: "boolean",
    title: "Hide Avatar Decoration",
    description: "Hides any avatar decorations.",
  },
  {
    parameter: "hideNameplate",
    type: "boolean",
    title: "Hide Nameplate",
    description: "Hides the nameplate.",
    displayCondition: options => {
      return options.hideProfile !== "true";
    },
  },
  {
    parameter: "hideStatus",
    type: "boolean",
    title: "Hide Status",
    description: "Hides your custom Discord status.",
  },
  {
    parameter: "hideTimestamp",
    type: "boolean",
    title: "Hide Activity Time",
    description: "Hides the time spent on an activity.",
  },
  {
    parameter: "hideClan",
    type: "boolean",
    title: "Hide Clan Tag",
    description: "Hides your Guild Tag (formerly Clan Tag)",
  },
  {
    parameter: "hideBadges",
    type: "boolean",
    title: "Hide Badges",
    description: "Hides your profile badges.",
  },
  {
    parameter: "hideProfile",
    type: "boolean",
    title: "Hide Profile",
    description: "Hides your profile, keeps your activity.",
  },
  {
    parameter: "hideActivity",
    type: "boolean",
    title: "Hide Activity",
    description: "Hides your activity, keeps your profile.",
  },
  {
    parameter: "hideSpotify",
    type: "boolean",
    title: "Hide Spotify",
    description: "Hides your Spotify activity only.",
  },
  {
    parameter: "hideDiscrim",
    type: "boolean",
    title: "Hide Discriminator",
    description: "Hides your discriminator. (DEPRECATED, RIP)",
    deprecated: true,
  },
] satisfies readonly ParameterDefinition[];

export const parseBool = (value: string | undefined): boolean => value === "true";

export const parseAppId = (value: string | undefined): string[] => (value ? value.split(",") : []);

export function parseCardParameters(params: CardParameters, data: Data): ParsedCardConfig {
  let avatarExtension = "webp";
  let statusExtension = "webp";
  let backgroundColor = "101320";
  let theme: ParsedCardConfig["theme"] = "dark";
  let activityTheme: ParsedCardConfig["activityTheme"] = "dark";
  let spotifyTheme: ParsedCardConfig["spotifyTheme"] = "dark";
  let borderRadius = "10px";
  let idleMessage = "I'm not currently doing anything!";
  let animationDuration = "8s";
  let waveColor = "7289da";
  let waveSpotifyColor = "1DB954";
  let gradient =
    "rgb(241, 9, 154), rgb(183, 66, 177), rgb(119, 84, 177), rgb(62, 88, 157), rgb(32, 83, 124), rgb(42, 72, 88)";
  let imgStyle = "circle";
  let imgBorderRadius = "10px";
  let statusRadius = 4;
  let bannerFilter = "";

  const hideStatus = parseBool(params.hideStatus);
  const hideTimestamp = parseBool(params.hideTimestamp);
  const hideBadges = parseBool(params.hideBadges);
  const hideProfile = parseBool(params.hideProfile);
  const hideActivity: HideActivityMode =
    params.hideActivity === "true" || params.hideActivity === "whenNotUsed" ? params.hideActivity : "false";
  const hideSpotify = parseBool(params.hideSpotify);
  let hideClan = parseBool(params.hideClan);
  let hideDecoration = parseBool(params.hideDecoration);
  const ignoreAppId = parseAppId(params.ignoreAppId);
  const hideDiscrim = parseBool(params.hideDiscrim) || data.discord_user.discriminator === "0";
  const showDisplayName = parseBool(params.showDisplayName) || parseBool(params.useDisplayName);
  const showBanner: boolean | "animated" = parseBool(params.showBanner) || params.showBanner === "animated";
  const hideNameplate = parseBool(params.hideNameplate);
  const forceGradient = parseBool(params.forceGradient);

  if (data.activities[0]?.emoji?.animated && !params.optimized) statusExtension = "gif";
  if (data.discord_user.avatar?.startsWith("a_") && !params.optimized) avatarExtension = "gif";
  if (params.animated === "false") avatarExtension = "webp";
  if (!data.discord_user.avatar_decoration_data) hideDecoration = true;
  if (!data.discord_user.clan && !data.discord_user.primary_guild) hideClan = true;

  if (params.theme === "light") {
    backgroundColor = "eee";
    theme = "light";
    activityTheme = "light";
    spotifyTheme = "light";
    waveColor = "FFD1DC";
  }
  if (params.bg) backgroundColor = params.bg;

  let clanBackgroundColor = theme === "light" ? "e0dede" : "3f444f";
  if (params.clanbg) clanBackgroundColor = params.clanbg;
  if (params.idleMessage) idleMessage = params.idleMessage;
  if (params.borderRadius) borderRadius = params.borderRadius;
  if (params.animationDuration) animationDuration = params.animationDuration;
  if (params.waveColor) {
    const [color, themeParam] = params.waveColor.split("-");
    waveColor = color;
    if (themeParam === "light" || themeParam === "dark") activityTheme = themeParam;
  }
  if (params.waveSpotifyColor) {
    const [color, themeParam] = params.waveSpotifyColor.split("-");
    waveSpotifyColor = color;
    if (themeParam === "light" || themeParam === "dark") spotifyTheme = themeParam;
  }
  if (params.gradient) {
    gradient = params.gradient.includes("-")
      ? `#${params.gradient.replaceAll("-", ", #")}`
      : `#${params.gradient}, #${params.gradient}`;
  }
  if (params.imgStyle) imgStyle = params.imgStyle;
  if (params.imgBorderRadius) {
    imgBorderRadius = params.imgBorderRadius;
    if (imgBorderRadius.includes("px")) statusRadius = Number(imgBorderRadius.replace("px", "")) / (10 / 4);
  }
  if (params.bannerFilter) bannerFilter = params.bannerFilter;

  return {
    avatarExtension,
    statusExtension,
    backgroundColor,
    theme,
    activityTheme,
    spotifyTheme,
    borderRadius,
    idleMessage,
    animationDuration,
    waveColor,
    waveSpotifyColor,
    gradient,
    imgStyle,
    imgBorderRadius,
    statusRadius,
    clanBackgroundColor,
    bannerFilter,
    hideStatus,
    hideTimestamp,
    hideBadges,
    hideProfile,
    hideActivity,
    hideSpotify,
    hideClan,
    hideDecoration,
    ignoreAppId,
    hideDiscrim,
    showDisplayName,
    showBanner,
    hideNameplate,
    forceGradient,
  };
}
