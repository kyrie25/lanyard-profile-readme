export namespace API {
  export interface ParsedConfig {
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
    hideActivity: string;
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

  export interface Parameters {
    theme?: string;
    bg?: string;
    clanbg?: string;
    animated?: string;
    animatedDecoration?: string;
    hideNameplate?: string;
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
    // For the sake of backwards compatibility;
    useDisplayName?: string;
    borderRadius?: string;
    idleMessage?: string;
    optimized: boolean;
    animationDuration?: string;
    waveColor?: string;
    waveSpotifyColor?: string;
    gradient?: string;
    imgStyle?: string;
    imgBorderRadius?: string;
    showBanner?: string;
    bannerFilter?: string;
    forceGradient?: string;
  }

  export interface UserAssets {
    avatar: string;
    banner: string;
    clanBadge: string | null;
    avatarDecoration: string | null;
    nameplateHex: string | undefined;
    nameplateBg: string | undefined;
    nameplateAsset: string | undefined;
  }
}
