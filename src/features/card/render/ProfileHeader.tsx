/* eslint-disable @next/next/no-img-element */

import { Badges } from "#/public/assets/badges/BadgesEncoded";
import { DisplayNameStyleEffectID } from "@/features/card/domain/constants";
import type { CardRenderContext } from "@/features/card/render/types";
import { getDisplayNameStyleClassname, getDisplayNameStyleEffectVars } from "@/utils/helpers";

export function ProfileHeader({ context }: { context: CardRenderContext }) {
  const { data, userStatus, avatarBorderColor, config, assets, flags } = context;
  const {
    backgroundColor,
    theme,
    borderRadius,
    gradient,
    imgStyle,
    imgBorderRadius,
    statusRadius,
    clanBackgroundColor,
    hideStatus,
    hideBadges,
    hideActivity,
    hideDecoration,
    hideDiscrim,
    showDisplayName,
    forceGradient,
    hideClan,
  } = config;
  const { avatar, clanBadge, avatarDecoration, nameplateBg, nameplateAsset } = assets;

  return (
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
      <div style={{ display: "flex", position: "relative", flexDirection: "row", height: "80px", width: "80px", zIndex: 2 }}>
        {hideDecoration || !data.discord_user.avatar_decoration_data ? null : (
          <img
            src={`data:image/png;base64,${avatarDecoration}`}
            alt="User Avatar Decoration"
            style={{ position: "absolute", height: "60px", width: "60px", top: "10px", left: "10px", zIndex: 1 }}
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
          <svg xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", zIndex: 9999 }}>
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
      <div style={{ height: "80px", width: "260px", zIndex: 2 }}>
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
            <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
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
                    {data.discord_user.display_name_styles.effect_id === DisplayNameStyleEffectID.NEON ? (
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
                  <span style={{ color: theme === "dark" ? "#ccc" : "#666", fontWeight: "lighter" }}>
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
                  <p style={{ marginBottom: "1.1rem" }}>{data.discord_user.clan.tag}</p>
                </span>
              )}
            </div>
            {hideBadges ? null : (
              <div style={{ display: "flex" }}>
                {flags.map(flag => (
                  <img
                    key={flag}
                    alt={flag}
                    src={`data:image/png;base64,${Badges[flag]}`}
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
            {assets.statusEmoji ? (
              <img
                src={`data:image/png;base64,${assets.statusEmoji}`}
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
  );
}
