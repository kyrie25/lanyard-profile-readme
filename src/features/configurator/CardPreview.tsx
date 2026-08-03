/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CardPreviewProps {
  url: string;
  enabled: boolean;
  onError: (message?: string) => void;
}

export function CardPreview({ url, enabled, onError }: CardPreviewProps) {
  const [preview, setPreview] = useState<{ source: string; imageUrl: string; loaded: boolean }>();
  const currentPreview = enabled && preview?.source === url ? preview : undefined;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let objectUrl: string | undefined;

    async function loadPreview() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.data?.message || "An unknown error occurred, please try again later.");
        }

        objectUrl = URL.createObjectURL(await response.blob());
        setPreview({ source: url, imageUrl: objectUrl, loaded: false });
        onError(undefined);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        onError(error instanceof Error ? error.message : "An unknown error occurred, please try again later.");
      }
    }

    void loadPreview();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [enabled, onError, url]);

  return (
    <div className="mt-2 flex flex-col gap-2">
      {currentPreview ? (
        <img
          src={currentPreview.imageUrl}
          height={280}
          width={500}
          alt="Your Lanyard Banner"
          className={cn({ hidden: !currentPreview.loaded })}
          onLoad={() =>
            setPreview(previous => (previous?.source === url ? { ...previous, loaded: true } : previous))
          }
        />
      ) : null}
      {!currentPreview?.loaded ? (
        <div className="flex h-[224px] w-full items-center justify-center rounded-xl border border-white/10 bg-gray-50/5 px-16 text-center font-mono text-sm text-white/25">
          Your Lanyard Banner
        </div>
      ) : null}
    </div>
  );
}
