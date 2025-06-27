import redis from "@/utils/redis";
import renderCard, { Parameters } from "@/utils/renderCard";
import { isSnowflake } from "@/utils/snowflake";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, options: { params: Promise<{ id: string[] }> }) {
  const userId = (await options.params).id.join("/");
  const OPTIMIZE_FOR_VERCEL = req.url.includes("lanyard-profile-readme");

  if (!userId)
    return Response.json(
      {
        data: {
          error: "No ID provided.",
        },
        success: false,
      },
      {
        status: 400,
      },
    );

  if (!isSnowflake(userId))
    return Response.json(
      {
        data: {
          error: "The ID you provide is not a valid snowflake.",
        },
        success: false,
      },
      {
        status: 400,
      },
    );

  let getUser: any = {};

  // Implement fetch timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    getUser.data = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      cache: "no-store",
      signal: controller.signal,
    }).then(async res => {
      const data = await res.json();

      if (!data.success) {
        getUser.error = data.error;
      }

      return data;
    });

    if (getUser.error) {
      return Response.json(
        {
          data: getUser.error,
          success: false,
        },
        {
          status: 400,
        },
      );
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      getUser.data = { message: "Lanyard API timed out. Please try again later.", status: "error", code: 504 };
    } else {
      getUser.data = {
        message: "Lanyard API error: " + (error.message || "Unknown error occurred."),
        status: "error",
        code: 500,
      };
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (getUser.data?.status === "error") {
    return Response.json(
      {
        data: getUser.data.message || "An error occurred while fetching the user data.",
        success: false,
      },
      {
        status: getUser.data?.code || 500,
      },
    );
  }

  const params: Parameters = {
    ...Object.fromEntries(req.nextUrl.searchParams.entries()),
    optimized: OPTIMIZE_FOR_VERCEL,
  };

  try {
    let user = await redis.hget("users", userId);
    if (!user) await redis.hset("users", userId, "true");
  } catch {
    null;
  }

  const body = await renderCard(getUser.data, params);
  const resLength = Buffer.byteLength(body.toString());

  // If it's bigger than 5mb, return an error. Too big skill issue
  if (Buffer.byteLength(body.toString()) > 5000000) {
    return Response.json(
      {
        success: false,
        response_length: resLength,
        message:
          "Bandwidth isn't free, this service will not embed large images. If you have animated banners enabled, disable them or set banner to `true`. If you have an animated avatar, please compress it or set the `animated` parameter to false. If you have an avatar decoration, set the `animatedDecoration` parameter to false.",
        docs: "https://github.com/cnrad/lanyard-profile-readme",
      },
      {
        status: 500,
      },
    );
  }

  const res = new Response(body, {
    headers: {
      "Cache-Control": "max-age=60",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "content-security-policy": "default-src 'none'; img-src * data:; style-src 'unsafe-inline'",
    },
    status: 200,
  });

  return res;
}
