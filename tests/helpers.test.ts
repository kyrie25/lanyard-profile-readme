import { presenceFixture } from "./fixtures/presence";

import { describe, expect, it } from "vitest";
import { parseAppId, parseBool, parseCardParameters } from "@/features/card/config/schema";
import {
  getCardDimensions,
  normalizeCardData,
  selectPrimaryActivity,
} from "@/features/card/domain/model";
import { getAvatarUrl } from "@/features/card/server/load-assets";
import { getFormatFromMs } from "@/utils/helpers";

describe("card helpers", () => {
  it("parses boolean and app-id parameters", () => {
    expect(parseBool("true")).toBe(true);
    expect(parseBool("false")).toBe(false);
    expect(parseBool(undefined)).toBe(false);
    expect(parseAppId("one,two")).toEqual(["one", "two"]);
    expect(parseAppId(undefined)).toEqual([]);
  });

  it("formats elapsed time consistently", () => {
    expect(getFormatFromMs(5)).toBe("00:05");
    expect(getFormatFromMs(65)).toBe("01:05");
    expect(getFormatFromMs(3_665)).toBe("01:01:05");
  });

  it("normalizes default card parameters", () => {
    const data = structuredClone(presenceFixture.data);
    const config = parseCardParameters({ optimized: false }, data);

    expect(config).toMatchObject({
      backgroundColor: "101320",
      theme: "dark",
      hideActivity: "false",
      hideDiscrim: true,
      hideClan: false,
      showBanner: false,
    });
    expect(data.discord_user.clan).toBeNull();
  });

  it("selects the first supported non-Spotify activity", () => {
    const data = structuredClone(presenceFixture.data);
    expect(selectPrimaryActivity(data, [])).toMatchObject({ id: "activity", type: 0 });
    expect(selectPrimaryActivity(data, ["fixture-app"])).toBeNull();
  });

  it("calculates stable card dimensions", () => {
    const data = structuredClone(presenceFixture.data);
    const activity = selectPrimaryActivity(data, []);

    expect(getCardDimensions(parseCardParameters({ optimized: false, hideActivity: "true" }, data), activity, data)).toEqual({
      svgHeight: "80",
      divHeight: "80",
    });
    expect(getCardDimensions(parseCardParameters({ optimized: false }, data), activity, data)).toEqual({
      svgHeight: "200",
      divHeight: "200",
    });
    expect(getCardDimensions(parseCardParameters({ optimized: false, hideProfile: "true" }, data), activity, data)).toEqual({
      svgHeight: "130",
      divHeight: "120",
    });
  });

  it("builds Discord avatar URLs", () => {
    expect(getAvatarUrl(presenceFixture.data.discord_user, "webp")).toContain(
      "/avatars/368399721494216706/fixture-avatar.webp",
    );
  });

  it("normalizes presence data immutably with an injected render time", () => {
    const body = structuredClone(presenceFixture);
    const original = structuredClone(body);
    const config = parseCardParameters({ optimized: false, showDisplayName: "true" }, body.data);
    const normalized = normalizeCardData(body, config, 1_700_000_000_000);

    expect(body).toEqual(original);
    expect(normalized.renderedAt).toBe(1_700_000_000_000);
    expect(normalized.data.discord_user.username).toBe(body.data.discord_user.global_name);
    expect(normalized.data.discord_user.clan).toEqual(body.data.discord_user.primary_guild);
  });
});
