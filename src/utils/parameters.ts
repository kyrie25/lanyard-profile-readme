export type Parameters = {
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
  ignoreAppId?: string;
  showDisplayName?: string;
  borderRadius?: string;
  idleMessage?: string;
};

export type IParameterInfo = Array<
  { deprecated?: boolean } & (
    | {
        parameter: string;
        type: "boolean";
        title: string;
        description?: string;
        options?: {
          defaultBool?: boolean;
        };
        displayCondition?: (options: Record<string, any>) => boolean;
      }
    | {
        parameter: string;
        type: "string";
        title: string;
        description?: string;
        options?: {
          placeholder?: string;
          omit?: string[];
        };
        displayCondition?: (options: Record<string, any>) => boolean;
      }
    | {
        parameter: string;
        type: "list";
        title: string;
        description?: string;
        options: {
          list: Array<{
            name: string;
            value: string;
          }>;
        };
        displayCondition?: (options: Record<string, any>) => boolean;
      }
  )
>;

export const PARAMETER_INFO: IParameterInfo = [
  {
    parameter: "bg",
    type: "string",
    title: "Background Color",
    description: "Changes the background color to a hex color (no octothorpe). Can be set to 'transparent'.",
    options: {
      placeholder: "101320",
      omit: ["#"],
    },
  },
  {
    parameter: "gradient",
    type: "string",
    title: "Gradient Username Color",
    description:
      "Changes the gradient color of the username using hex colors (no octothorpe). Each color is separated by a dash.\n\nSingle colors are also accepted.",
    options: {
      placeholder: "F1099A-B742B1-7754B1-3E589D-20537C-2A4858",
      omit: ["#"],
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
    description: "Change your profile banner style",
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
    displayCondition: (options: Record<string, any>) => {
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
    title: "Disable Animated Avatar Decoration",
    description: "Disables animated avatar decorations.",
    options: {
      defaultBool: true,
    },
  },
  {
    parameter: "hideDecoration",
    type: "boolean",
    title: "Hide Avatar Decoration",
    description: "Hides any avatar decorations.",
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
] as IParameterInfo;
