export const KanchaColors = {
  red: "#C8102E",
  redDark: "#970D25",
  redSoft: "#FDE8EC",
  white: "#FFFFFF",
  cream: "#F7F4EF",
  ink: "#141414",
  text: "#262626",
  muted: "#7A7A7A",
  line: "#E5DED6",
  card: "#FFFDFC",
  panel: "#1E1E1E",
  green: "#1F7A5A",
  greenSoft: "#E6F4EE",
  shadow: "rgba(103, 18, 31, 0.14)",
  amber: "#C8900A",
  amberBg: "#FFF8E7",
} as const;

const Colors = {
  light: {
    text: KanchaColors.text,
    background: KanchaColors.cream,
    tint: KanchaColors.red,
    tabIconDefault: "#B8B1AA",
    tabIconSelected: KanchaColors.red,
  },
};

export default Colors;
