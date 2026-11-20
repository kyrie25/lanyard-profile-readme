import { presenceFixture } from "./fixtures/presence";

import sharp from "sharp";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderCard } from "@/features/card/server/render-card";

const png = sharp({ create: { width: 4, height: 4, channels: 3, background: "#123456" } })
  .png()
  .toBuffer();

function mockImageFetch(missingUrl?: string) {
  const fetchImage = vi.fn(async (url: string) =>
    url === missingUrl ? new Response("Not Found", { status: 404 }) : new Response(new Uint8Array(await png)),
  );
  vi.stubGlobal("fetch", fetchImage);
  return fetchImage;
}

afterEach(() => vi.unstubAllGlobals());

describe("card rendering pipeline", () => {
  it("shrinks to the profile and skips assets for hidden Spotify, clan, and status", async () => {
    const body = structuredClone(presenceFixture);
    const [status] = body.data.activities;
    status.emoji = { id: 123, name: "fixture-emoji", animated: false };
    body.data.activities = [status, { ...status, type: 2, name: "Spotify", id: "spotify" }];
    body.data.listening_to_spotify = true;
    const fetchImage = mockImageFetch();

    const svg = await renderCard(body, {
      optimized: false,
      hideActivity: "whenNotUsed",
      hideSpotify: "true",
      hideClan: "true",
      hideStatus: "true",
    });

    expect(svg).toMatch(/^<svg[^>]+height="80"/);
    expect(svg).not.toContain("Fixture Song");
    expect(svg).not.toContain("Fixture status");
    expect(svg).toMatch(/src="data:image\/webp;base64,[^"]+" alt="User Avatar"/);
    expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([
      "https://cdn.discordapp.com/avatars/368399721494216706/fixture-avatar.webp?size=256",
    ]);
  });

  it("renders Spotify from its presence payload when the activity list is empty", async () => {
    const body = structuredClone(presenceFixture);
    body.data.activities = [];
    body.data.listening_to_spotify = true;
    const fetchImage = mockImageFetch();

    const svg = await renderCard(body, { optimized: false, hideProfile: "true" });

    expect(svg).toMatch(/^<svg[^>]+height="130"/);
    expect(svg).toContain("Fixture Song");
    expect(fetchImage.mock.calls.map(([url]) => url)).toEqual(["https://example.com/album.png"]);
  });

  it("omits artwork and tint when activity and the nameplate are hidden", async () => {
    const body = structuredClone(presenceFixture);
    body.data.discord_user.collectibles = {
      nameplate: { asset: "fixture/", label: "Fixture Plate", palette: "cobalt", sku_id: "123", expires_at: null },
    };
    const fetchImage = mockImageFetch();

    const svg = await renderCard(body, {
      optimized: false,
      hideActivity: "true",
      hideNameplate: "true",
      hideClan: "true",
    });

    expect(svg).toMatch(/^<svg[^>]+height="80"/);
    expect(svg).not.toContain("Fixture Game");
    expect(svg).not.toContain("User Nameplate");
    expect(svg).not.toContain("background:linear-gradient(90deg");
    expect(fetchImage).toHaveBeenCalledTimes(1);
  });

  it("uses placeholder artwork if Spotify's album image is unavailable", async () => {
    const body = structuredClone(presenceFixture);
    body.data.activities = [];
    body.data.listening_to_spotify = true;
    const fetchImage = mockImageFetch("https://example.com/album.png");

    const svg = await renderCard(body, { optimized: false, hideProfile: "true" });

    expect(svg).toMatch(/src="data:image\/webp;base64,[^"]+" alt="Spotify Album Art"[^>]+filter:invert\(100\)/);
    expect(fetchImage.mock.calls.map(([url]) => url)).toEqual([
      "https://example.com/album.png",
      "https://lanyard.kyrie25.dev/assets/unknown.png",
    ]);
  });
});
