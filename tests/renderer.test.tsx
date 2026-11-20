import { presenceFixture } from "./fixtures/presence";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { parseCardParameters } from "@/features/card/config/schema";
import { normalizeCardData } from "@/features/card/domain/model";
import CardSvg from "@/features/card/render/CardSvg";
import type { PreparedCardAssets } from "@/features/card/render/types";

const fakeAssets: PreparedCardAssets = {
  avatar: "data:image/webp;base64,avatar-data",
  clanBadge: "data:image/webp;base64,clan-data",
  nameplateHex: "#123456",
  nameplateBg: "linear-gradient(90deg, #123456 0%, #654321 100%)",
  nameplateAsset: "data:image/png;base64,nameplate-data",
  activityLargeImage: "data:image/webp;base64,activity-data",
  usesUnknownActivityImage: false,
  usesUnknownSpotifyImage: false,
};

describe("CardSvg", () => {
  it.each(["png", "webp"])("renders normalized activity data with a %s nameplate", format => {
    const body = structuredClone(presenceFixture);
    const config = parseCardParameters({ optimized: false, nameplateReflection: "classic" }, body.data);
    const normalized = normalizeCardData(body, config, 1_700_000_065_000);
    const nameplateAsset = `data:image/${format};base64,nameplate-data` as const;
    const svg = renderToStaticMarkup(
      <CardSvg
        context={{ ...normalized, config, assets: { ...fakeAssets, nameplateAsset }, flags: ["Nitro", "House_Bravery"] }}
      />,
    );

    expect(svg).toMatch(/^<svg[^>]+height="200"/);
    expect(svg).toContain("Fixture Game");
    expect(svg).toContain("Fixture details");
    expect(svg).toContain("01:05 elapsed");
    expect(svg).toContain("data:image/webp;base64,activity-data");
    expect(svg).toContain('alt="Nitro" src="data:image/png;base64,');
    expect(svg).toContain('alt="House_Bravery" src="data:image/webp;base64,');
    expect(svg.split(`src="${nameplateAsset}"`)).toHaveLength(3);
    expect(svg).toContain("transform:scaleY(-1)");
    expect(svg).toContain("mask-image:linear-gradient(to top");
    expect(svg).not.toContain("[object Promise]");
  });

  it.each([
    [undefined, "scaleY(-0.62)", false],
    ["glass", "scaleY(-0.62)", false],
    ["water", "scaleY(-0.86)", true],
    ["invalid", "scaleY(-0.62)", false],
  ])("renders the idle nameplate reflection for %s", (nameplateReflection, transform, hasRipple) => {
    const body = structuredClone(presenceFixture);
    body.data.activities = [];
    const config = parseCardParameters({ optimized: false, nameplateReflection }, body.data);
    const normalized = normalizeCardData(body, config);
    const svg = renderToStaticMarkup(<CardSvg context={{ ...normalized, config, assets: fakeAssets, flags: [] }} />);

    expect(normalized.panel?.kind).toBe("idle");
    expect(svg).toContain(`transform:${transform}`);
    expect(svg.includes('id="nameplate-water-ripple"')).toBe(hasRipple);
    expect(svg.includes("url(#nameplate-water-ripple)")).toBe(hasRipple);
    expect(svg.split(`src="${fakeAssets.nameplateAsset}"`)).toHaveLength(3);
  });

  it.each([true, false])("renders Spotify with timestamps present=%s", hasTimestamps => {
    const body = structuredClone(presenceFixture);
    body.data.listening_to_spotify = true;
    if (!hasTimestamps) Object.assign(body.data.spotify!, { timestamps: undefined });
    body.data.activities = [
      {
        type: 2,
        name: "Spotify",
        state: "",
        id: "spotify",
        created_at: 1_700_000_000_000,
      },
    ];
    const config = parseCardParameters({ optimized: false, nameplateReflection: "water" }, body.data);
    const normalized = normalizeCardData(body, config, 1_700_000_060_000);
    const svg = renderToStaticMarkup(
      <CardSvg
        context={{
          ...normalized,
          config,
          assets: { ...fakeAssets, spotifyAlbumArt: "data:image/webp;base64,spotify-data" },
          flags: [],
        }}
      />,
    );

    expect(svg).toContain("Fixture Song");
    expect(svg).toContain("Fixture Artist");
    expect(svg).toContain("url(#nameplate-water-ripple)");
    expect(svg).toContain("data:image/webp;base64,spotify-data");
    expect(svg).not.toContain("Fixture Game");
    expect(svg).not.toContain("width:NaN%");
    expect(svg.includes("03:00")).toBe(hasTimestamps);
  });
});
