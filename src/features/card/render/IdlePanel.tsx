import { NameplateReflection } from "@/features/card/render/NameplateReflection";
import type { CardRenderContext } from "@/features/card/render/types";

export function IdlePanel({ context }: { context: CardRenderContext }) {
  const { data, activity, config, assets } = context;
  const { theme, borderRadius, idleMessage, hideActivity, hideSpotify } = config;

  if (activity || (data.listening_to_spotify && !hideSpotify) || hideActivity !== "false") return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        height: "150px",
        justifyContent: "center",
        alignItems: "center",
        background: assets.nameplateBg,
        borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
        overflow: "hidden",
      }}
    >
      {assets.nameplateAsset ? (
        <div style={{ position: "absolute", top: -1, right: 0, height: "80px", width: "100%" }}>
          <NameplateReflection asset={assets.nameplateAsset} />
        </div>
      ) : null}
      <p
        style={{
          fontStyle: "italic",
          fontSize: "0.8rem",
          color: theme === "dark" ? "#aaa" : "#444",
          height: "auto",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        {idleMessage}
      </p>
    </div>
  );
}
