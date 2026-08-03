/* eslint-disable @next/next/no-img-element */

import { ActivityIcon } from "@/features/card/render/ActivityIcon";
import type { CardRenderContext } from "@/features/card/render/types";
import { WaveDivider } from "@/features/card/render/WaveDivider";
import { formatTime, getFormatFromMs, getPrefixActivityString } from "@/utils/helpers";

export function ActivityPanel({ context }: { context: CardRenderContext }) {
  const { activity, renderedAt, config, assets } = context;
  if (!activity) return null;

  const {
    backgroundColor,
    theme,
    activityTheme,
    spotifyTheme,
    borderRadius,
    animationDuration,
    waveColor,
    imgStyle,
    imgBorderRadius,
    hideTimestamp,
  } = config;

  return (
    <>
      <WaveDivider
        color={waveColor}
        backgroundColor={backgroundColor}
        theme={activityTheme}
        animationDuration={animationDuration}
        nameplateAsset={assets.nameplateAsset}
        nameplateBackground={assets.nameplateBg}
        nameplateColor={assets.nameplateHex}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: `#${waveColor}`,
          borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
          height: "100px",
          fontSize: "0.75rem",
          padding: "5px 0 0 15px",
          zIndex: 2,
        }}
      >
        <div style={{ marginRight: "15px", width: "auto", height: "auto" }}>
          {!assets.usesUnknownActivityImage ? (
            <img
              src={`data:image/png;base64,${assets.activityLargeImage}`}
              alt="Activity Large Image"
              style={{
                width: "80px",
                height: "80px",
                border: `solid 0.5px #${waveColor}`,
                borderRadius: imgBorderRadius,
                objectFit: "cover",
              }}
            />
          ) : (
            <img
              src={`data:image/png;base64,${assets.activityLargeImage}`}
              alt="Unknown Icon"
              style={{ width: "70px", height: "70px", marginTop: "4px", filter: "invert(100)" }}
            />
          )}
          {assets.activitySmallImage ? (
            <img
              src={`data:image/png;base64,${assets.activitySmallImage}`}
              alt="Activity Small Image"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: imgStyle === "square" ? imgBorderRadius : "50%",
                marginLeft: "-26px",
                marginBottom: "-8px",
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            color: "#999",
            marginTop: (activity.timestamps?.start || activity.timestamps?.end) && !hideTimestamp ? "-6px" : "5px",
            lineHeight: "1",
            width: "279px",
          }}
        >
          <p
            style={{
              color: activityTheme === "dark" ? "#fff" : "#000",
              fontSize: "0.85rem",
              fontWeight: getPrefixActivityString(activity) ? "normal" : "bold",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              height: "15px",
              margin: "7px 0",
            }}
          >
            {getPrefixActivityString(activity) ? (
              <span style={{ fontWeight: "normal", color: activityTheme === "dark" ? "#ccc" : "#777" }}>
                {getPrefixActivityString(activity) + " "}
              </span>
            ) : null}
            <ActivityIcon activity={activity} theme={theme} />{" "}
            <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>{activity.name}</span>
          </p>
          {activity.details ? (
            <p
              style={{
                color: getPrefixActivityString(activity)
                  ? activityTheme === "dark"
                    ? "#fff"
                    : "#000"
                  : activityTheme === "dark"
                    ? "#ccc"
                    : "#777",
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
                fontWeight: getPrefixActivityString(activity) ? "bold" : "normal",
                textOverflow: "ellipsis",
                height: "15px",
                margin: "7px 0",
              }}
            >
              {activity.details}
            </p>
          ) : null}
          {activity.state ? (
            <p
              style={{
                color: activityTheme === "dark" ? "#ccc" : "#777",
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
                textOverflow: "ellipsis",
                height: "15px",
                margin: "7px 0",
              }}
            >
              {activity.state}
              {activity.party?.size ? ` (${activity.party.size[0]} of ${activity.party.size[1]})` : null}
            </p>
          ) : null}
          {(activity.timestamps?.end || activity.timestamps?.start) && !hideTimestamp ? (
            activity.timestamps?.end && activity.timestamps.start && activity.type !== 0 ? (
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
                <span style={{ color: activityTheme === "dark" ? "#fff" : "#000" }}>
                  {getFormatFromMs(
                    Math.min(
                      renderedAt - activity.timestamps.start,
                      activity.timestamps.end - activity.timestamps.start,
                    ) / 1000,
                  )}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: "2px",
                    backgroundColor: activityTheme === "dark" ? "#333" : "#ccc",
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
                        ((renderedAt - activity.timestamps.start) /
                          (activity.timestamps.end - activity.timestamps.start)) *
                          100,
                      )}%`,
                      height: "100%",
                      backgroundColor: activityTheme === "dark" ? "#fff" : "#000",
                      borderRadius: "5px",
                    }}
                  />
                </div>
                <span style={{ color: activityTheme === "dark" ? "#fff" : "#000" }}>
                  {getFormatFromMs((activity.timestamps.end - activity.timestamps.start) / 1000)}
                </span>
              </div>
            ) : (
              <p
                style={{
                  color: activityTheme === "dark" ? "#ccc" : "#777",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: "0.85rem",
                  textOverflow: "ellipsis",
                  height: "15px",
                  margin: "7px 0",
                }}
              >
                {formatTime(activity.timestamps, renderedAt)}
              </p>
            )
          ) : null}
        </div>
      </div>
    </>
  );
}
