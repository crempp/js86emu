import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config
} = createStitches({
  theme: {
    colors: {
      primary: "IndianRed",
      secondary: "DarkSlateGray"
    },
    space: {
      1: "5px",
      2: "10px",
      3: "15px"
    }
  },
  media: {
    bp1: "(min-width: 376px)",
    bp2: "(min-width: 768px)",
    bp3: "(min-width: 1024px)"
  },
  utils: {
    columnGap: (gap) => ({
      flexDirection: "column",
      gap: `var(--space-${gap})`
    }),
    rowGap: (gap) => ({
      flexDirection: "row",
      gap: `var(--space-${gap})`
    })
  }
});