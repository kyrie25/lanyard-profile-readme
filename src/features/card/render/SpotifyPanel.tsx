/* eslint-disable @next/next/no-img-element */

import { ActivityIcon } from "@/features/card/render/ActivityIcon";
import type { CardRenderContext } from "@/features/card/render/types";
import { WaveDivider } from "@/features/card/render/WaveDivider";
import { getFormatFromMs } from "@/utils/helpers";

export function SpotifyPanel({ context }: { context: CardRenderContext }) {
  const { panel, renderedAt, config, assets } = context;
  if (panel?.kind !== "spotify") return null;

  const { spotify } = panel;
  const {
    backgroundColor,
    spotifyTheme,
    borderRadius,
    animationDuration,
    waveSpotifyColor,
    imgBorderRadius,
    hideTimestamp,
  } = config;
  const start = spotify.timestamps?.start ?? 0;
  const duration = (spotify.timestamps?.end ?? 0) - start;
  const showTiming = !hideTimestamp && start > 0 && Number.isFinite(duration) && duration > 0;
  const elapsed = Math.max(0, Math.min(renderedAt - start, duration));

  return (
    <>
      <WaveDivider
        color={waveSpotifyColor}
        backgroundColor={backgroundColor}
        theme={spotifyTheme}
        animationDuration={animationDuration}
        nameplateReflection={config.nameplateReflection}
        nameplateAsset={assets.nameplateAsset}
        nameplateBackground={assets.nameplateBg}
        nameplateColor={assets.nameplateHex}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100px",
          fontSize: "0.8rem",
          padding: "5px 0 0 15px",
          backgroundColor: `#${waveSpotifyColor}`,
          borderRadius: `0px 0 ${borderRadius} ${borderRadius}`,
          zIndex: 2,
        }}
      >
        {assets.spotifyAlbumArt ? (
          <img
            src={assets.spotifyAlbumArt}
            alt="Spotify Album Art"
            style={{
              border: `solid 0.5px #${waveSpotifyColor}`,
              width: "80px",
              height: "80px",
              borderRadius: imgBorderRadius,
              marginRight: "15px",
              ...(assets.usesUnknownSpotifyImage ? { filter: "invert(100)" } : {}),
            }}
          />
        ) : null}
        <div style={{ color: "#999", marginTop: showTiming ? "0" : "-3px", lineHeight: 1, width: "279px" }}>
          <p
            style={{
              fontSize: "0.85rem",
              color: spotifyTheme === "dark" ? "#ccc" : "#777",
              margin: showTiming ? "0" : "revert",
            }}
          >
            Listening to <ActivityIcon activity="SiSpotify" theme={spotifyTheme} />{" "}
            <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>Spotify</span>
          </p>
          <p
            style={{
              height: "15px",
              color: spotifyTheme === "dark" ? "#fff" : "#000",
              fontWeight: "bold",
              fontSize: "0.85rem",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              margin: "7px 0",
            }}
          >
            {spotify.song}
          </p>
          <p
            style={{
              margin: "7px 0",
              height: "15px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: "0.85rem",
              textOverflow: "ellipsis",
              color: spotifyTheme === "dark" ? "#ccc" : "#777",
            }}
          >
            {spotify.artist ?? spotify.album}
          </p>
          {showTiming ? (
            <div
              style={{
                width: "calc(100% - 15px)",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>
                {getFormatFromMs(elapsed / 1000)}
              </span>
              <div
                style={{
                  width: "100%",
                  height: "2px",
                  backgroundColor: spotifyTheme === "dark" ? "#333" : "#ccc",
                  borderRadius: "5px",
                  marginLeft: "7px",
                  marginRight: "7px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(elapsed / duration) * 100}%`,
                    height: "100%",
                    backgroundColor: spotifyTheme === "dark" ? "#fff" : "#000",
                    borderRadius: "5px",
                  }}
                />
              </div>
              <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>
                {getFormatFromMs(duration / 1000)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
