import { presenceFixture } from "./fixtures/presence";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseCardParameters } from "@/features/card/config/schema";
import { normalizeCardData } from "@/features/card/domain/model";
import CardSvg from "@/features/card/render/CardSvg";
import type { PreparedCardAssets } from "@/features/card/render/types";

const fakeAssets: PreparedCardAssets = {
  avatar: "avatar-data",
  banner: "",
  clanBadge: "clan-data",
  avatarDecoration: null,
  nameplateHex: "#123456",
  nameplateBg: "linear-gradient(90deg, #123456 0%, #654321 100%)",
  nameplateAsset: "nameplate-data",
  activityLargeImage: "activity-data",
  usesUnknownActivityImage: false,
  usesUnknownSpotifyImage: false,
};

describe("CardSvg", () => {
  it("renders normalized activity data using prepared assets", () => {
    const body = structuredClone(presenceFixture);
    const config = parseCardParameters({ optimized: false }, body.data);
    const normalized = normalizeCardData(body, config, 1_700_000_065_000);
    const svg = renderToStaticMarkup(
      <CardSvg context={{ ...normalized, config, assets: fakeAssets, flags: ["Nitro"] }} />,
    );

    expect(svg).toMatch(/^<svg[^>]+height="200"/);
    expect(svg).toContain("Fixture Game");
    expect(svg).toContain("Fixture details");
    expect(svg).toContain("01:05 elapsed");
    expect(svg).toContain("data:image/png;base64,activity-data");
    expect(svg).toContain("transform:scaleY(-1)");
    expect(svg).toContain("mask-image:linear-gradient(to top");
    expect(svg).not.toContain("[object Promise]");
  });

  it("renders the Spotify panel when no primary activity is selected", () => {
    const body = structuredClone(presenceFixture);
    body.data.listening_to_spotify = true;
    body.data.activities = [
      {
        type: 2,
        name: "Spotify",
        state: "",
        id: "spotify",
        created_at: 1_700_000_000_000,
      },
    ];
    const config = parseCardParameters({ optimized: false }, body.data);
    const normalized = normalizeCardData(body, config, 1_700_000_060_000);
    const svg = renderToStaticMarkup(
      <CardSvg
        context={{
          ...normalized,
          config,
          assets: { ...fakeAssets, spotifyAlbumArt: "spotify-data" },
          flags: [],
        }}
      />,
    );

    expect(svg).toContain("Fixture Song");
    expect(svg).toContain("Fixture Artist");
    expect(svg).toContain("data:image/png;base64,spotify-data");
    expect(svg).not.toContain("Fixture Game");
  });
});
