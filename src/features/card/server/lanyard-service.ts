import type { LanyardTypes } from "@/types/lanyard";

interface LanyardErrorPayload {
  error?: { message?: string } | string;
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
    const payload = (await response.json()) as LanyardTypes.Root | LanyardErrorPayload;

    if (!response.ok || !("success" in payload) || !payload.success) {
      const error = "error" in payload ? payload.error : undefined;
      const message = typeof error === "string" ? error : error?.message;
      throw new LanyardServiceError(message || "Lanyard could not load this user.", 400);
    }

    return payload;
  } catch (error) {
    if (error instanceof LanyardServiceError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LanyardServiceError("Lanyard API timed out. Please try again later.", 504);
    }
    throw new LanyardServiceError(
      `Lanyard API error: ${error instanceof Error ? error.message : "Unknown error occurred."}`,
      500,
    );
  } finally {
    clearTimeout(timeout);
  }
}
