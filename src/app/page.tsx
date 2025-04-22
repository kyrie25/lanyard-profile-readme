"use client";

import React, { useState, JSX, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { getUserCount } from "@/utils/actions";
import { isSnowflake } from "@/utils/snowflake";
import Link from "next/link";
import { PARAMETER_INFO } from "@/utils/parameters";
import * as Icon from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn, filterLetters } from "@/lib/utils";

export default function Home() {
  const ORIGIN_URL = process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://lanyard.kyrie25.dev";

  const [userId, setUserId] = useState("");
  const [userError, setUserError] = useState<string | JSX.Element>();
  const [copyState, setCopyState] = useState("Copy");
  const [outputType, setOutputType] = useState<"markdown" | "html" | "url">("markdown");
  const [isLoaded, setIsLoaded] = useState(false);
  const [options, setOptions] = useState<Record<string, string | boolean>>({});

  const userCount = useSWR("getUserCount", getUserCount);

  async function onLoadDiscordId(userId: string) {
    setUserId(userId);
    setIsLoaded(false);
    setUserError(undefined);

    if (userId.length < 1) return;
    if (userId.length > 0 && !isSnowflake(userId)) return setUserError("Invalid Discord ID");
  }

  const validOptions = Object.keys(options).filter(
    option => options[option] !== undefined && options[option] !== null && options[option] !== "",
  );
  const url = `${ORIGIN_URL}/api/${userId}${
    validOptions.length > 0
      ? `?${validOptions
          .filter(option => options[option] !== undefined && options[option] !== null && options[option] !== "")
          .filter(option => {
            const paramInfo = PARAMETER_INFO.find(p => p.parameter === option);
            return !paramInfo?.displayCondition || paramInfo.displayCondition(options);
          })
          .map(option => `${option}=${options[option]}`)
          .join("&")}`
      : ""
  }`;

  const copyContent = {
    markdown: `[![Discord Presence](${url})](https://discord.com/users/${userId})`,
    html: `<a href="https://discord.com/users/${userId}"><img src="${url}" /></a>`,
    url: `${url}`,
  };

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const optionsContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOptionsClickOutside(event: MouseEvent) {
      if (
        isOptionsOpen &&
        optionsContentRef.current &&
        !optionsContentRef.current.contains(event.target as Node) &&
        !optionsTriggerRef.current?.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOptionsClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleOptionsClickOutside);
    };
  }, [isOptionsOpen]);

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
                onChange={e => onLoadDiscordId(e.target.value)}
                value={userId || ""}
                placeholder="Enter your Discord ID"
              />
            </div>

            {!isLoaded ? (
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
            ) : null}

            <div className="mt-2 flex flex-col gap-2">
              <img
                src={url}
                height={280}
                width={500}
                alt="Your Lanyard Banner"
                className={cn({ hidden: !isLoaded })}
                onLoad={() => setIsLoaded(true)}
                onError={() =>
                  userId.length > 0 && isSnowflake(userId)
                    ? setUserError(
                        <>
                          User is not monitored by Lanyard, please join{" "}
                          <Link href="https://discord.gg/lanyard" target="_blank" className="inline underline">
                            the server
                          </Link>{" "}
                          and try again.
                        </>,
                      )
                    : null
                }
              />
              {!isLoaded && (
                <div className="flex h-[224px] w-full items-center justify-center rounded-xl border border-white/10 bg-gray-50/5 px-16 text-center font-mono text-sm text-white/25">
                  Your Lanyard Banner
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-1">
                {(["markdown", "html", "url"] as const).map(type => (
                  <button
                    key={type}
                    className={cn(
                      "rounded-md border border-white/10 px-1.5 py-1 font-mono text-sm font-medium tracking-wide text-white/50 uppercase transition-colors duration-100 ease-out",
                      {
                        "border-white/20 bg-white/10 font-semibold text-white/75": outputType === type,
                        "hover:border-white/15 hover:bg-white/5": outputType !== type,
                      },
                    )}
                    onClick={() => setOutputType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm break-all text-blue-400">
                {copyContent[outputType]}
              </div>

              <div className="flex w-full gap-2">
                <button
                  className="w-full cursor-pointer rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-sm font-medium text-white/50 transition-colors duration-75 ease-out hover:bg-zinc-800/75 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(copyContent[outputType]);
                    setCopyState("Copied!");
                    setTimeout(() => setCopyState("Copy"), 1500);
                  }}
                >
                  {copyState}
                </button>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "top-32 z-[2] flex h-auto flex-col overflow-hidden rounded-lg border border-white/5 bg-black/75 p-4 text-white shadow-[0_6px_50px_-25px_rgba(180,177,255,0.2)] backdrop-blur-xl max-sm:h-[30rem] max-sm:w-full max-sm:overflow-y-scroll sm:-left-[1rem] sm:w-[30rem] sm:max-w-[30rem]",
            )}
          >
            <div className="grid-rows-auto mb-4 flex w-full flex-col gap-2.5 sm:grid sm:grid-cols-2">
              {PARAMETER_INFO.filter(item => item.type !== "boolean")
                .filter(item => !item.displayCondition || item.displayCondition(options))
                .map(item => {
                  return (
                    <div key={item.parameter} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-300">{item.title}</p>
                        <Popover>
                          <PopoverTrigger>
                            <Icon.InfoIcon
                              size={16}
                              className="rounded-md text-zinc-700 transition hover:text-gray-400"
                            />
                          </PopoverTrigger>
                          <PopoverContent side="top" className="text-sm">
                            {item.description?.split("\n").map((line, idx) => (
                              <React.Fragment key={idx}>
                                {line.split(/(`[^`]*`)/g).map((part, i) =>
                                  part.startsWith("`") && part.endsWith("`") ? (
                                    <code className="rounded-sm bg-gray-900 pr-1 pl-1" key={i}>
                                      {part.slice(1, -1)}
                                    </code>
                                  ) : (
                                    <React.Fragment key={i}>{part}</React.Fragment>
                                  ),
                                )}
                                <br />
                              </React.Fragment>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {item.type === "string" && (
                        <input
                          className="relative h-8 w-full appearance-none rounded-md border border-white/10 bg-transparent px-2 py-0.5 text-sm transition-all duration-150 ease-out outline-none placeholder:text-white/30 focus:border-white/50 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={item.options?.placeholder || "..."}
                          onChange={e => {
                            const filteredValue = encodeURIComponent(
                              filterLetters(
                                e.target.value,
                                (PARAMETER_INFO.find(p => p.parameter === item.parameter) as any).options.omit,
                              ),
                            );

                            setOptions(prev => ({
                              ...prev,
                              [item.parameter]: filteredValue,
                            }));
                          }}
                          value={decodeURIComponent((options[item.parameter] as string) || "")}
                        />
                      )}

                      {item.type === "list" && (
                        <div className="relative">
                          <select
                            value={(options[item.parameter] as string) || ""}
                            onChange={e =>
                              setOptions(prev => ({
                                ...prev,
                                [item.parameter]: e.target.value,
                              }))
                            }
                            className={cn(
                              "relative h-8 w-full appearance-none rounded-md border border-white/10 bg-black px-2 py-0.5 text-sm transition-all duration-150 ease-out outline-none placeholder:text-white/30 focus:border-white/50 disabled:cursor-not-allowed disabled:opacity-50",
                              {
                                "text-white/30 placeholder:text-white/30 hover:text-white focus:text-white":
                                  !options[item.parameter] || options[item.parameter] === "",
                              },
                            )}
                          >
                            <option value="" className="bg-black text-white">
                              None
                            </option>
                            {item.options.list.map(option => (
                              <option value={option.value} key={option.value} className="bg-black text-white">
                                {option.name}
                              </option>
                            ))}
                          </select>
                          <Icon.ChevronDown
                            size={14}
                            className="absolute top-0 right-2 my-auto flex h-full text-white/50"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Separated for easier styling/readability */}
            <div className="sm:grid-rows-auto flex flex-col gap-2 sm:grid sm:grid-cols-2">
              {PARAMETER_INFO.filter(item => item.type === "boolean")
                .filter(item => !item.displayCondition || item.displayCondition(options))
                .map(item => {
                  return (
                    <div key={item.parameter} className="flex flex-row items-start gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        className={cn(
                          "mt-0.5 max-h-4 min-h-4 max-w-4 min-w-4 cursor-pointer before:overflow-clip before:rounded-[0.25rem] after:absolute after:h-4 after:w-4 after:rounded-[0.25rem] after:border after:border-white/10 after:transition-all after:duration-150 after:ease-out",
                          {
                            "after:border-gray-200/50 after:bg-gray-500/40 checked:bg-gray-700":
                              item.parameter in options
                                ? options[item.parameter] === "true"
                                : item.options?.defaultBool,
                            "appearance-none after:bg-zinc-700/10 after:hover:bg-zinc-700/25":
                              item.parameter in options
                                ? options[item.parameter] !== "true"
                                : !item.options?.defaultBool,
                          },
                        )}
                        checked={
                          item.parameter in options ? options[item.parameter] === "true" : item.options?.defaultBool
                        }
                        onChange={e =>
                          setOptions(prev => ({
                            ...prev,
                            [item.parameter]: e.target.checked.toString(),
                          }))
                        }
                      />

                      <p
                        className="text-gray-300"
                        style={{
                          textDecoration: PARAMETER_INFO.find(p => p.parameter === item.parameter)?.deprecated
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {item.title}
                      </p>

                      <Popover>
                        <PopoverTrigger>
                          <Icon.InfoIcon
                            size={16}
                            className="mt-0.5 rounded-md text-zinc-700 transition hover:text-gray-400"
                          />
                        </PopoverTrigger>
                        <PopoverContent side="top" className="text-sm">
                          {item.description?.split("\n").map((line, idx) => (
                            <React.Fragment key={idx}>
                              {line.split(/(`[^`]*`)/g).map((part, i) =>
                                part.startsWith("`") && part.endsWith("`") ? (
                                  <code className="rounded-sm bg-gray-900 pr-1 pl-1" key={i}>
                                    {part.slice(1, -1)}
                                  </code>
                                ) : (
                                  <React.Fragment key={i}>{part}</React.Fragment>
                                ),
                              )}
                              <br />
                            </React.Fragment>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      {userCount.data && (
        <motion.div
          initial={{
            scale: 0.99,
            opacity: 0,
            transform: "translateY(10px) translateX(-50%)",
          }}
          animate={{
            scale: 1,
            opacity: 1,
            transform: "translateY(0) translateX(-50%)",
          }}
          transition={{ duration: 1.25, ease: [0, 0.4, 0.2, 1] }}
          className={cn(
            "fixed bottom-0 left-1/2 mb-8 flex h-min w-min min-w-[10rem] flex-row items-center justify-center rounded-full border border-white/5 bg-[#2A2A2A]/15 px-4 py-2.5 text-center text-sm leading-[1rem] whitespace-nowrap text-white/50 shadow-[0_4px_45px_-20px_#b390ff] max-sm:hidden",
          )}
        >
          Currently at&nbsp;
          <span className="bg-gradient-to-tr from-red-500 to-purple-700 bg-clip-text font-semibold text-transparent drop-shadow-[0_0_8px_#a931ff]">
            {userCount.data?.toLocaleString()}
          </span>
          &nbsp;total users!
        </motion.div>
      )}
    </>
  );
}
