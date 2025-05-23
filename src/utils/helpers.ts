import type { renderToStaticMarkup as _renderToStaticMarkup } from "react-dom/server";

export let renderToStaticMarkup: typeof _renderToStaticMarkup;
import("react-dom/server").then(module => {
  renderToStaticMarkup = module.renderToStaticMarkup;
});

export const getFlags = (flag: number): string[] => {
  let flags: string[] = [];

  // In the order they appear on profiles
  if (flag & 1) flags.push("Discord_Employee"); // 1 << 0
  if (flag & 262144) flags.push("Discord_Certified_Moderator"); // 1 << 18
  if (flag & 2) flags.push("Partnered_Server_Owner"); // 1 << 1
  if (flag & 4) flags.push("HypeSquad_Events"); // 1 << 2
  if (flag & 64) flags.push("House_Bravery"); // 1 << 6
  if (flag & 128) flags.push("House_Brilliance"); // 1 << 7
  if (flag & 256) flags.push("House_Balance"); // 1 << 8
  if (flag & 8) flags.push("Bug_Hunter_Level_1"); // 1 << 3
  if (flag & 16384) flags.push("Bug_Hunter_Level_2"); // 1 << 14
  if (flag & 4194304) flags.push("Active_Developer"); // 1 << 22
  if (flag & 131072) flags.push("Early_Verified_Bot_Developer"); // 1 << 17
  if (flag & 512) flags.push("Early_Supporter"); // 1 << 9

  return flags;
};

export const nameplates = {
  crimson: {
    darkBackground: "#900007",
    lightBackground: "#E7040F",
    name: "Crimson",
  },
  berry: {
    darkBackground: "#893A99",
    lightBackground: "#B11FCF",
    name: "Berry",
  },
  sky: {
    darkBackground: "#0080B7",
    lightBackground: "#56CCFF",
    name: "Sky",
  },
  teal: {
    darkBackground: "#086460",
    lightBackground: "#7DEED7",
    name: "Teal",
  },
  forest: {
    darkBackground: "#2D5401",
    lightBackground: "#6AA624",
    name: "Forest",
  },
  bubblegum: {
    darkBackground: "#DC3E97",
    lightBackground: "#F957B3",
    name: "BubbleGum",
  },
  violet: {
    darkBackground: "#730BC8",
    lightBackground: "#972FED",
    name: "Violet",
  },
  cobalt: {
    darkBackground: "#0131C2",
    lightBackground: "#4278FF",
    name: "Cobalt",
  },
  clover: {
    darkBackground: "#047B20",
    lightBackground: "#63CD5A",
    name: "Clover",
  },
};
