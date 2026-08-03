import { parseCardParameters } from "@/features/card/config/schema";
import type { CardParameters } from "@/features/card/config/schema";
import { normalizeCardData } from "@/features/card/domain/model";
import CardSvg from "@/features/card/render/CardSvg";
import { loadCardAssets } from "@/features/card/server/load-assets";
import type { LanyardTypes } from "@/types/lanyard";
import { getFlags } from "@/utils/helpers";

type RenderToStaticMarkup = typeof import("react-dom/server").renderToStaticMarkup;

const renderToStaticMarkupPromise: Promise<RenderToStaticMarkup> = import("react-dom/server").then(
  module => module.renderToStaticMarkup,
);

export async function renderCard(body: LanyardTypes.Root, params: CardParameters): Promise<string> {
  const config = parseCardParameters(params, body.data);
  const normalized = normalizeCardData(body, config);
  const assets = await loadCardAssets(normalized, config, params);
  const flags = getFlags(normalized.data.discord_user.public_flags);

  if (
    normalized.data.discord_user.avatar?.includes("a_") ||
    normalized.userStatus?.emoji?.id ||
    normalized.data.discord_user.avatar_decoration_data ||
    assets.banner
  ) {
    flags.push("Nitro");
  }

  const renderToStaticMarkup = await renderToStaticMarkupPromise;
  return renderToStaticMarkup(<CardSvg context={{ ...normalized, config, assets, flags }} />);
}
