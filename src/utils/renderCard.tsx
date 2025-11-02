/* eslint-disable @next/next/no-img-element */
"use server";

import { DetailedHTMLProps, HTMLAttributes } from "react";
import * as Icons from "react-icons/si";
import { Badges } from "#/public/assets/badges/BadgesEncoded";
import {
  getDisplayNameStyleClassname,
  getDisplayNameStyleEffectVars,
  getFlags,
  renderToStaticMarkup,
  parseCardParameters,
  prepareUserAssets,
  getAvatarBorderColor,
  processActivities,
  calculateDimensions,
  parseBool,
  formatTime,
  getFormatFromMs,
  getBlendedColor,
  getPrefixActivityString,
  DisplayNameStyleEffectID,
} from "@/utils/helpers";
import { getLargeImage } from "@/utils/actions";
import { encodeBase64 } from "@/utils/toBase64";
import type { API } from "@/types/api";
import type { LanyardTypes } from "@/types/lanyard";

type Activity = LanyardTypes.Activity;
type Root = LanyardTypes.Root;

function getActivityIcon(activity: Activity | string, theme: string) {
  const iconList = Object.keys(Icons);
  const icon =
    typeof activity === "string"
      ? activity
      : iconList.find(
          icon =>
            icon.replace("Si", "").toLowerCase() ===
            activity.name
              .replaceAll(" ", "")
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
              .toLowerCase(),
        );

  if (icon && (Icons as Record<string, React.ComponentType<any>>)[icon]) {
    const IconComponent = (Icons as Record<string, React.ComponentType<any>>)[icon];
    return (
      <IconComponent
        size={12}
        color={theme === "dark" ? "#fff" : "#000"}
        style={{
          paddingLeft: 2,
          top: 1,
          position: "relative",
        }}
      />
    );
  }

  return "";
}

async function renderCard(body: Root, params: API.Parameters): Promise<string> {
  const { data } = body;

  // Parse all configuration parameters
  const config = parseCardParameters(params, data);
  const {
    statusExtension,
    backgroundColor,
    theme,
    activityTheme,
    spotifyTheme,
    borderRadius,
    idleMessage,
    animationDuration,
    waveColor,
    waveSpotifyColor,
    gradient,
    imgStyle,
    imgBorderRadius,
    statusRadius,
    clanBackgroundColor,
    bannerFilter,
    hideStatus,
    hideTimestamp,
    hideBadges,
    hideProfile,
    hideActivity,
    hideSpotify,
    hideDecoration,
    ignoreAppId,
    hideDiscrim,
    showDisplayName,
    forceGradient,
  } = config;

  let { hideClan } = config;
  let activity: any = false;

  // Apply data mutations
  if (!data.discord_user.avatar_decoration_data) config.hideDecoration = true;
  if (parseBool(params.hideDiscrim) || body.data.discord_user.discriminator === "0") config.hideDiscrim = true;
  body.data.discord_user.clan = body.data.discord_user.clan || body.data.discord_user.primary_guild;
  if (!body.data.discord_user.clan) hideClan = true;
  if (showDisplayName && data.discord_user.global_name) data.discord_user.username = data.discord_user.global_name;

  // Prepare all user assets
  const assets = await prepareUserAssets(data, config, params);
  const { avatar, banner, clanBadge, avatarDecoration, nameplateHex, nameplateBg, nameplateAsset } = assets;

  // Calculate avatar border color based on status
  const avatarBorderColor = getAvatarBorderColor(data.discord_status);

  let userStatus: Record<string, any> | null = null;
  if (data.activities[0] && data.activities[0].type === 4) userStatus = data.activities[0];

  const flags: string[] = getFlags(data.discord_user.public_flags);
  if (
    (data.discord_user.avatar && data.discord_user.avatar.includes("a_")) ||
    userStatus?.emoji?.id ||
    data.discord_user.avatar_decoration_data ||
    banner
  )
    flags.push("Nitro");

  // Process activities to get the primary activity
  activity = processActivities(data, ignoreAppId);

  // Calculate dimensions
  const { svgHeight, divHeight } = calculateDimensions(
    hideProfile,
    hideActivity,
    activity,
    data.listening_to_spotify,
    hideSpotify,
  );

  const ForeignDiv = (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { xmlns: string }) => (
    <div {...props}>{props.children}</div>
  );

  const renderedSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="400px" height={svgHeight}>
      <defs>
        <style>
          {`@-webkit-keyframes wave {
              0% {
                  background-position-x: 360px;
              }
              100% {
                  background-position-x: 0;
              }
          }
          @keyframes wave {
              0% {
                  background-position-x: 360px;
              }
              100% {
                  background-position-x: 0;
              }
          }
          @-webkit-keyframes wave-reverse {
              0% {
                  background-position-x: -360px;
              }
              100% {
                  background-position-x: 0;
              }
          }
          @keyframes wave-reverse {
              0% {
                  background-position-x: -360px;
              }
              100% {
                  background-position-x: 0;
              }
          }

          :root {
              --white-500: hsl(0 calc(1*0%) 100% /1);
              --white-500-hsl: 0 calc(var(--saturation-factor, 1)* 0%) 100%;
              --saturation-factor: 1;
          }

          .username > *, .username > :before {
              animation-iteration-count: infinite !important;
          }

          .solid {
              color: var(--custom-display-name-styles-main-color)
          }

          .gradient {
              background: linear-gradient(to bottom right,var(--custom-display-name-styles-gradient-start-color) 10%,var(--custom-display-name-styles-gradient-end-color) 90%);
              background-clip: text;
              -webkit-background-clip: text;
              background-size: 100% auto;
              -webkit-text-fill-color: transparent;
              position: relative;
              z-index: 0
          }

          .neon {
              paint-order: stroke fill;
              -webkit-text-stroke-width: calc(1px + .04em);
              -webkit-text-stroke-color: hsl(from var(--custom-display-name-styles-main-color) h calc(s * 1.2) calc(min(60, l + 10 * clamp(0, (60 - l), 1))));
              color: var(--white-500);
              position: relative;
              z-index: 0;
              -webkit-padding-start: calc(1px + .04em);
              padding-inline-start:calc(1px + .04em);-webkit-margin-start: calc(-1px - .04em);
              margin-inline-start:calc(-1px - .04em);margin-bottom: calc(-1px - .04em);
              padding-bottom: calc(1px + .04em)
          }

          .neonGlow {
              color: transparent;
              height: 100%;
              inset: 0;
              overflow: hidden;
              position: absolute;
              text-overflow: ellipsis;
              width: 100%;
              background: linear-gradient(to bottom left,var(--custom-display-name-styles-light-2-color) 0,var(--custom-display-name-styles-light-2-color) 6%,var(--custom-display-name-styles-main-color) 20%,var(--custom-display-name-styles-light-1-color) 50%,var(--custom-display-name-styles-light-2-color) 56%,var(--custom-display-name-styles-main-color) 70%,var(--custom-display-name-styles-light-1-color) 100%);
              background-clip: text;
              background-position: 100% 0;
              background-size: 200% 200%;
              -webkit-text-fill-color: transparent;
              color: var(--custom-display-name-styles-main-color);
              filter: blur(calc(1px + .12em));
              opacity: .8;
              -webkit-text-stroke-width: calc(1px + .04em);
              -webkit-text-stroke-color: transparent;
              perspective: 1px;
              z-index: -1
          }

          .toon {
              --custom-toon-stroke-color: hsl(from var(--custom-display-name-styles-main-color) h s calc(max(12, l * 0.4)));
              --custom-toon-stroke-width: calc(1.6px + 0.04em);
              --custom-toon-margin: calc(var(--custom-toon-stroke-width)*-1);
              paint-order: stroke fill;
              position: relative;
              -webkit-text-stroke-width: var(--custom-toon-stroke-width);
              -webkit-text-stroke-color: var(--custom-toon-stroke-color);
              color: var(--custom-toon-stroke-color);
              -webkit-padding-start: var(--custom-toon-stroke-width);
              padding-bottom: var(--custom-toon-stroke-width);
              padding-inline-start:var(--custom-toon-stroke-width);-webkit-padding-end: var(--custom-toon-stroke-width);
              padding-inline-end:var(--custom-toon-stroke-width);-webkit-margin-start: var(--custom-toon-margin);
              margin-inline-start:var(--custom-toon-margin);margin-bottom: var(--custom-toon-margin);
              -webkit-margin-end: var(--custom-toon-margin);
              margin-inline-end:var(--custom-toon-margin);transition: color 266ms cubic-bezier(.43,.21,.27,.78)
          }

          .toon:before {
              background: linear-gradient(180deg,var(--white-500) 0,var(--custom-display-name-styles-light-2-color) 8%,var(--custom-display-name-styles-light-1-color) 15%,var(--custom-display-name-styles-main-color) 25%,var(--custom-display-name-styles-light-2-color) 45%,var(--custom-display-name-styles-main-color) 55%,var(--white-500) 75%,var(--custom-display-name-styles-light-2-color) 83%,var(--custom-display-name-styles-light-1-color) 90%,var(--custom-display-name-styles-main-color) 100%);
              background-clip: text;
              -webkit-background-clip: text;
              background-size: 100% 400%;
              content: attr(data-username-with-effects);
              inset: 0;
              padding-inline:var(--custom-toon-stroke-width);padding-bottom: var(--custom-toon-margin);
              position: absolute;
              -webkit-text-fill-color: transparent;
              -webkit-text-stroke-width: 0;
              -webkit-text-stroke-color: transparent;
              overflow: hidden;
              text-overflow: ellipsis;
              transition: opacity 266ms cubic-bezier(.43,.21,.27,.78);
              white-space: var(--custom-display-name-styles-wrap)
          }

          .pop {
              --custom-pop-stroke-width: 0;
              --custom-pop-bottom-translate_3d: 0.08em;
              color: var(--white-500);
              paint-order: stroke fill;
              position: relative;
              -webkit-text-stroke-color: var(--custom-display-name-styles-dark-2-color);
              margin-bottom: calc(var(--custom-pop-stroke-width)*-1 - var(--custom-pop-bottom-translate_3d));
              padding-bottom: calc(var(--custom-pop-stroke-width) + var(--custom-pop-bottom-translate_3d));
              padding-inline-start:var(--custom-pop-stroke-width)}

          .pop,.pop:before {
              -webkit-text-stroke-width:var(--custom-pop-stroke-width);
              -webkit-padding-start: var(--custom-pop-stroke-width);
              -webkit-margin-start: calc(var(--custom-pop-stroke-width)*-1);
              margin-inline-start:calc(var(--custom-pop-stroke-width)*-1)}

          .pop:before {
              bottom:calc(var(--custom-pop-bottom-translate_3d)*-1 - var(--custom-pop-stroke-width));
              color: var(--custom-display-name-styles-main-color);
              content: attr(data-username-with-effects);
              padding-inline-start:var(--custom-pop-stroke-width);position: absolute;
              top: 0;
              width: calc(100% - var(--custom-pop-stroke-width));
              z-index: -1;
              -webkit-text-stroke-color: transparent;
              background: linear-gradient(to bottom left,var(--custom-display-name-styles-light-1-color) 0,var(--custom-display-name-styles-light-1-color) 6%,var(--custom-display-name-styles-main-color) 20%,var(--custom-display-name-styles-main-color) 50%,var(--custom-display-name-styles-light-1-color) 56%,var(--custom-display-name-styles-main-color) 70%,var(--custom-display-name-styles-main-color) 100%);
              background-clip: text;
              -webkit-background-clip: text;
              background-position: 100% 0;
              background-size: 200% 200%;
              transform: translate3d(0,var(--custom-pop-bottom-translate_3d),0);
              -webkit-text-fill-color: transparent;
              overflow: hidden;
              text-decoration: none !important;
              text-overflow: ellipsis;
              white-space: var(--custom-display-name-styles-wrap)
          }

          .pop:before {
              text-decoration: underline;
              -webkit-text-decoration-color: var(--custom-display-name-styles-main-color);
              text-decoration-color: var(--custom-display-name-styles-main-color);
              text-underline-offset: calc(var(--custom-pop-bottom-translate_3d))
          }

          .neon {
              animation: neon-flicker-animation 4s cubic-bezier(.24,.31,.36,.93);
              animation-direction: normal;
              animation-fill-mode: forwards
          }

          .neonGlow {
              animation: neon-glow-flicker-animation 1666ms linear;
              animation-direction: normal;
              animation-fill-mode: forwards
          }

          .toon:before {
              animation: toon-animation 4s cubic-bezier(.44,.29,.48,1);
              animation-direction: normal;
              animation-fill-mode: forwards
          }

          .pop {
              animation: pop-animation-main 4s cubic-bezier(.44,.29,.48,1);
              animation-direction: normal;
              animation-fill-mode: forwards
          }

          .pop:before {
              animation: pop-animation-shadow 4s cubic-bezier(.44,.29,.48,1);
              animation-direction: normal;
              animation-fill-mode: forwards
          }

          @keyframes pop-animation-main {
              0% {
                  transform: translateZ(0)
              }

              18% {
                  perspective: 1px;
                  transform: translate3d(0,-.05em,0)
              }

              35% {
                  perspective: 1px;
                  transform: translate3d(0,.08em,0)
              }

              50%,to {
                  perspective: 1px;
                  transform: translateZ(0)
              }
          }

          @keyframes pop-animation-shadow {
              0% {
                  background-position: 100% 0;
                  perspective: 1px;
                  transform: translate3d(0,.08em,0)
              }

              18% {
                  perspective: 1px;
                  transform: translate3d(0,.13em,0)
              }

              35% {
                  perspective: 1px;
                  transform: translateZ(0)
              }

              50%,to {
                  background-position: 0 100%;
                  perspective: 1px;
                  transform: translate3d(0,.08em,0)
              }
          }

          @keyframes toon-animation {
              0%,5% {
                  background-position: 50% 0
              }

              55%,to {
                  background-position: 50% 100%
              }
          }

          @keyframes neon-flicker-animation {
              0%,15%,18%,20%,23%,25%,50% {
                  color: var(--white-500)
              }

              16%,22%,28% {
                  color: hsl(from var(--custom-display-name-styles-main-color) h calc(min(1, s) * ((s * 1.1) + 10)) 85)
              }

              51%,to {
                  color: var(--white-500)
              }
          }

          @keyframes neon-glow-flicker-animation {
              0% {
                  background-position: 100% 0
              }

              to {
                  background-position: 0 100%
              }
          }`}
        </style>
      </defs>
      <foreignObject x="0" y="0" width="400" height={svgHeight}>
        {banner ? (
          <ForeignDiv
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              position: "absolute",
              width: "400px",
              height: "200px",
              inset: 0,
              zIndex: -1,
              overflow: "hidden",
              borderRadius: borderRadius,
            }}
          >
            <img
              src={`data:image/png;base64,${await encodeBase64(banner, 400)}`}
              alt="User Banner"
              style={{
                width: "400px",
                height: "200px",
                aspectRatio: "400 / 200",
                objectFit: "cover",
                borderRadius: borderRadius,
                objectPosition: "center",
                ...(bannerFilter ? { filter: bannerFilter } : {}),
              }}
            />
          </ForeignDiv>
        ) : null}
        <ForeignDiv
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            position: "absolute",
            width: "400px",
            height: `${divHeight}px`,
            inset: 0,
            backgroundColor: banner ? "transparent" : `#${backgroundColor}`,
            color: theme === "dark" ? "#fff" : "#000",
            fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Century Gothic', Roboto, Helvetica, Arial, sans-serif`,
            fontSize: "16px",
            display: "flex",
            flexDirection: "column",
            borderRadius: borderRadius,
          }}
        >
          {!hideProfile ? (
            <div
              style={{
                width: "400px",
                height: "80px",
                inset: 0,
                display: "flex",
                flexDirection: "row",
                background: nameplateBg,
                position: "relative",
                borderRadius: hideActivity === "true" ? borderRadius : `${borderRadius} ${borderRadius} 0 0`,
              }}
            >
              {nameplateAsset ? (
                <img
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    height: "100%",
                    borderRadius: hideActivity === "true" ? borderRadius : `${borderRadius} ${borderRadius} 0 0`,
                  }}
                  src={`data:image/png;base64,${nameplateAsset}`}
                  alt="User Nameplate"
                />
              ) : null}
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  flexDirection: "row",
                  height: "80px",
                  width: "80px",
                  zIndex: 2,
                }}
              >
                {hideDecoration || !data.discord_user.avatar_decoration_data ? null : (
                  <img
                    src={`data:image/png;base64,${avatarDecoration}`}
                    alt="User Avatar Decoration"
                    style={{
                      position: "absolute",
                      height: "60px",
                      width: "60px",
                      top: "10px",
                      left: "10px",
                      zIndex: 1,
                    }}
                  />
                )}
                <img
                  src={`data:image/png;base64,${avatar}`}
                  alt="User Avatar"
                  style={{
                    ...(imgStyle === "square" ? {} : { border: `solid 3px ${avatarBorderColor}` }),
                    borderRadius: imgStyle === "square" ? imgBorderRadius : "50%",
                    width: "50px",
                    height: "50px",
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {imgStyle === "square" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      overflow: "visible",
                      zIndex: 9999,
                    }}
                  >
                    <rect
                      fill={avatarBorderColor}
                      x="4"
                      y="54"
                      width="16"
                      height="16"
                      rx={statusRadius}
                      ry={statusRadius}
                      stroke={`#${backgroundColor}`}
                      style={{ strokeWidth: "4px" }}
                    />
                  </svg>
                ) : null}
              </div>
              <div
                style={{
                  height: "80px",
                  width: "260px",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: userStatus && !hideStatus ? "row" : "column",
                    position: "relative",
                    top: userStatus && !hideStatus ? "35%" : "40%",
                    transform: "translate(0, -50%)",
                    height: userStatus && !hideStatus ? "25px" : "35px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: !userStatus || hideStatus ? "column" : "row",
                      height: "1.5rem",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        height: "100%",
                      }}
                    >
                      <h1
                        className="username"
                        style={{
                          fontSize: "1.15rem",
                          margin: "0 12px 0 0",
                          whiteSpace: "nowrap",
                          ...getDisplayNameStyleEffectVars(data.discord_user.display_name_styles),
                        }}
                      >
                        {!forceGradient && data.discord_user.display_name_styles ? (
                          <>
                            <span
                              data-username-with-effects={data.discord_user.username}
                              className={getDisplayNameStyleClassname(data.discord_user.display_name_styles)}
                            >
                              {data.discord_user.username}
                            </span>
                            {data.discord_user.display_name_styles?.effect_id === DisplayNameStyleEffectID.NEON ? (
                              <span className="neonGlow">{data.discord_user.username}</span>
                            ) : null}
                          </>
                        ) : (
                          <span
                            style={{
                              backgroundImage: `linear-gradient(60deg, ${gradient})`,
                              backgroundSize: "300%",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {data.discord_user.username}
                          </span>
                        )}

                        {!hideDiscrim && !showDisplayName ? (
                          <span
                            style={{
                              color: theme === "dark" ? "#ccc" : "#666",
                              fontWeight: "lighter",
                            }}
                          >
                            #{data.discord_user.discriminator}
                          </span>
                        ) : null}
                      </h1>

                      {hideClan || (!data.discord_user.clan?.tag && !data.discord_user.clan?.badge) ? null : (
                        <span
                          style={{
                            backgroundColor:
                              clanBackgroundColor === "transparent" ? clanBackgroundColor : `#${clanBackgroundColor}`,
                            borderRadius: "0.375rem",
                            paddingLeft: "0.5rem",
                            paddingRight: "0.5rem",
                            marginLeft: "-6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "16px",
                            fontWeight: 500,
                            height: "100%",
                          }}
                        >
                          <img src={`data:image/png;base64,${clanBadge!}`} alt="Clan Badge" />
                          <p style={{ marginBottom: "1.1rem" }}>{data.discord_user.clan!.tag}</p>
                        </span>
                      )}
                    </div>

                    {!!hideBadges ? null : (
                      <div
                        style={{
                          display: "flex",
                        }}
                      >
                        {flags.map(v => (
                          <img
                            key={v}
                            alt={v}
                            src={`data:image/png;base64,${Badges[v]}`}
                            style={{
                              height: "20px",
                              position: "relative",
                              top: "50%",
                              transform: "translate(0%, -50%)",
                              margin: "0 0 0 4px",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {userStatus && !hideStatus ? (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      marginTop: "16px",
                      color: theme === "dark" ? "#aaa" : "#333",
                      fontWeight: 400,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userStatus.emoji?.id ? (
                      <img
                        src={`data:image/png;base64,${await encodeBase64(
                          `https://cdn.discordapp.com/emojis/${userStatus.emoji.id}.${statusExtension}`,
                          32,
                        )}`}
                        alt="User Status Emoji"
                        style={{
                          width: "15px",
                          height: "15px",
                          position: "relative",
                          top: "10px",
                          transform: "translate(0%, -50%)",
                          margin: "0 2px 0 0",
                        }}
                      />
                    ) : null}

                    {userStatus.state && userStatus.emoji?.name && !userStatus.emoji.id
                      ? `${userStatus.emoji.name} ${userStatus.state}`
                      : userStatus.state
                        ? userStatus.state
                        : !userStatus.state && userStatus.emoji?.name && !userStatus.emoji.id
                          ? userStatus.emoji.name
                          : null}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {activity ? (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "21px",
                  ...(waveColor === "transparent" ? { opacity: 0 } : {}),
                  ...(nameplateBg ? { background: nameplateBg } : {}),
                }}
              >
                {nameplateAsset ? (
                  <img
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      zIndex: 0,
                      height: "80px",
                      objectFit: "cover",
                      transform: "rotate(180deg) scaleX(-1)",
                      maskImage: `linear-gradient(to bottom, transparent 25%, #000 100%)`,
                    }}
                    src={`data:image/png;base64,${nameplateAsset}`}
                    alt="User Nameplate"
                  />
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    background: `url(data:image/svg+xml;base64,${Buffer.from(
                      renderToStaticMarkup(
                        <svg
                          width="360"
                          height="21"
                          viewBox="0 0 360 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 20.7327V7.5817C0 7.5817 47.5312 -1.46932 106.734 1.23824C169.312 2.39863 191.672 13.6508 271.969 14.544C325.828 14.544 360 7.73642 360 7.73642V20.7327H0Z"
                            fill={`#${waveColor}`}
                          />
                        </svg>,
                      ),
                    ).toString("base64")})`,
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
                    background: `url(data:image/svg+xml;base64,${Buffer.from(
                      renderToStaticMarkup(
                        <svg
                          width="360"
                          height="21"
                          viewBox="0 0 360 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 20.7327V7.5817C0 7.5817 47.5312 -1.46932 106.734 1.23824C169.312 2.39863 191.672 13.6508 271.969 14.544C325.828 14.544 360 7.73642 360 7.73642V20.7327H0Z"
                            fill={getBlendedColor(waveColor, nameplateHex ?? backgroundColor, activityTheme)}
                          />
                        </svg>,
                      ),
                    ).toString("base64")})`,
                    WebkitAnimation: `wave-reverse ${animationDuration} linear infinite`,
                    animation: `wave-reverse ${animationDuration} linear infinite`,
                    WebkitAnimationDelay: "0s",
                    animationDelay: "0s",
                    width: "100%",
                    height: "21px",
                  }}
                />
              </div>
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
                <div
                  style={{
                    marginRight: "15px",
                    width: "auto",
                    height: "auto",
                  }}
                >
                  {activity.assets?.large_image || activity.application_id ? (
                    <img
                      src={`data:image/png;base64,${await encodeBase64(
                        await getLargeImage(activity.assets, activity.application_id),
                        196,
                      )}`}
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
                      src={`data:image/png;base64,${await encodeBase64(
                        `https://lanyard.kyrie25.dev/assets/unknown.png`,
                        64,
                      )}`}
                      alt="Unknown Icon"
                      style={{
                        width: "70px",
                        height: "70px",
                        marginTop: "4px",
                        filter: "invert(100)",
                      }}
                    />
                  )}

                  {activity.assets?.small_image ? (
                    <img
                      src={`data:image/png;base64,${await encodeBase64(
                        activity.assets.small_image.startsWith("mp:external/")
                          ? `https://media.discordapp.net/external/${activity.assets.small_image.replace(
                              "mp:external/",
                              "",
                            )}${activity.assets.small_image.includes(".gif") ? "?width=50&height=50" : ""}`
                          : activity.assets.small_image.startsWith("mp:attachments/")
                            ? `https://media.discordapp.net/attachments/${activity.assets.small_image.replace(
                                "mp:attachments/",
                                "",
                              )}${activity.assets.small_image.includes(".gif") ? "&width=50&height=50" : ""}`
                            : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.webp`,
                        64,
                      )}`}
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
                    marginTop:
                      (activity.timestamps?.start || activity.timestamps?.end) && !hideTimestamp ? "-6px" : "5px",
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
                      <span
                        style={{
                          fontWeight: "normal",
                          color: activityTheme === "dark" ? "#ccc" : "#777",
                        }}
                      >
                        {getPrefixActivityString(activity) + " "}
                      </span>
                    ) : null}
                    {getActivityIcon(activity, theme)}{" "}
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
                    activity.timestamps?.end && activity.timestamps?.start && activity.type !== 0 ? (
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
                              Date.now() - activity.timestamps.start,
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
                                ((Date.now() - activity.timestamps.start) /
                                  (activity.timestamps.end - activity.timestamps.start)) *
                                  100,
                              )}%`,
                              height: "100%",
                              backgroundColor: activityTheme === "dark" ? "#fff" : "#000",
                              borderRadius: "5px",
                            }}
                          ></div>
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
                        {formatTime(activity.timestamps)}
                      </p>
                    )
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {data.listening_to_spotify &&
          !activity &&
          !hideSpotify &&
          data.activities[Object.keys(data.activities).length - 1].type === 2 ? (
            <>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "21px",
                  ...(waveSpotifyColor === "transparent" ? { opacity: 0 } : {}),
                  ...(nameplateBg ? { background: nameplateBg } : {}),
                }}
              >
                {nameplateAsset ? (
                  <img
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      zIndex: 0,
                      height: "80px",
                      objectFit: "cover",
                      transform: "rotate(180deg) scaleX(-1)",
                      maskImage: `linear-gradient(to bottom, transparent 25%, #000 100%)`,
                    }}
                    src={`data:image/png;base64,${nameplateAsset}`}
                    alt="User Nameplate"
                  />
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    background: `url(data:image/svg+xml;base64,${Buffer.from(
                      renderToStaticMarkup(
                        <svg
                          width="360"
                          height="21"
                          viewBox="0 0 360 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 20.7327V7.5817C0 7.5817 47.5312 -1.46932 106.734 1.23824C169.312 2.39863 191.672 13.6508 271.969 14.544C325.828 14.544 360 7.73642 360 7.73642V20.7327H0Z"
                            fill={`#${waveSpotifyColor}`}
                          />
                        </svg>,
                      ),
                    ).toString("base64")})`,
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
                    background: `url(data:image/svg+xml;base64,${Buffer.from(
                      renderToStaticMarkup(
                        <svg
                          width="360"
                          height="21"
                          viewBox="0 0 360 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 20.7327V7.5817C0 7.5817 47.5312 -1.46932 106.734 1.23824C169.312 2.39863 191.672 13.6508 271.969 14.544C325.828 14.544 360 7.73642 360 7.73642V20.7327H0Z"
                            fill={getBlendedColor(waveSpotifyColor, nameplateHex ?? backgroundColor, spotifyTheme)}
                          />
                        </svg>,
                      ),
                    ).toString("base64")})`,
                    WebkitAnimation: `wave-reverse ${animationDuration} linear infinite`,
                    animation: `wave-reverse ${animationDuration} linear infinite`,
                    WebkitAnimationDelay: "0s",
                    animationDelay: "0s",
                    width: "100%",
                    height: "21px",
                  }}
                />
              </div>
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
                  src={`data:image/png;base64,${await encodeBase64(data.spotify.album_art_url ?? "https://lanyard.kyrie25.dev/assets/unknown.png", 80)}`}
                  alt="Spotify Album Art"
                  style={{
                    border: `solid 0.5px #${waveSpotifyColor}`,
                    width: "80px",
                    height: "80px",
                    borderRadius: imgBorderRadius,
                    marginRight: "15px",
                    ...(data.spotify.album_art_url ? {} : { filter: "invert(100)" }),
                  }}
                />
                <div
                  style={{
                    color: "#999",
                    marginTop: !hideTimestamp ? "0" : "-3px",
                    lineHeight: 1,
                    width: "279px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: spotifyTheme === "dark" ? "#ccc" : "#777",
                      margin: !hideTimestamp ? "0" : "revert",
                    }}
                  >
                    Listening to {getActivityIcon("SiSpotify", spotifyTheme)}{" "}
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
                            Date.now() - data.spotify.timestamps.start,
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
                              ((Date.now() - data.spotify.timestamps.start) /
                                (data.spotify.timestamps.end - data.spotify.timestamps.start)) *
                                100,
                            )}%`,
                            height: "100%",
                            backgroundColor: spotifyTheme === "dark" ? "#fff" : "#000",
                            borderRadius: "5px",
                          }}
                        ></div>
                      </div>
                      <span style={{ color: spotifyTheme === "dark" ? "#fff" : "#000" }}>
                        {getFormatFromMs((data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {!activity && (!data.listening_to_spotify || hideSpotify) && hideActivity === "false" ? (
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                height: "150px",
                justifyContent: "center",
                alignItems: "center",
                background: nameplateBg,
                borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
                overflow: "hidden",
              }}
            >
              {nameplateAsset ? (
                <div style={{ position: "absolute", top: -1, right: 0, height: "80px", width: "100%" }}>
                  <img
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      height: "80px",
                      objectFit: "cover",
                      transform: "rotate(180deg) scaleX(-1)",
                      maskImage: `linear-gradient(to bottom, transparent 25%, #000 100%)`,
                    }}
                    src={`data:image/png;base64,${nameplateAsset}`}
                    alt="User Nameplate"
                  />
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
          ) : null}
        </ForeignDiv>
      </foreignObject>
    </svg>
  );

  return renderToStaticMarkup(renderedSVG);
}

export default renderCard;
