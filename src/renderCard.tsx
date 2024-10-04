//probably the messiest code i've ever written but it works so :)
import { renderToString } from "react-dom/server";
import { Badges } from "../public/assets/badges/BadgesEncoded";
import { getFlags } from "./getFlags";
import * as LanyardTypes from "./LanyardTypes";
import { encodeBase64 } from "./toBase64";
import escape from "escape-html";
import { hexToRgb, Color, Solver } from "./colorFilter";
import axios from "axios";
import redis from "./redis";
import * as Icons from "react-icons/si";

type Parameters = {
    animationDuration?: string;
    theme?: string;
    bg?: string;
    clanbg?: string;
    animated?: string;
    decoration?: string;
    hideDiscrim?: string;
    hideStatus?: string;
    hideTimestamp?: string;
    hideBadges?: string;
    hideProfile?: string;
    hideClan?: string;
    borderRadius?: string;
    idleMessage?: string;
    waveColor?: string;
    waveSpotifyColor?: string;
    gradient?: string;
    imgStyle?: string;
    imgBorderRadius?: string;
    useDisplayName?: string;
    showBanner?: string;
    bannerFilter?: string;
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

const formatTime = (timestamps: any) => {
    const { start, end } = timestamps;
    // End timestamps is prioritized over start timestamps and displayed accordingly.
    let startTime = new Date(end || start).getTime();
    let endTime = Number(new Date());
    let difference = end ? (startTime - endTime) / 1000 : (endTime - startTime) / 1000;
    if (difference < 0) return `00:00 ${end ? "left" : "elapsed"}`;

    return `${getFormatFromMs(difference)} ${end ? "left" : "elapsed"}`;
};

const getColorFilter = (hex: string) => {
    if (hex === "transparent") return "brightness(0) saturate(100%)";

    const rgb = hexToRgb(hex);
    if (rgb?.length !== 3) return;

    const color = new Color(rgb[0], rgb[1], rgb[2]);
    const solver = new Solver(color);
    const result = solver.solve();
    return result.filter;
};

// Get the blended color value between two colors with 10 midpoints
const getBlendedFilter = (color1: string, color2: string, theme: string) => {
    if (color1 === "transparent" || color2 === "transparent") return "brightness(0) saturate(100%)";

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

    const color = new Color(avgR, avgG, avgB);
    const solver = new Solver(color);
    const result = solver.solve();
    return result.filter;
};

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

    const data = await axios.get(`${process.env.DISCORD_API_ENDPOINT}/${application_id}`).catch(() => null);

    if (
        !data?.data?.id ||
        (
            await axios
                .head(`https://cdn.discordapp.com/app-icons/${application_id}/${data.data.avatar}.webp`)
                .catch(e => e)
        ).status !== 200
    ) {
        return "https://lanyard.kyrie25.me/assets/unknown.png";
    }

    return `https://cdn.discordapp.com/app-icons/${application_id}/${data.data.avatar}.webp`;
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

function minify(s) {
    return s
        ? s
              .replace(/\>[\r\n ]+\</g, "><") // Removes new lines and irrelevant spaces which might affect layout, and are better gone
              .replace(/(<.*?>)|\s+/g, (m, $1) => ($1 ? $1 : " ")) // Removes all spaces except for those in tags
              .replace(/; +/g, ";") // Removes spaces after semicolons
              .replace(/style=" +/g, 'style="') // Removes spaces after style="
              .trim()
        : "";
}

function getActivityIcon(activity: LanyardTypes.Activity, theme: string) {
    const iconList = Object.keys(Icons);
    const icon = iconList.find(
        icon =>
            icon.replace("Si", "").toLowerCase() ===
            activity.name
                .replaceAll(" ", "")
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                .toLowerCase(),
    );

    if (icon) {
        return renderToString(
            Icons[icon]({
                size: 12,
                color: theme === "dark" ? "#fff" : "#000",
                style: {
                    paddingRight: 4,
                    paddingLeft: 2,
                    top: 1,
                    position: "relative",
                },
            }),
        );
    }

    return "";
}

const renderCard = async (body: LanyardTypes.Root, params: Parameters): Promise<string> => {
    let { data } = body;

    let avatarBorderColor: string = "#747F8D",
        avatarExtension: string = "webp",
        statusExtension: string = "webp",
        activity: any = false,
        backgroundColor: string = "101320",
        theme = "dark",
        activityTheme = "dark",
        spotifyTheme = "dark",
        decoration = "true",
        discrim = "show",
        hideStatus = "false",
        hideTimestamp = "false",
        hideBadges = "false",
        hideProfile = "false",
        hideClan = "false",
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

    if (data.activities[0]?.emoji?.animated) statusExtension = "gif";
    if (data.discord_user.avatar && data.discord_user.avatar.startsWith("a_")) avatarExtension = "gif";
    if (params.animated === "false") avatarExtension = "webp";
    if (params.hideStatus === "true") hideStatus = "true";
    if (params.hideTimestamp === "true") hideTimestamp = "true";
    if (params.hideBadges === "true") hideBadges = "true";
    if (params.hideDiscrim === "true") discrim = "hide";
    if (params.hideProfile === "true") hideProfile = "true";
    if (params.hideClan === "true" || !data.discord_user.clan) hideClan = "true";
    if (params.decoration === "false") decoration = "false";
    if (params.theme === "light") {
        backgroundColor = "#eee";
        theme = "light";
        activityTheme = "light";
        spotifyTheme = "light";
    }
    if (params.bg) backgroundColor = params.bg;
    let clanBackgroundColor = theme === "light" ? "f0f0f0" : "333";
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
    if (params.useDisplayName === "true" && data.discord_user.global_name)
        data.discord_user.username = data.discord_user.global_name;
    if (params.showBanner === "true" || params.showBanner === "animated") {
        banner = await redis.get(`banner-${data.discord_user.id}`).catch(() => null);

        if (!banner) {
            const userData = await axios
                .get(`${process.env.DISCORD_API_ENDPOINT}/${data.discord_user.id}`)
                .catch(() => null);

            if (userData?.data?.banner) {
                const animatedBanner = params.showBanner === "animated" && userData.data.banner.startsWith("a_");
                banner = `https://cdn.discordapp.com/banners/${data.discord_user.id}/${userData.data.banner}.${animatedBanner ? "gif" : "webp"}?size=1024`;

                // Cache for 5 minutes
                await redis.set(`banner-${data.discord_user.id}`, userData.data.banner, "EX", 300).catch(() => null);
            } else {
                // Fetch banner from USRBG
                const usrbg = await axios("https://usrbg.is-hardly.online/users").catch(() => null);
                if (usrbg?.data?.users?.[data.discord_user.id]) {
                    const {
                        endpoint,
                        bucket,
                        prefix,
                        users: { [data.discord_user.id]: etag },
                    } = usrbg.data;
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
                banner = `https://cdn.discordapp.com/banners/${data.discord_user.id}/${banner}.${animatedBanner ? "gif" : "webp"}?size=1024`;
            }
        }
    }
    if (params.bannerFilter && banner) bannerFilter = params.bannerFilter;

    let avatar: String;
    if (data.discord_user.avatar) {
        avatar = await encodeBase64(
            `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${
                data.discord_user.avatar
            }.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`,
        );
    } else {
        avatar = await encodeBase64(
            `https://cdn.discordapp.com/embed/avatars/${
                data.discord_user.discriminator === "0"
                    ? Number(BigInt(data.discord_user.id) >> BigInt(22)) % 6
                    : Number(data.discord_user.discriminator) % 5
            }.webp`,
        );
    }

    let decor = "";
    if (decoration === "true" && data.discord_user.avatar_decoration_data?.asset) {
        decor = await encodeBase64(
            `https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.webp`,
        );
    }

    let clanBadge: string | null = null;
    if (data.discord_user.clan) {
        clanBadge = await encodeBase64(
            `https://cdn.discordapp.com/clan-badges/${data.discord_user.clan.identity_guild_id}/${data.discord_user.clan.badge}.png?size=16`,
        );
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

    // Filter playing, watching, listening, competiting activities
    // If the user is listening to Spotify, we will display that instead of the last activity
    // https://github.com/discordjs/RPC/pull/149#discussion_r1690290834
    const activities = data.activities
        .filter(activity => [0, 1, 2, 3, 5].includes(activity.type))
        .filter(activity => !data.listening_to_spotify || activity.type !== 2)
        .sort((a, b) => a.type - b.type);

    // Take the highest one
    activity = Array.isArray(activities) ? activities[0] : activities;

    return minify(
        `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="400px" height="${
                hideProfile === "true" ? "120px" : "200px"
            }">
                <style>
                    @-webkit-keyframes wave {
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
                </style>
                <foreignObject x="0" y="0" width="400" height="${hideProfile === "true" ? "120" : "200"}">
                    ${
                        banner
                            ? `
                        <div xmlns="http://www.w3.org/1999/xhtml" style="
                            position: absolute;
                            width: 400px;
                            height: 200px;
                            inset: 0;
                            z-index: -1;
                            overflow: hidden;
                            border-radius: ${borderRadius};
                        ">
                            <img
                                xmlns="http://www.w3.org/1999/xhtml"
                                src="data:image/png;base64,${await encodeBase64(banner)}"
                                style="
                                    width: 400px;
                                    height: 200px;
                                    aspect-ratio: 400 / 200;
                                    object-fit: cover;
                                    border-radius: ${borderRadius};
                                    object-position: center;
                                    ${bannerFilter ? `filter: ${bannerFilter};` : ""}
                            "/>
                        </div>`
                            : ""
                    }
                    <div xmlns="http://www.w3.org/1999/xhtml" style="
                        position: absolute;
                        width: 400px;
                        height: ${hideProfile === "true" ? "120px" : "200px"};
                        inset: 0;
                        background-color: ${banner ? "transparent" : `#${backgroundColor};`};
                        color: ${theme === "dark" ? "#fff" : "#000"};
                        font-family: 'Century Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        display: flex;
                        flex-direction: column;
                        border-radius: ${borderRadius};
                    ">
                    ${
                        hideProfile === "true"
                            ? ""
                            : `
                        <div style="
                            width: 400px;
                            height: 80px;
                            inset: 0;
                            display: flex;
                            flex-direction: row;
                        ">
                            <div style="
                                display: flex;
                                flex-direction: row;
                                height: 80px;
                                width: 80px;
                            ">
                                ${
                                    decor !== ""
                                        ? `<img
                                            src="data:image/png;base64,${decor}"
                                            style="
                                                position: absolute;
                                                height: 60px;
                                                width: 60px;
                                                top: 10px;
                                                left: 10px;
                                                z-index: 1;"
                                        />`
                                        : ""
                                }
                                <img src="data:image/png;base64,${avatar}"
                                style="
                                    ${imgStyle === "square" ? "" : `border: solid 3px ${avatarBorderColor};`}
                                    border-radius: ${imgStyle === "square" ? imgBorderRadius : "50%"};
                                    width: 50px;
                                    height: 50px;
                                    position: relative;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                "/>
                                ${
                                    imgStyle === "square"
                                        ? `<svg xmlns="http://www.w3.org/2000/svg"
                                            style="
                                            overflow: visible;
                                            z-index: 9999;
                                            ">
                                                <rect fill="${avatarBorderColor}" x="4" y="54" width="16" height="16" rx="${statusRadius}" ry="${statusRadius}" stroke="#${backgroundColor}" style="stroke-width: 4px;"/>
                                            </svg>`
                                        : ""
                                }
                            </div>
                            <div style="
                                height: 80px;
                                width: 260px;
                            ">
                                <div style="
                                    display: flex;
                                    flex-direction: ${userStatus && hideStatus !== "true" ? "row" : "column"};
                                    position: relative;
                                    top: ${userStatus && hideStatus !== "true" ? "35%" : "40%"};
                                    transform: translate(0, -50%);
                                    height: ${userStatus && hideStatus !== "true" ? "25px" : "35px"};
                                ">
                                <div style="
                                    display: flex;
                                    flex-direction: row;
                                    gap: 5px;
                                    height: 1.5rem;
                                ">
                                    <h1 style="
                                        font-size: 1.15rem;
                                        margin: 0 12px 0 0;
                                        white-space: nowrap;
                                    ">
                                    ${`<span style="background-image: linear-gradient(60deg, ${gradient}); background-size: 300%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${escape(
                                        data.discord_user.username,
                                    )}</span>`}${
                                        // New username system
                                        discrim !== "hide" && data.discord_user.discriminator !== "0"
                                            ? `<span style="color: ${
                                                  theme === "dark" ? "#ccc" : "#666"
                                              }; font-weight: lighter;">#${data.discord_user.discriminator}</span>`
                                            : ""
                                    }
                                    </h1>

                                    ${
                                        hideClan === "true" ||
                                        (!data.discord_user.clan?.tag && !data.discord_user.clan?.badge)
                                            ? ""
                                            : `
                                        <span style="
                                            background-color: #${clanBackgroundColor};
                                            border-radius: 0.375rem;
                                            padding-left: 0.5rem;
                                            padding-right: 0.5rem;
                                            margin-left: -6px;
                                            margin-right: 12px;
                                            display: flex;
                                            align-items: center;
                                            gap: 0.25rem;
                                            font-size: 16px;
                                            font-weight: 500;
                                            height: 100%;
                                        ">
                                            <img src="data:image/png;base64,${clanBadge!}" />
                                            <p style="margin-bottom: 1.1rem">${escape(data.discord_user.clan!.tag)}</p>
                                        </span>
                                    `
                                    }
                                </div>
                                    ${
                                        hideBadges == "true"
                                            ? ""
                                            : `<div style="${
                                                  userStatus && hideStatus !== "true" ? "" : "margin-top:5px;"
                                              }">
                                                ${flags
                                                    .map(
                                                        v => `
                                                    <img src="data:image/png;base64,${Badges[v]}" style="
                                                        height: 20px;
                                                        position: relative;
                                                        top: 50%;
                                                        transform: translate(0%, -50%);
                                                        margin: 0 0 0 4px;
                                                    " />`,
                                                    )
                                                    .join("")}
                                                </div>`
                                    }
                                </div>
                                ${
                                    userStatus && hideStatus !== "true"
                                        ? `
                                    <h1 style="
                                        font-size: 0.9rem;
                                        margin-top: 16px;
                                        color: ${theme === "dark" ? "#aaa" : "#333"};
                                        font-weight: 400;
                                        overflow: hidden;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                    ">
                                    ${
                                        userStatus.emoji?.id
                                            ? `
                                        <img src="data:image/png;base64,${await encodeBase64(
                                            `https://cdn.discordapp.com/emojis/${userStatus.emoji.id}.${statusExtension}`,
                                        )}"
                                        style="
                                            width: 15px;
                                            height: 15px;
                                            position: relative;
                                            top: 10px;
                                            transform: translate(0%, -50%);
                                            margin: 0 2px 0 0;
                                        " />`
                                            : ""
                                    }
                                    ${
                                        userStatus.state && userStatus.emoji?.name && !userStatus.emoji.id
                                            ? `${userStatus.emoji.name} ${escape(userStatus.state)}`
                                            : userStatus.state
                                              ? escape(userStatus.state)
                                              : userStatus.emoji?.name && !userStatus.emoji.id
                                                ? escape(userStatus.emoji.name)
                                                : ""
                                    }
                                </h1>`
                                        : ``
                                }
                            </div>
                        </div>`
                    }

                        ${
                            activity
                                ? `
                            <div style="position: relative; width: 100%; height: 21px;${waveColor === "transparent" ? "opacity: 0;" : ""}">
                                <div style="
                                    position: absolute;
                                    background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIxIiB2aWV3Qm94PSIwIDAgMzYwIDIxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMC43MzI3VjcuNTgxN0MwIDcuNTgxNyA0Ny41MzEyIC0xLjQ2OTMyIDEwNi43MzQgMS4yMzgyNEMxNjkuMzEyIDIuMzk4NjMgMTkxLjY3MiAxMy42NTA4IDI3MS45NjkgMTQuNTQ0QzMyNS44MjggMTQuNTQ0IDM2MCA3LjczNjQyIDM2MCA3LjczNjQyVjIwLjczMjdIMFoiIGZpbGw9IiMxRTIyMzMiLz4KPC9zdmc+Cg==);
                                    -webkit-animation: wave ${animationDuration} linear infinite;
                                    animation: wave ${animationDuration} linear infinite;
                                    -webkit-animation-delay: 0s;
                                    animation-delay: 0s;
                                    width: 100%;
                                    height: 21px;
                                    z-index: 1;
                                    filter: brightness(0) saturate(100%) ${getColorFilter(waveColor)}"
                                ></div>
                                <div style="
                                    position: absolute;
                                    background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIxIiB2aWV3Qm94PSIwIDAgMzYwIDIxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMC43MzI3VjcuNTgxN0MwIDcuNTgxNyA0Ny41MzEyIC0xLjQ2OTMyIDEwNi43MzQgMS4yMzgyNEMxNjkuMzEyIDIuMzk4NjMgMTkxLjY3MiAxMy42NTA4IDI3MS45NjkgMTQuNTQ0QzMyNS44MjggMTQuNTQ0IDM2MCA3LjczNjQyIDM2MCA3LjczNjQyVjIwLjczMjdIMFoiIGZpbGw9IiMxRTIyMzMiLz4KPC9zdmc+Cg==);
                                    -webkit-animation: wave-reverse ${animationDuration} linear infinite;
                                    animation: wave-reverse ${animationDuration} linear infinite;
                                    -webkit-animation-delay: 0s;
                                    animation-delay: 0s;
                                    width: 100%;
                                    height: 21px;
                                    filter: brightness(0) saturate(100%) ${getBlendedFilter(
                                        waveColor,
                                        backgroundColor,
                                        theme,
                                    )}"
                                ></div>
                            </div>
                            <div style="
                                display: flex;
                                flex-direction: row;
                                background-color: #${waveColor};
                                border-radius: 0 0 ${borderRadius} ${borderRadius};
                                height: 100px;
                                font-size: 0.75rem;
                                padding: 5px 0 0 15px;
                                z-index: 2;
                            ">
                                <div style="
                                    margin-right: 15px;
                                    width: auto;
                                    height: auto;
                                ">
                                    ${
                                        activity.assets?.large_image || activity.application_id
                                            ? `
                                        <img src="data:image/png;base64,${await encodeBase64(
                                            await getLargeImage(activity.assets, activity.application_id),
                                        )}"
                                        style="
                                            width: 80px;
                                            height: 80px;
                                            border: solid 0.5px #${waveColor};
                                            border-radius: ${imgBorderRadius};
                                        "/>
                                    `
                                            : `
                                    <img src="data:image/png;base64,${await encodeBase64(
                                        `https://lanyard.kyrie25.me/assets/unknown.png`,
                                    )}" style="
                                        width: 70px;
                                        height: 70px;
                                        margin-top: 4px;
                                        filter: invert(100);
                                    "/>
                                `
                                    }
                                ${
                                    activity.assets?.small_image
                                        ? `
                                    <img src="data:image/png;base64,${await encodeBase64(
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
                                    )}"
                                    style="
                                        width: 30px;
                                        height: 30px;
                                        border-radius: ${imgStyle === "square" ? imgBorderRadius : "50%"};
                                        margin-left: -26px;
                                        margin-bottom: -8px;
                                    "/>`
                                        : ``
                                }
                                </div>
                                <div style="
                                    color: #999;
                                    margin-top: ${
                                        (activity.timestamps?.start || activity.timestamps?.end) &&
                                        hideTimestamp !== "true"
                                            ? "-6px"
                                            : "5px"
                                    };
                                    line-height: 1;
                                    width: 279px;
                                ">
                                    <p style="
                                        color: ${activityTheme === "dark" ? "#fff" : "#000"};
                                        font-size: 0.85rem;
                                        font-weight: bold;
                                        overflow: hidden;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        height: 15px;
                                        margin: 7px 0;
                                    ">${
                                        getPrefixActivityString(activity)
                                            ? `<span style="font-weight: normal;color: #ccc">
                                                ${getPrefixActivityString(activity) + " "}
                                            </span>`
                                            : ""
                                    }${getActivityIcon(activity, theme)}${escape(activity.name)}</p>
                                        ${
                                            activity.details?.trim()
                                                ? `
                                            <p style="
                                                color: ${
                                                    getPrefixActivityString(activity)
                                                        ? activityTheme === "dark"
                                                            ? "#fff"
                                                            : "#000"
                                                        : activityTheme === "dark"
                                                          ? "#ccc"
                                                          : "#777"
                                                };
                                                overflow: hidden;
                                                white-space: nowrap;
                                                font-size: 0.85rem;
                                                font-weight: ${getPrefixActivityString(activity) ? "bold" : "normal"};
                                                text-overflow: ellipsis;
                                                height: 15px;
                                                margin: 7px 0;
                                            ">${escape(activity.details)}</p>`
                                                : ``
                                        }
                                        ${
                                            activity.state?.trim()
                                                ? `
                                            <p style="
                                                color: ${activityTheme === "dark" ? "#ccc" : "#777"};
                                                overflow: hidden;
                                                white-space: nowrap;
                                                font-size: 0.85rem;
                                                text-overflow: ellipsis;
                                                height: 15px;
                                                margin: 7px 0;
                                            ">${escape(activity.state)}${
                                                activity.party?.size
                                                    ? ` (${activity.party.size[0]} of ${activity.party.size[1]})`
                                                    : ""
                                            }</p>`
                                                : ``
                                        }
                                        ${
                                            (activity.timestamps?.end || activity.timestamps?.start) &&
                                            hideTimestamp !== "true"
                                                ? activity.timestamps?.end &&
                                                  activity.timestamps?.start &&
                                                  activity.type !== 0
                                                    ? `
                                                        <div style="
                                                            width: calc(100% - 15px);
                                                            display: flex;
                                                            flex-direction: row;
                                                            justify-content: space-between;
                                                            align-items: center;
                                                            font-size: 0.85rem;
                                                        ">
                                                            <span style="
                                                                color: ${theme === "dark" ? "#fff" : "#000"};
                                                            ">
                                                                ${getFormatFromMs(Math.min(Date.now() - activity.timestamps.start, activity.timestamps.end - activity.timestamps.start) / 1000)}
                                                            </span>
                                                            <div style="
                                                                width: 100%;
                                                                height: 2px;
                                                                background-color: ${theme === "dark" ? "#333" : "#ccc"};
                                                                border-radius: 5px;
                                                                margin-left: 7px;
                                                                margin-right: 7px;
                                                                overflow: hidden;
                                                            ">
                                                                <div style="
                                                                    width: ${Math.min(
                                                                        100,
                                                                        ((Date.now() - activity.timestamps.start) /
                                                                            (activity.timestamps.end -
                                                                                activity.timestamps.start)) *
                                                                            100,
                                                                    )}%;
                                                                    height: 100%;
                                                                    background-color: ${theme === "dark" ? "#fff" : "#000"};
                                                                    border-radius: 5px;
                                                                "></div>
                                                            </div>
                                                            <span style="
                                                                color: ${theme === "dark" ? "#fff" : "#000"};
                                                            ">
                                                                ${getFormatFromMs((activity.timestamps.end - activity.timestamps.start) / 1000)}
                                                            </span>
                                                        </div>
                                                    `
                                                    : `
                                                        <p style="
                                                            color: ${activityTheme === "dark" ? "#ccc" : "#777"};
                                                            overflow: hidden;
                                                            white-space: nowrap;
                                                            font-size: 0.85rem;
                                                            text-overflow: ellipsis;
                                                            height: 15px;
                                                            margin: 7px 0;
                                                        ">${formatTime(activity.timestamps)}</p>`
                                                : ``
                                        }
                                </div>
                            </div>
                            `
                                : ``
                        }

            ${
                data.listening_to_spotify === true &&
                !activity &&
                data.activities[Object.keys(data.activities).length - 1].type === 2
                    ? `
                <div style="position: relative; width: 100%; height: 21px;${waveSpotifyColor === "transparent" ? "opacity: 0;" : ""}">
                    <div style="
                        position: absolute;
                        background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIxIiB2aWV3Qm94PSIwIDAgMzYwIDIxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMC43MzI3VjcuNTgxN0MwIDcuNTgxNyA0Ny41MzEyIC0xLjQ2OTMyIDEwNi43MzQgMS4yMzgyNEMxNjkuMzEyIDIuMzk4NjMgMTkxLjY3MiAxMy42NTA4IDI3MS45NjkgMTQuNTQ0QzMyNS44MjggMTQuNTQ0IDM2MCA3LjczNjQyIDM2MCA3LjczNjQyVjIwLjczMjdIMFoiIGZpbGw9IiMxRTIyMzMiLz4KPC9zdmc+Cg==);
                        -webkit-animation: wave ${animationDuration} linear infinite;
                        animation: wave ${animationDuration} linear infinite;
                        -webkit-animation-delay: 0s;
                        animation-delay: 0s;
                        width: 100%;
                        height: 21px;
                        z-index: 1;
                        filter: brightness(0) saturate(100%) ${getColorFilter(waveSpotifyColor)}"
                    ></div>
                    <div style="
                        position: absolute;
                        background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYwIiBoZWlnaHQ9IjIxIiB2aWV3Qm94PSIwIDAgMzYwIDIxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAyMC43MzI3VjcuNTgxN0MwIDcuNTgxNyA0Ny41MzEyIC0xLjQ2OTMyIDEwNi43MzQgMS4yMzgyNEMxNjkuMzEyIDIuMzk4NjMgMTkxLjY3MiAxMy42NTA4IDI3MS45NjkgMTQuNTQ0QzMyNS44MjggMTQuNTQ0IDM2MCA3LjczNjQyIDM2MCA3LjczNjQyVjIwLjczMjdIMFoiIGZpbGw9IiMxRTIyMzMiLz4KPC9zdmc+Cg==);
                        -webkit-animation: wave-reverse ${animationDuration} linear infinite;
                        animation: wave-reverse ${animationDuration} linear infinite;
                        -webkit-animation-delay: 0s;
                        animation-delay: 0s;
                        width: 100%;
                        height: 21px;
                        filter: brightness(0) saturate(100%) ${getBlendedFilter(
                            waveSpotifyColor,
                            backgroundColor,
                            theme,
                        )}"
                    ></div>
                </div>
                <div style="
                    display: flex;
                    flex-direction: row;
                    height: 100px;
                    font-size: 0.8rem;
                    padding: 5px 0 0 15px;
                    background-color: #${waveSpotifyColor};
                    border-radius: 0px 0 ${borderRadius} ${borderRadius};
                    z-index: 2;
                ">
                    <img src="${await (async () => {
                        const album = await encodeBase64(data.spotify.album_art_url);
                        if (album)
                            return `data:image/png;base64,${album}" style="border: solid 0.5px #${waveSpotifyColor};`;
                        return 'https://lanyard.kyrie25.me/assets/unknown.png" style="filter: invert(100);';
                    })()}
                        width: 80px;
                        height: 80px;
                        border-radius: ${imgBorderRadius};
                        margin-right: 15px;
                    "/>

                    <div style="
                        color: #999;
                        margin-top: ${hideTimestamp !== "true" ? "-10px" : "-3px"};
                        line-height: 1;
                        width: 279px;
                    ">
                        <p style="font-size: 0.75rem; font-weight: bold; color: ${
                            spotifyTheme === "dark" ? "#ddd8d8" : "#0d943d"
                        }; margin-bottom: ${hideTimestamp !== "true" ? "0px" : "15px"};">LISTENING TO SPOTIFY...</p>
                        <p style="
                            height: 15px;
                            color: ${spotifyTheme === "dark" ? "#fff" : "#000"};
                            font-weight: bold;
                            font-size: 0.85rem;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            margin: 7px 0;
                        ">${escape(data.spotify.song)}</p>
                        <p style="
                            margin: 7px 0;
                            height: 15px;
                            overflow: hidden;
                            white-space: nowrap;
                            font-size: 0.85rem;
                            text-overflow: ellipsis;
                            color: ${spotifyTheme === "dark" ? "#ccc" : "#777"};
                        ">By ${escape(data.spotify.artist)}</p>
                        ${
                            hideTimestamp !== "true"
                                ? `
                            <div style="
                                width: calc(100% - 15px);
                                display: flex;
                                flex-direction: row;
                                justify-content: space-between;
                                align-items: center;
                                font-size: 0.85rem;
                            ">
                                <span style="
                                    color: ${spotifyTheme === "dark" ? "#fff" : "#000"};
                                ">
                                    ${getFormatFromMs(Math.min(Date.now() - data.spotify.timestamps.start, data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000)}
                                </span>
                                <div style="
                                    width: 100%;
                                    height: 2px;
                                    background-color: ${spotifyTheme === "dark" ? "#333" : "#ccc"};
                                    border-radius: 5px;
                                    margin-left: 7px;
                                    margin-right: 7px;
                                    overflow: hidden;
                                ">
                                    <div style="
                                        width: ${Math.min(
                                            100,
                                            ((Date.now() - data.spotify.timestamps.start) /
                                                (data.spotify.timestamps.end - data.spotify.timestamps.start)) *
                                                100,
                                        )}%;
                                        height: 100%;
                                        background-color: ${spotifyTheme === "dark" ? "#fff" : "#000"};
                                        border-radius: 5px;
                                    "></div>
                                </div>
                                <span style="
                                    color: ${spotifyTheme === "dark" ? "#fff" : "#000"};
                                ">
                                    ${getFormatFromMs((data.spotify.timestamps.end - data.spotify.timestamps.start) / 1000)}
                                </span>
                            </div>
                        `
                                : ""
                        }
                    </div>
                </div>
            `
                    : ``
            }
            ${
                !activity && data.listening_to_spotify === false
                    ? `<div style="
                    display: flex;
                    flex-direction: row;
                    height: 150px;
                    justify-content: center;
                    align-items: center;
                ">
                    <p style="
                        font-style: italic;
                        font-size: 0.8rem;
                        color: ${theme === "dark" ? "#aaa" : "#444"};
                        height: auto;
                        text-align: center;
                    ">
                        ${escape(idleMessage)}
                    </p>
                </div>`
                    : ``
            }

                    </div>
                </foreignObject>
            </svg>
        `
            .trim()
            .replace(/\n/g, ""),
    );
};

export default renderCard;
