import { useState } from "react";
import { cn } from "@/lib/utils";

type OutputType = "markdown" | "html" | "url";

export function CopyOutput({ url, userId }: { url: string; userId: string }) {
  const [copyState, setCopyState] = useState("Copy");
  const [outputType, setOutputType] = useState<OutputType>("markdown");
  const copyContent: Record<OutputType, string> = {
    markdown: `[![Discord Presence](${url})](https://discord.com/users/${userId})`,
    html: `<a href="https://discord.com/users/${userId}"><img src="${url}" /></a>`,
    url,
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1">
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
      <button
        className="w-full cursor-pointer rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-sm font-medium text-white/50 transition-colors duration-75 ease-out hover:bg-zinc-800/75 hover:text-white"
        onClick={() => {
          void navigator.clipboard.writeText(copyContent[outputType]);
          setCopyState("Copied!");
          setTimeout(() => setCopyState("Copy"), 1500);
        }}
      >
        {copyState}
      </button>
    </div>
  );
}
