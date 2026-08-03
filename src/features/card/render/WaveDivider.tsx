import { NameplateReflection } from "@/features/card/render/NameplateReflection";
import { getBlendedColor } from "@/utils/helpers";

const WAVE_PATH =
  "M0 20.7327V7.5817C0 7.5817 47.5312 -1.46932 106.734 1.23824C169.312 2.39863 191.672 13.6508 271.969 14.544C325.828 14.544 360 7.73642 360 7.73642V20.7327H0Z";

function getWaveDataUri(fill: string): string {
  const svg = `<svg width="360" height="21" viewBox="0 0 360 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${WAVE_PATH}" fill="${fill}"/></svg>`;
  return `url(data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")})`;
}

interface WaveDividerProps {
  color: string;
  backgroundColor: string;
  theme: string;
  animationDuration: string;
  nameplateAsset?: string;
  nameplateBackground?: string;
  nameplateColor?: string;
}

export function WaveDivider({
  color,
  backgroundColor,
  theme,
  animationDuration,
  nameplateAsset,
  nameplateBackground,
  nameplateColor,
}: WaveDividerProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "21px",
        ...(color === "transparent" ? { opacity: 0 } : {}),
        ...(nameplateBackground ? { background: nameplateBackground } : {}),
      }}
    >
      <NameplateReflection asset={nameplateAsset} />
      <div
        style={{
          position: "absolute",
          background: getWaveDataUri(`#${color}`),
          WebkitAnimation: `wave ${animationDuration} linear infinite`,
          animation: `wave ${animationDuration} linear infinite`,
          WebkitAnimationDelay: "0s",
          animationDelay: "0s",
          width: "100%",
          height: "21px",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          background: getWaveDataUri(getBlendedColor(color, nameplateColor ?? backgroundColor, theme)),
          WebkitAnimation: `wave-reverse ${animationDuration} linear infinite`,
          animation: `wave-reverse ${animationDuration} linear infinite`,
          WebkitAnimationDelay: "0s",
          animationDelay: "0s",
          width: "100%",
          height: "21px",
        }}
      />
    </div>
  );
}
