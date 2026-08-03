import { describe, expect, it } from "vitest";
import { buildCardUrl } from "@/features/configurator/build-card-url";

describe("buildCardUrl", () => {
  it("encodes visible options", () => {
    expect(
      buildCardUrl("https://example.com", "123", {
        idleMessage: "Hello world!",
        hideActivity: "false",
      }),
    ).toBe("https://example.com/api/123?idleMessage=Hello%20world!&hideActivity=false");
  });

  it("omits options hidden by another setting", () => {
    expect(
      buildCardUrl("https://example.com", "123", {
        hideProfile: "true",
        gradient: "ffffff-000000",
      }),
    ).toBe("https://example.com/api/123?hideProfile=true");
  });
});
