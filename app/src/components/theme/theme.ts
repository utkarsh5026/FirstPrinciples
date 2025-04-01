export type ThemeOption = {
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  border: string;
  cardBg: string;
};

export const themes: ThemeOption[] = [
  {
    name: "Midnight Blue",
    background: "#0f1218",
    foreground: "#e2e8f0",
    primary: "#3b82f6",
    secondary: "#1e293b",
    border: "#1e293b",
    cardBg: "#171c24",
  },
  {
    name: "Deep Space",
    background: "#10101e",
    foreground: "#e2e8f0",
    primary: "#8b5cf6",
    secondary: "#1e1e2d",
    border: "#1e1e2d",
    cardBg: "#16162c",
  },
  {
    name: "Dark Charcoal",
    background: "#121212",
    foreground: "#e2e8f0",
    primary: "#64748b",
    secondary: "#1f1f1f",
    border: "#252525",
    cardBg: "#1a1a1a",
  },
  {
    name: "Obsidian",
    background: "#0f0f0f",
    foreground: "#d4d4d8",
    primary: "#22c55e",
    secondary: "#1c1c1c",
    border: "#262626",
    cardBg: "#171717",
  },
  {
    name: "Stealth",
    background: "#131313",
    foreground: "#e5e5e5",
    primary: "#60a5fa",
    secondary: "#202020",
    border: "#2a2a2a",
    cardBg: "#1c1c1c",
  },
  {
    name: "Deep Forest",
    background: "#0c130d",
    foreground: "#d5e8d8",
    primary: "#059669",
    secondary: "#152116",
    border: "#1c2c1f",
    cardBg: "#111914",
  },
  {
    name: "Simple Dark",
    background: "#121212",
    foreground: "#ffffff",
    primary: "#4f46e5",
    secondary: "#1e1e1e",
    border: "#303030",
    cardBg: "#1e1e1e",
  },
  {
    name: "Monochrome",
    background: "#0a0a0a",
    foreground: "#e0e0e0",
    primary: "#a3a3a3",
    secondary: "#1a1a1a",
    border: "#262626",
    cardBg: "#141414",
  },
];
