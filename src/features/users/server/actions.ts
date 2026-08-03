"use server";

import { countTrackedUsers } from "@/features/users/server/user-store";

export async function getUserCount(): Promise<number> {
  return countTrackedUsers();
}
