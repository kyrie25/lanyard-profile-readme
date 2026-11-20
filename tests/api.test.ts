import { presenceFixture } from "./fixtures/presence";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/[...id]/route";
import { readResponseBytes } from "@/features/card/server/read-response-bytes";
import { renderCard } from "@/features/card/server/render-card";
import { trackUser } from "@/features/users/server/user-store";

vi.mock("@/features/card/server/render-card", () => ({ renderCard: vi.fn() }));
vi.mock("@/features/users/server/user-store", () => ({ trackUser: vi.fn() }));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function requestCard(id = presenceFixture.data.discord_user.id) {
  return GET(new NextRequest(`http://localhost/api/${id}`), { params: Promise.resolve({ id: [id] }) });
}

describe("card API errors", () => {
  it.each(["1e18", "0x1234abcd", "18446744073709551616", "368399721494216706\n"])(
    "rejects invalid snowflake %s",
    async id => {
      const fetchPresence = vi.fn();
      vi.stubGlobal("fetch", fetchPresence);

      expect((await requestCard(id)).status).toBe(400);
      expect(fetchPresence).not.toHaveBeenCalled();
    },
  );

  it("returns a gateway error for a malformed presence response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: true, data: null })),
    );

    expect((await requestCard()).status).toBe(502);
    expect(renderCard).not.toHaveBeenCalled();
    expect(trackUser).not.toHaveBeenCalled();
  });

  it("preserves the error message for users outside Lanyard", async () => {
    const message = "User is not being monitored by Lanyard";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: false, error: { message } }, { status: 404 })),
    );

    const response = await requestCard();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, data: { message } });
  });

  it("returns JSON if the renderer fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(presenceFixture)),
    );
    vi.mocked(renderCard).mockRejectedValue(new Error("Internal details"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await requestCard();
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({
      success: false,
      data: { message: "The card could not be rendered. Please try again later." },
    });
  });

  it("rejects oversized cards before the hosting response limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(presenceFixture)),
    );
    vi.mocked(renderCard).mockResolvedValue("x".repeat(4_500_001));

    const response = await requestCard();
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ success: false, data: { response_length: 4_500_001 } });
  });
});

describe("bounded asset downloads", () => {
  it("cancels oversized streams even without a Content-Length header", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      pull: controller => controller.enqueue(new Uint8Array(3)),
      cancel,
    });

    expect(await readResponseBytes(new Response(stream), 4)).toBeUndefined();
    expect(cancel).toHaveBeenCalledOnce();
  });
});
