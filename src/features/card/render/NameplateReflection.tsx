/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";

const reflectionMask = "linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0.55) 28%, transparent 72%)";

const reflectionStyle: CSSProperties = {
  position: "absolute",
  top: -1,
  right: 0,
  zIndex: 0,
  height: "80px",
  objectFit: "cover",
  transform: "scaleY(-1)",
  opacity: 0.48,
  filter: "blur(0.5px) saturate(0.75)",
  maskImage: reflectionMask,
  WebkitMaskImage: reflectionMask,
};

export function NameplateReflection({ asset }: { asset?: string }) {
  if (!asset) return null;
  return <img style={reflectionStyle} src={`data:image/png;base64,${asset}`} alt="User Nameplate" />;
}
