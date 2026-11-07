/** Surface variants shared by Canvas models and the SVG fallback. */
const variants: Record<string, Record<string, string>> = {
  "keyboard-3": {
    "#a8c3a8": "#9bc8d8",
    "#6544dc": "#3b6f9f",
    "#dcf58c": "#c5e9f0",
    "#7c9a79": "#5f95a8",
    "#cbe1bd": "#c5e9f0",
    "#a3bf98": "#9bc8d8",
    "#7fa468": "#3b6f9f",
  },
  "monitor-3": {
    "#c9c0dc": "#a8cbdc",
    "#ada1c3": "#7c9daf",
    "#d9d1e8": "#c5e2f0",
    "#b7abc8": "#86b5cf",
    "#b5adc9": "#7c9daf",
    "#c2b6d9": "#86b5cf",
    "#e8dff5": "#c5e2f0",
    "#9c8eb5": "#527d9b",
  },
  "desk-3": {
    "#c9a882": "#8db9a7",
    "#f0d6b5": "#cbe9da",
    "#ad927d": "#6d9788",
    "#b69a83": "#8db9a7",
    "#dcb690": "#cbe9da",
    "#b58a65": "#8db9a7",
    "#b48962": "#6d9788",
  },
  "accessory-3": {
    "#d9b49a": "#90b8d5",
    "#e1aa8c": "#90b8d5",
    "#edc0a0": "#b2d1e5",
    "#f1c6a9": "#c5e2f0",
  },
  "background-3": {
    "#eee9dc": "#f1d8ca",
    "#dfd9c7": "#dbbea9",
    "#d7e8d3": "#eebc9c",
    "#faf3df": "#fff0d4",
    "#a8c5a0": "#c99687",
    "#7fa88b": "#ad7e82",
    "#c5d6ac": "#e6b38c",
    "#829e76": "#ad7e82",
  },
};

export function productColor(
  productId: string | undefined,
  color: string,
) {
  return (
    (productId && variants[productId]?.[color]) || color
  );
}
