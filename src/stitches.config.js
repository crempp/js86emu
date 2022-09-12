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
      background: "#454545",
      fontColor: "#e6e6e6",
      primary: "#e6e6e6",
      secondary: "#262626",
      controlBackground: "#353535",
      controlActive: "#666666",
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
    hSize: (value) => ({
      height: value
    }),
  }
});