import { NextRequest } from "next/server";
import type { CardParameters } from "@/features/card/config/schema";
import { fetchPresence, LanyardServiceError } from "@/features/card/server/lanyard-service";
import { renderCard } from "@/features/card/server/render-card";
import { trackUser } from "@/features/users/server/user-store";
import { isSnowflake } from "@/utils/snowflake";

export const dynamic = "force-dynamic";
const maxCardBytes = 4_500_000;

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

  let body: string;
  try {
    await trackUser(userId);
    body = await renderCard(presence, params);
  } catch (error) {
    console.error("Unable to render Lanyard card", error);
    return errorResponse("The card could not be rendered. Please try again later.", 500);
  }
  const responseLength = Buffer.byteLength(body);

  if (responseLength > maxCardBytes) {
    return Response.json(
      {
        success: false,
        data: {
          response_length: responseLength,
          message:
            "The card exceeds 4.5 MB. Switch animated images to static images or hide some assets and try again.",
          docs: "https://github.com/kyrie25/lanyard-profile-readme",
        },
      },
      { status: 422 },
    );
  }

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=30, stale-while-revalidate=3600",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "content-security-policy": "default-src 'none'; img-src * data:; style-src 'unsafe-inline'",
    },
  });
}
