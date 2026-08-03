import { CARD_PARAMETER_INFO } from "@/features/card/config/schema";
import type { CardParameterKey, ConfiguratorOptions } from "@/features/card/config/schema";

export function buildCardUrl(origin: string, userId: string, options: ConfiguratorOptions): string {
  const parameters = (Object.keys(options) as CardParameterKey[])
    .filter(key => options[key] !== undefined && options[key] !== null && options[key] !== "")
    .filter(key => {
      const definition = CARD_PARAMETER_INFO.find(item => item.parameter === key);
      return !definition?.displayCondition || definition.displayCondition(options);
    })
    .map(key => `${key}=${encodeURIComponent(options[key]!)}`)
    .join("&");

  return `${origin}/api/${userId}${parameters ? `?${parameters}` : ""}`;
}
