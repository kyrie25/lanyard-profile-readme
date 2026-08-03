import type { LanyardTypes } from "@/types/lanyard";

export const presenceFixture: LanyardTypes.Root = {
  success: true,
  data: {
    spotify: {
      track_id: "fixture-track",
      timestamps: {
        start: 1_700_000_000_000,
        end: 1_700_000_180_000,
      },
      song: "Fixture Song",
      artist: "Fixture Artist",
      album_art_url: "https://example.com/album.png",
      album: "Fixture Album",
    },
    listening_to_spotify: false,
    discord_user: {
      username: "fixture_user",
      public_flags: 0,
      id: "368399721494216706",
      discriminator: "0",
      avatar: "fixture-avatar",
      global_name: "Fixture User",
      display_name: "Fixture User",
      clan: null,
      primary_guild: {
        tag: "TEST",
        badge: "fixture-badge",
        identity_enabled: true,
        identity_guild_id: 123,
      },
      avatar_decoration_data: null,
      collectibles: null,
      display_name_styles: null,
    },
    discord_status: "online",
    activities: [
      {
        type: 4,
        state: "Fixture status",
        name: "Custom Status",
        id: "custom",
        created_at: 1_700_000_000_000,
      },
      {
        type: 0,
        state: "Fixture state",
        details: "Fixture details",
        name: "Fixture Game",
        id: "activity",
        application_id: "fixture-app",
        created_at: 1_700_000_000_000,
        timestamps: {
          start: 1_700_000_000_000,
        },
      },
    ],
    active_on_discord_mobile: false,
    active_on_discord_desktop: true,
  },
};
