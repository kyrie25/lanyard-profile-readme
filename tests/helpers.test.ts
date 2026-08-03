import { presenceFixture } from "./fixtures/presence";

import { describe, expect, it } from "vitest";
import { parseAppId, parseBool, parseCardParameters } from "@/features/card/config/schema";
import { calculateDimensions, getAvatarUrl, getFormatFromMs, processActivities } from "@/utils/helpers";

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
    expect(processActivities(data, [])).toMatchObject({ id: "activity", type: 0 });
    expect(processActivities(data, ["fixture-app"])).toBeUndefined();
  });

  it("calculates stable card dimensions", () => {
    expect(calculateDimensions(false, "true", false, false, false)).toEqual({ svgHeight: "80", divHeight: "80" });
    expect(calculateDimensions(false, "false", false, false, false)).toEqual({ svgHeight: "200", divHeight: "200" });
    expect(calculateDimensions(true, "false", false, false, false)).toEqual({ svgHeight: "130", divHeight: "120" });
  });

  it("builds Discord avatar URLs", () => {
    expect(getAvatarUrl(presenceFixture.data.discord_user, "webp")).toContain(
      "/avatars/368399721494216706/fixture-avatar.webp",
    );
  });
});
