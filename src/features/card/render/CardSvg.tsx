/* eslint-disable @next/next/no-img-element */

import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { ActivityPanel } from "@/features/card/render/ActivityPanel";
import { IdlePanel } from "@/features/card/render/IdlePanel";
import { ProfileHeader } from "@/features/card/render/ProfileHeader";
import { SpotifyPanel } from "@/features/card/render/SpotifyPanel";
import type { CardRenderContext } from "@/features/card/render/types";
type ForeignDivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { xmlns: string };

function ForeignDiv(props: ForeignDivProps) {
  return <div {...props}>{props.children}</div>;
}

function CardSvg({ context }: { context: CardRenderContext }) {
  const { dimensions, config, assets } = context;
  const {
    backgroundColor,
    theme,
    borderRadius,
    bannerFilter,
    hideProfile,
  } = config;
  const { svgHeight, divHeight } = dimensions;
  const { banner } = assets;

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
              src={`data:image/png;base64,${banner}`}
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
          {hideProfile ? null : <ProfileHeader context={context} />}
          <ActivityPanel context={context} />
          <SpotifyPanel context={context} />
          <IdlePanel context={context} />
        </ForeignDiv>
      </foreignObject>
    </svg>
  );

  return renderedSVG;
}

export default CardSvg;
