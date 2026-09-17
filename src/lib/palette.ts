// Soft ink-and-paper friendly accents. The page stays black & white;
// the avatar color is the only splash of color each person brings.
export const AVATAR_COLORS = [
  "#F4B6C2", // pink
  "#C9B6E4", // lilac
  "#A8D5E2", // sky
  "#B8E0B0", // mint
  "#FFD59E", // apricot
  "#F7E48B", // butter
  "#F5A89A", // coral
  "#B5C7F2", // periwinkle
];

export const AUTHOR_COLOR = "#111111";

export function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
