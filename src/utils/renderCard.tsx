"use server";

import { Badges } from "#/public/assets/badges/BadgesEncoded";
import { getFlags, renderToStaticMarkup } from "@/utils/helpers";
import * as LanyardTypes from "@/utils/LanyardTypes";
import { encodeBase64 } from "@/utils/toBase64";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { hexToRgb } from "./color";
import * as Icons from "react-icons/si";
import redis from "./redis";

export type Parameters = {
  theme?: string;
  bg?: string;
  clanbg?: string;
  animated?: string;
  animatedDecoration?: string;
  hideDiscrim?: string;
  hideStatus?: string;
  hideTimestamp?: string;
  hideBadges?: string;
  hideProfile?: string;
  hideActivity?: string;
  hideSpotify?: string;
  hideClan?: string;
  hideDecoration?: string;
  ignoreAppId?: string;
  showDisplayName?: string;
  // For the sake of backwards compatibility;
  useDisplayName?: string;
  borderRadius?: string;
  idleMessage?: string;
  optimized: boolean;
  animationDuration?: string;
  waveColor?: string;
  waveSpotifyColor?: string;
  gradient?: string;
  imgStyle?: string;
  imgBorderRadius?: string;
  showBanner?: string;
  bannerFilter?: string;
};

const parseBool = (string: string | undefined): boolean => (string === "true" ? true : false);

const parseAppId = (string: string | undefined): Array<string> => {
  if (string === undefined) return [];
  return string.split(",");
};

const getFormatFromMs = (ms: number) => {
  let daysDifference = Math.floor(ms / 60 / 60 / 24);
  ms -= daysDifference * 60 * 60 * 24;

  let hoursDifference = Math.floor(ms / 60 / 60);
  ms -= hoursDifference * 60 * 60;

  let minutesDifference = Math.floor(ms / 60);
  ms -= minutesDifference * 60;

  let secondsDifference = Math.floor(ms);

  return `${hoursDifference >= 1 ? ("0" + hoursDifference).slice(-2) + ":" : ""}${("0" + minutesDifference).slice(
    -2,
  )}:${("0" + secondsDifference).slice(-2)}`;
};

const formatTime = (timestamps: LanyardTypes.Timestamps2) => {
  const { start, end } = timestamps;
  // End timestamps is prioritized over start timestamps and displayed accordingly.
  let startTime = new Date(end || start).getTime();
  let endTime = Number(new Date());
  let difference = end ? (startTime - endTime) / 1000 : (endTime - startTime) / 1000;
  if (difference < 0) return `00:00 ${end ? "left" : "elapsed"}`;

  return `${getFormatFromMs(difference)} ${end ? "left" : "elapsed"}`;
};

const getBlendedColor = (color1: string, color2: string, theme: string) => {
  if (color1 === "transparent") return "transparent";
  if (color2 === "transparent") color2 = "#fff";

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const midpoint = theme === "dark" ? 3 : 8;
  if (rgb1?.length !== 3 || rgb2?.length !== 3) return;

  const calculateBlend = (a: number, b: number) => {
    const baseColor = a < b ? a : b;
    const difference = Math.abs(a - b);
    return baseColor + Math.floor(difference / 11) * midpoint;
  };

  const avgR = calculateBlend(rgb1[0], rgb2[0]);
  const avgG = calculateBlend(rgb1[1], rgb2[1]);
  const avgB = calculateBlend(rgb1[2], rgb2[2]);

  // Convert to hex
  return `${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;
};

function getActivityIcon(activity: LanyardTypes.Activity | string, theme: string) {
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
          paddingRight: 4,
          paddingLeft: 2,
          top: 1,
          position: "relative",
        }}
      />
    );
  }

  return "";
}

async function getLargeImage(asset: LanyardTypes.Assets | null, application_id?: string): Promise<string> {
  if (asset?.large_image) {
    return asset.large_image.startsWith("mp:external/")
      ? `https://media.discordapp.net/external/${asset.large_image.replace(
          "mp:external/",
          "",
        )}${asset.large_image.includes(".gif") ? "?width=160&height=160" : ""}`
      : asset.large_image.startsWith("mp:attachments/")
        ? `https://media.discordapp.net/attachments/${asset.large_image.replace("mp:attachments/", "")}${asset.large_image.includes(".gif") ? "&width=160&height=160" : ""}`
        : `https://cdn.discordapp.com/app-assets/${application_id}/${asset.large_image}.webp`;
  }

  const res = await fetch(`${process.env.DISCORD_API_ENDPOINT}/${application_id}`);
  const data = res.ok ? await res.json() : null;

  if (
    !data?.id ||
    (await fetch(`https://cdn.discordapp.com/app-icons/${application_id}/${data.avatar}.webp`, { method: "HEAD" }))
      .status !== 200
  ) {
    return "https://lanyard.kyrie25.dev/assets/unknown.png";
  }

  return `https://cdn.discordapp.com/app-icons/${application_id}/${data.avatar}.webp`;
}

function getPrefixActivityString(activity: LanyardTypes.Activity) {
  switch (activity.type) {
    case 1:
      return "Streaming";
    case 2:
      return "Listening to";
    case 3:
      return "Watching";
    case 5:
      return "Competing in";
    case 0:
    default:
      return "";
  }
}

async function renderCard(body: LanyardTypes.Root, params: Parameters): Promise<string> {
  let { data } = body;

  let avatarBorderColor: string = "#747F8D",
    avatarExtension: string = "webp",
    statusExtension: string = "webp",
    activity: any = false,
    backgroundColor: string = "101320",
    theme = "dark",
    activityTheme = "dark",
    spotifyTheme = "dark",
    borderRadius = "10px",
    idleMessage = "I'm not currently doing anything!",
    animationDuration = "8s",
    waveColor = "7289da",
    waveSpotifyColor = "1DB954",
    gradient =
      "rgb(241, 9, 154), rgb(183, 66, 177), rgb(119, 84, 177), rgb(62, 88, 157), rgb(32, 83, 124), rgb(42, 72, 88)",
    imgStyle = "circle",
    imgBorderRadius = "10px",
    statusRadius = 4,
    banner = "",
    bannerFilter = "";

  let hideStatus = parseBool(params.hideStatus);
  let hideTimestamp = parseBool(params.hideTimestamp);
  let hideBadges = parseBool(params.hideBadges);
  let hideProfile = parseBool(params.hideProfile);
  let hideActivity = params.hideActivity ?? "false";
  let hideSpotify = parseBool(params.hideSpotify);
  let hideClan = parseBool(params.hideClan);
  let hideDecoration = parseBool(params.hideDecoration);
  let ignoreAppId = parseAppId(params.ignoreAppId);
  let hideDiscrim = parseBool(params.hideDiscrim);
  let showDisplayName = parseBool(params.showDisplayName) || parseBool(params.useDisplayName);
  let showBanner = parseBool(params.showBanner) || params.showBanner === "animated";

  if (data.activities[0]?.emoji?.animated && !params.optimized) statusExtension = "gif";
  if (data.discord_user.avatar && data.discord_user.avatar.startsWith("a_") && !params.optimized)
    avatarExtension = "gif";
  if (params.animated === "false") avatarExtension = "webp";

  if (!data.discord_user.avatar_decoration_data) hideDecoration = true;
  if (parseBool(params.hideDiscrim) || body.data.discord_user.discriminator === "0") hideDiscrim = true;
  if (!body.data.discord_user.clan) hideClan = true;

  if (params.theme === "light") {
    backgroundColor = "eee";
    theme = "light";
    activityTheme = "light";
    spotifyTheme = "light";
    waveColor = "FFD1DC";
  }
  if (params.bg) backgroundColor = params.bg;
  let clanBackgroundColor: string = theme === "light" ? "e0dede" : "3f444f";
  if (params.clanbg) clanBackgroundColor = params.clanbg;
  if (params.idleMessage) idleMessage = params.idleMessage;
  if (params.borderRadius) borderRadius = params.borderRadius;
  if (params.animationDuration) animationDuration = params.animationDuration;
  if (params.waveColor) {
    const [color, theme] = params.waveColor.split("-");
    waveColor = color;
    if (theme === "light" || theme === "dark") activityTheme = theme;
  }
  if (params.waveSpotifyColor) {
    const [color, theme] = params.waveSpotifyColor.split("-");
    waveSpotifyColor = color;
    if (theme === "light" || theme === "dark") spotifyTheme = theme;
  }
  if (params.gradient) {
    if (params.gradient.includes("-")) gradient = "#" + params.gradient.replaceAll("-", ", #");
    else gradient = `#${params.gradient}, #${params.gradient}`;
  }
  if (params.imgStyle) imgStyle = params.imgStyle;
  if (params.imgBorderRadius) {
    imgBorderRadius = params.imgBorderRadius;
    if (imgBorderRadius.includes("px")) {
      const conversionValue = 10 / 4;
      statusRadius = Number(imgBorderRadius.replace("px", "")) / conversionValue;
    }
  }
  if (showDisplayName && data.discord_user.global_name) data.discord_user.username = data.discord_user.global_name;

  if (showBanner) {
    banner = (await redis.get(`banner-${data.discord_user.id}`).catch(() => null)) || "";

    if (!banner) {
      const userData = await fetch(`${process.env.DISCORD_API_ENDPOINT}/${data.discord_user.id}`)
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null);

      if (userData?.banner) {
        const animatedBanner = params.showBanner === "animated" && userData.banner.startsWith("a_");
        banner = `https://cdn.discordapp.com/banners/${data.discord_user.id}/${userData.banner}.${animatedBanner ? "gif?size=256" : "webp?size=1024"}`;

        // Cache for 5 minutes
        await redis.set(`banner-${data.discord_user.id}`, userData.banner, "EX", 300).catch(() => null);
      } else {
        // Fetch banner from USRBG
        const usrbg = await fetch("https://usrbg.is-hardly.online/users")
          .then(res => (res.ok ? res.json() : null))
          .catch(() => null);
        if (usrbg?.users?.[data.discord_user.id]) {
          const {
            endpoint,
            bucket,
            prefix,
            users: { [data.discord_user.id]: etag },
          } = usrbg;
          banner = `${endpoint}/${bucket}/${prefix}${data.discord_user.id}?${etag}`;

          // Cache for 5 minutes
          await redis.set(`banner-${data.discord_user.id}`, banner, "EX", 300).catch(() => null);
        }
      }
    } else {
      // If cache is an URL, it's from USRBG
      try {
        new URL(banner);
      } catch {
        const animatedBanner = params.showBanner === "animated" && banner.startsWith("a_");
        banner = `https://cdn.discordapp.com/banners/${data.discord_user.id}/${banner}.${animatedBanner ? "gif?size=256" : "webp?size=1024"}`;
      }
    }
  }
  if (params.bannerFilter && banner) bannerFilter = params.bannerFilter;

  let avatar: string;
  if (data.discord_user.avatar) {
    avatar = await encodeBase64(
      `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${
        data.discord_user.avatar
      }.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`,
      avatarExtension === "gif" ? 64 : 128,
    );
  } else {
    avatar = await encodeBase64(
      `https://cdn.discordapp.com/embed/avatars/${
        data.discord_user.discriminator === "0"
          ? Number(BigInt(data.discord_user.id) >> BigInt(22)) % 6
          : Number(data.discord_user.discriminator) % 5
      }.png`,
      100,
    );
  }

  let clanBadge: string | null = null;
  if (data.discord_user.clan) {
    clanBadge = await encodeBase64(
      `https://cdn.discordapp.com/clan-badges/${data.discord_user.clan.identity_guild_id}/${data.discord_user.clan.badge}.png?size=16`,
      16,
    );
  }

  let avatarDecoration: string | null = null;
  if (!hideDecoration) {
    if (data.discord_user.avatar_decoration_data?.asset) {
      avatarDecoration = await encodeBase64(
        `https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png?size=64&passthrough=${params.animatedDecoration || "false"}`,
        100,
        false,
      );
    } else {
      // Fetch decoration from Decor
      const decorData = await fetch(
        encodeURI(`https://decor.fieryflames.dev/api/users?ids=${JSON.stringify([data.discord_user.id])}`),
      )
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null);

      if (decorData[data.discord_user.id]) {
        avatarDecoration = await encodeBase64(
          `https://ugc.decor.fieryflames.dev/${decorData?.[data.discord_user.id]}.png`,
          100,
          false,
        );
      }
    }
  }

  switch (data.discord_status) {
    case "online":
      avatarBorderColor = "#43B581";
      break;
    case "idle":
      avatarBorderColor = "#FAA61A";
      break;
    case "dnd":
      avatarBorderColor = "#F04747";
      break;
    case "offline":
      avatarBorderColor = "#747F8D";
      break;
  }

  let userStatus: Record<string, any> | null = null;
  if (data.activities[0] && data.activities[0].type === 4) userStatus = data.activities[0];

  let flags: string[] = getFlags(data.discord_user.public_flags);
  if (
    (data.discord_user.avatar && data.discord_user.avatar.includes("a_")) ||
    userStatus?.emoji?.id ||
    data.discord_user.avatar_decoration_data ||
    banner
  )
    flags.push("Nitro");

  const activities = data.activities
    // Filter only type 0
    .filter(activity => [0, 1, 2, 3, 5].includes(activity.type))
    // Filter ignored app ID
    .filter(activity => !ignoreAppId.includes(activity.application_id ?? ""))
    .filter(activity => !data.listening_to_spotify || activity.type !== 2)
    .sort((a, b) => a.type - b.type);

  // Take the highest one
  activity = Array.isArray(activities) ? activities[0] : activities;

  // Calculate height of parent SVG element
  const svgHeight = (): string => {
    if (hideProfile) return "130";
    if (hideActivity === "true") return "80";
    if (hideActivity === "whenNotUsed" && !activity && !data.listening_to_spotify) return "80";
    if (hideSpotify && data.listening_to_spotify) return "200";
    return "200";
  };

  // Calculate height of main div element
  const divHeight = (): string => {
    if (hideProfile) return "120";
    if (hideActivity === "true") return "80";
    if (hideActivity === "whenNotUsed" && !activity && !data.listening_to_spotify) return "80";
    if (hideSpotify && data.listening_to_spotify) return "200";
    return "200";
  };

  const ForeignDiv = (props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { xmlns: string }) => (
    <div {...props}>{props.children}</div>
  );

  const renderedSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" width="400px" height={svgHeight()}>
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
          .hover-opacity:hover {
              opacity: 0.25;
          }
          .transition {
              transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-duration: 200ms;
          }`}
        </style>
      </defs>
      <foreignObject x="0" y="0" width="400" height={svgHeight()}>
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
            height: `${divHeight()}px`,
            inset: 0,
            backgroundColor: banner ? "transparent" : `#${backgroundColor}`,
            color: theme === "dark" ? "#fff" : "#000",
            fontFamily: `'Century Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  flexDirection: "row",
                  height: "80px",
                  width: "80px",
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
                      flexDirection: "row",
                      height: "1.5rem",
                      gap: "5px",
                    }}
                  >
                    <h1
                      style={{
                        fontSize: "1.15rem",
                        margin: "0 12px 0 0",
                        whiteSpace: "nowrap",
                      }}
                    >
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

                    {!!hideBadges ? null : (
                      <div
                        style={{
                          display: "flex",
                          ...(userStatus && !hideStatus ? {} : { marginTop: "5px" }),
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
                }}
              >
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
                            fill={`#${getBlendedColor(waveColor, backgroundColor, activityTheme)}`}
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
                    {getActivityIcon(activity, theme)}
                    {activity.name}
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
                }}
              >
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
                            fill={`#${getBlendedColor(waveSpotifyColor, backgroundColor, spotifyTheme)}`}
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
                  src={
                    data.spotify.album_art_url
                      ? `data:image/png;base64,${await encodeBase64(data.spotify.album_art_url, 80)}`
                      : "https://lanyard.kyrie25.dev/assets/unknown.png"
                  }
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
                    {data.spotify.artist}
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
                display: "flex",
                flexDirection: "row",
                height: "150px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontStyle: "italic",
                  fontSize: "0.8rem",
                  color: theme === "dark" ? "#aaa" : "#444",
                  height: "auto",
                  textAlign: "center",
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
