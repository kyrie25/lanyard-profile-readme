/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";
import type { NameplateReflectionStyle } from "@/features/card/config/schema";

const reflectionStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  zIndex: 0,
  height: "80px",
  objectFit: "cover",
};

const reflections: Record<NameplateReflectionStyle, CSSProperties & { maskImage: string }> = {
  classic: {
    top: -1,
    transform: "scaleY(-1)",
    opacity: 0.48,
    filter: "blur(0.5px) saturate(0.75)",
    maskImage: "linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0.55) 28%, transparent 72%)",
  },
  glass: {
    transformOrigin: "top",
    transform: "scaleY(-0.62) translateY(-100%)",
    opacity: 0.5,
    filter: "blur(0.25px) brightness(1.1) saturate(0.8)",
    maskImage: "linear-gradient(to top, #000b 0%, #000 3%, #0007 17%, #0002 45%, transparent 84%)",
  },
  water: {
    // Leave room for horizontal displacement beyond the clipped card edge.
    right: -8,
    clipPath: "inset(0 8px 0 0)",
    transformOrigin: "top",
    transform: "scaleY(-0.86) translateY(-100%)",
    opacity: 0.48,
    filter: "url(#nameplate-water-ripple) blur(0.4px) saturate(0.85)",
    maskImage:
      "linear-gradient(to top, #0008 0%, #000e 5%, #0008 14%, #000b 21%, #0005 31%, #0007 38%, #0003 48%, #0004 55%, transparent 85%)",
  },
};

export function NameplateReflection({ asset, variant }: { asset?: string; variant: NameplateReflectionStyle }) {
  if (!asset) return null;
  const style = reflections[variant];
  return <img style={{ ...reflectionStyle, ...style, WebkitMaskImage: style.maskImage }} src={asset} alt="" />;
}
