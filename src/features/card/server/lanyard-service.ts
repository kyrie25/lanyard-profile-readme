import type { LanyardTypes } from "@/types/lanyard";
import { isSnowflake } from "@/utils/snowflake";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPresenceData(value: unknown): value is LanyardTypes.Data {
  if (!isRecord(value)) return false;
  const user = value.discord_user;
  return (
    isRecord(user) &&
    typeof user.id === "string" &&
    isSnowflake(user.id) &&
    typeof user.username === "string" &&
    Array.isArray(value.activities) &&
    value.activities.every(activity => isRecord(activity) && typeof activity.type === "number")
  );
}

export class LanyardServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function fetchPresence(userId: string): Promise<LanyardTypes.Root> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (response.status === 429 || response.status >= 500) {
      throw new LanyardServiceError("Lanyard is temporarily unavailable.", 502);
    }

    const payload: unknown = await response.json();
    if (!response.ok || (isRecord(payload) && payload.success === false)) {
      const error = isRecord(payload) ? payload.error : undefined;
      const message = isRecord(error) ? error.message : error;
      if (typeof message === "string" && message) throw new LanyardServiceError(message, 400);
      throw new LanyardServiceError("Lanyard could not load this user.", 400);
    }

    if (!isRecord(payload) || payload.success !== true || !isPresenceData(payload.data)) {
      throw new LanyardServiceError("Lanyard returned an invalid presence response.", 502);
    }
    return { success: true, data: payload.data };
  } catch (error) {
    if (error instanceof LanyardServiceError) throw error;
    if (controller.signal.aborted) {
      throw new LanyardServiceError("Lanyard API timed out. Please try again later.", 504);
    }
    throw new LanyardServiceError("Lanyard is temporarily unavailable.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
