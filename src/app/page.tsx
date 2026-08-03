"use client";

import { useCallback, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import useSWR from "swr";
import type { ConfiguratorOptions } from "@/features/card/config/schema";
import { buildCardUrl } from "@/features/configurator/build-card-url";
import { CardPreview } from "@/features/configurator/CardPreview";
import { CopyOutput } from "@/features/configurator/CopyOutput";
import { ParameterForm } from "@/features/configurator/ParameterForm";
import { cn } from "@/lib/utils";
import { getUserCount } from "@/features/users/server/actions";
import { isSnowflake } from "@/utils/snowflake";

const ORIGIN_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://lanyard.kyrie25.dev";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [userError, setUserError] = useState<string | JSX.Element>();
  const [options, setOptions] = useState<ConfiguratorOptions>({});
  const userCount = useSWR("getUserCount", getUserCount);
  const isValidUserId = userId.length > 0 && isSnowflake(userId);
  const url = buildCardUrl(ORIGIN_URL, userId, options);

  const handlePreviewError = useCallback((message?: string) => {
    if (!message) {
      setUserError(undefined);
      return;
    }

    setUserError(
      message !== "User is not being monitored by Lanyard" ? (
        message
      ) : (
        <>
          User is not monitored by Lanyard, please join{" "}
          <Link href="https://discord.gg/lanyard" target="_blank" className="inline underline">
            the server
          </Link>{" "}
          and try again.
        </>
      ),
    );
  }, []);

  function handleDiscordId(value: string) {
    setUserId(value);
    setUserError(value && !isSnowflake(value) ? "Invalid Discord ID" : undefined);
  }

  return (
    <>
      <main className="flex min-h-screen max-w-[100vw] flex-col items-center max-sm:px-4">
        <div className="relative mt-16 flex w-auto flex-row gap-8 max-lg:flex-col max-lg:items-center">
          <div className="relative flex w-auto max-w-[28rem] flex-col gap-2 rounded-md">
            <p className="text-left text-3xl font-semibold text-[#cecece]">🏷️ lanyard-profile-readme </p>
            <p className="mb-2 text-sm text-[#aaabaf]">
              Uses{" "}
              <a
                href="https://github.com/Phineas/lanyard"
                target="_blank"
                rel="noreferrer noopener"
                className="text-white underline decoration-transparent underline-offset-2 transition-colors duration-150 ease-out hover:decoration-white"
              >
                Lanyard
              </a>{" "}
              to display your Discord Presence anywhere.
            </p>
            <div className="flex h-[2.25rem] w-full flex-row gap-2">
              <input
                className="w-full rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 font-mono text-sm text-gray-200 transition-colors duration-150 ease-out focus:border-white/50 focus:outline-none"
                onChange={event => handleDiscordId(event.target.value)}
                value={userId}
                placeholder="Enter your Discord ID"
              />
            </div>
            <motion.p
              variants={{
                open: { opacity: 1, display: "block" },
                closed: { opacity: 0, display: "none" },
              }}
              initial="closed"
              animate={userError ? "open" : "closed"}
              className="mt-1 text-sm text-red-500"
              transition={{ duration: 0.15 }}
            >
              {userError}
            </motion.p>
            <CardPreview url={url} enabled={isValidUserId} onError={handlePreviewError} />
            <CopyOutput url={url} userId={userId} />
          </div>
          <ParameterForm options={options} setOptions={setOptions} />
        </div>
      </main>

      {userCount.data ? (
        <motion.div
          initial={{ scale: 0.99, opacity: 0, transform: "translateY(10px) translateX(-50%)" }}
          animate={{ scale: 1, opacity: 1, transform: "translateY(0) translateX(-50%)" }}
          transition={{ duration: 1.25, ease: [0, 0.4, 0.2, 1] }}
          className={cn(
            "fixed bottom-0 left-1/2 mb-8 flex h-min w-min min-w-[10rem] flex-row items-center justify-center rounded-full border border-white/5 bg-[#2A2A2A]/15 px-4 py-2.5 text-center text-sm leading-[1rem] whitespace-nowrap text-white/50 shadow-[0_4px_45px_-20px_#b390ff] max-sm:hidden",
          )}
        >
          Currently at&nbsp;
          <span className="bg-gradient-to-tr from-red-500 to-purple-700 bg-clip-text font-semibold text-transparent drop-shadow-[0_0_8px_#a931ff]">
            {userCount.data.toLocaleString()}
          </span>
          &nbsp;total users!
        </motion.div>
      ) : null}
    </>
  );
}
