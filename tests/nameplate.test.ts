import { afterEach, describe, expect, it, vi } from "vitest";
import { loadNameplateAsset } from "@/features/card/server/nameplate-service";
import type { LanyardTypes } from "@/types/lanyard";

vi.mock("next/cache", () => ({ unstable_cache: (load: unknown) => load }));

const nameplate: LanyardTypes.Nameplate = {
  asset: "nameplates/pearly_waves/1544102714131091496/",
  label: "Pearly Waves",
  palette: "cobalt",
  sku_id: "1544102714131091496",
  expires_at: null,
};

afterEach(() => vi.unstubAllGlobals());

describe("nameplate assets", () => {
  it.each([false, true])("uses the static PNG when the clip is unavailable (animated=%s)", async animated => {
    const fetchAsset = vi.fn(async (url: string) =>
      url.endsWith("/video") ? new Response(null, { status: 404 }) : new Response("static nameplate"),
    );
    vi.stubGlobal("fetch", fetchAsset);

    expect(await loadNameplateAsset(nameplate, animated)).toBe("data:image/png;base64,c3RhdGljIG5hbWVwbGF0ZQ==");
    expect(fetchAsset.mock.calls.map(([url]) => url)).toEqual([
      ...(animated ? [`https://cdn.discordapp.com/media/v1/collectibles-shop/${nameplate.sku_id}/video`] : []),
      `https://cdn.discordapp.com/assets/collectibles/${nameplate.asset}static.png`,
    ]);
  });
});
