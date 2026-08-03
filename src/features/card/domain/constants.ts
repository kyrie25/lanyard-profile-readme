export enum DisplayNameStyleEffectID {
  UNKNOWN,
  SOLID,
  GRADIENT,
  NEON,
  TOON,
  POP,
  GLOW,
}

export const NAMEPLATES = {
  crimson: { darkBackground: "#900007", lightBackground: "#E7040F", name: "Crimson" },
  berry: { darkBackground: "#893A99", lightBackground: "#B11FCF", name: "Berry" },
  sky: { darkBackground: "#0080B7", lightBackground: "#56CCFF", name: "Sky" },
  teal: { darkBackground: "#086460", lightBackground: "#7DEED7", name: "Teal" },
  forest: { darkBackground: "#2D5401", lightBackground: "#6AA624", name: "Forest" },
  bubblegum: { darkBackground: "#DC3E97", lightBackground: "#F957B3", name: "BubbleGum" },
  violet: { darkBackground: "#730BC8", lightBackground: "#972FED", name: "Violet" },
  cobalt: { darkBackground: "#0131C2", lightBackground: "#4278FF", name: "Cobalt" },
  clover: { darkBackground: "#047B20", lightBackground: "#63CD5A", name: "Clover" },
  lemon: { darkBackground: "#F6CD12", lightBackground: "#FED400", name: "Lemon" },
  white: { darkBackground: "#FFFFFF", lightBackground: "#FFFFFF", name: "White" },
} as const;

export type NameplatePalette = keyof typeof NAMEPLATES;
