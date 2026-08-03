/* eslint-disable @next/next/no-img-element */

import { ActivityIcon } from "@/features/card/render/ActivityIcon";
import type { CardRenderContext } from "@/features/card/render/types";
import { WaveDivider } from "@/features/card/render/WaveDivider";
import { getFormatFromMs } from "@/utils/helpers";

export function SpotifyPanel({ context }: { context: CardRenderContext }) {
  const { data, activity, renderedAt, config, assets } = context;
  const {
    backgroundColor,
    spotifyTheme,
    borderRadius,
    animationDuration,
    waveSpotifyColor,
    imgBorderRadius,
    hideTimestamp,
    hideSpotify,
  } = config;
  const spotifyActivity = data.activities.at(-1);

  if (!data.listening_to_spotify || !data.spotify || activity || hideSpotify || spotifyActivity?.type !== 2) return null;

  return (
    <>
      <WaveDivider
        color={waveSpotifyColor}
        backgroundColor={backgroundColor}
        theme={spotifyTheme}
        animationDuration={animationDuration}
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
        <img
          src={`data:image/png;base64,${assets.spotifyAlbumArt}`}
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
        <div style={{ color: "#999", marginTop: !hideTimestamp ? "0" : "-3px", lineHeight: 1, width: "279px" }}>
          <p
            style={{
              fontSize: "0.85rem",
              color: spotifyTheme === "dark" ? "#ccc" : "#777",
              margin: !hideTimestamp ? "0" : "revert",
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
            {data.spotify.song}
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
            {data.spotify.artist ?? data.spotify.album}
          </p>
          {!hideTimestamp ? (
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
                {getFormatFromMs(
                  Math.min(
                    renderedAt - data.spotify.timestamps.start,
                    data.spotify.timestamps.end - data.spotify.timestamps.start,
                  ) / 1000,
                )}
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
                    width: `${Math.min(
                      100,
                      ((renderedAt - data.spotify.timestamps.start) /
                        (data.spotify.timestamps.end - data.spotify.timestamps.start)) *
                        100,
                    )}%`,
                    height: "100%",
                    backgroundColor: spotifyTheme === "dark" ? "#fff" : "#000",
                    borderRadius: "5px",
                  }}
                />
              </div>
              <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>
                {getFormatFromMs((data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
