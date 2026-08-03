import { NextRequest } from "next/server";
import type { CardParameters } from "@/features/card/config/schema";
import { fetchPresence, LanyardServiceError } from "@/features/card/server/lanyard-service";
import { renderCard } from "@/features/card/server/render-card";
import { trackUser } from "@/features/users/server/user-store";
import { isSnowflake } from "@/utils/snowflake";

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return Response.json({ data: { message }, success: false }, { status });
}

export async function GET(request: NextRequest, options: { params: Promise<{ id: string[] }> }) {
  const userId = (await options.params).id.join("/");
  if (!userId) return errorResponse("No ID provided.", 400);
  if (!isSnowflake(userId)) return errorResponse("The ID you provide is not a valid snowflake.", 400);

  let presence;
  try {
    presence = await fetchPresence(userId);
  } catch (error) {
    const serviceError =
      error instanceof LanyardServiceError
        ? error
        : new LanyardServiceError("An error occurred while fetching the user data.", 500);
    const directUrl = `https://api.lanyard.rest/v1/users/${userId}`;
    const suffix =
      serviceError.status >= 500
        ? ` Try accessing the Lanyard API directly at ${directUrl}. If it is still working, please open an issue on the GitHub repository.`
        : "";

    return errorResponse(serviceError.message + suffix, serviceError.status);
  }

  const params: CardParameters = {
    ...Object.fromEntries(request.nextUrl.searchParams.entries()),
    optimized: request.url.includes("lanyard-profile-readme"),
  };

  await trackUser(userId);
  const body = await renderCard(presence, params);
  const responseLength = Buffer.byteLength(body);

  if (responseLength > 5_000_000) {
    return Response.json(
      {
        data: {
          success: false,
          response_length: responseLength,
          message:
            "Bandwidth isn't free, this service will not embed large images. Set animated banner/avatar/decoration to static images or remove them.",
          docs: "https://github.com/kyrie25/lanyard-profile-readme",
        },
      },
      { status: 500 },
    );
  }

  return new Response(body, {
    headers: {
      "Cache-Control": "max-age=60",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "content-security-policy": "default-src 'none'; img-src * data:; style-src 'unsafe-inline'",
    },
  });
}
