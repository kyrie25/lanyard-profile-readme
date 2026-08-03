import * as Icons from "react-icons/si";
import type { LanyardTypes } from "@/types/lanyard";

type Activity = LanyardTypes.Activity;

export function ActivityIcon({ activity, theme }: { activity: Activity | string; theme: string }) {
  const iconList = Object.keys(Icons);
  const icon =
    typeof activity === "string"
      ? activity
      : iconList.find(
          iconName =>
            iconName.replace("Si", "").toLowerCase() ===
            activity.name
              .replaceAll(" ", "")
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
              .toLowerCase(),
        );

  if (!icon || !(Icons as Record<string, React.ComponentType<any>>)[icon]) return null;

  const IconComponent = (Icons as Record<string, React.ComponentType<any>>)[icon];
  return (
    <IconComponent
      size={12}
      color={theme === "dark" ? "#fff" : "#000"}
      style={{ paddingLeft: 2, top: 1, position: "relative" }}
    />
  );
}
