import * as RadixSlider from "@radix-ui/react-slider";
import {styled} from "../../stitches.config";

export const SliderRoot = styled(RadixSlider.Root, {
  position: "relative",
  display: "flex",
  alignItems: "center",
  userSelect: "none",
  touchAction: "none",
  width: "100%",

  "&[data-orientation='horizontal']": {
    height: 20,
  },

  "&[data-orientation='vertical']": {
    flexDirection: "column",
    width: 20,
    height: 100,
  },
});

export const SliderTrack = styled(RadixSlider.Track, {
  backgroundColor: "$controlBackground",
  height: "10px !important", // TODO: Figrue out how to fix this.
  borderRadius: "0",
  width: "100%",
  position: "relative",
  flexGrow: 1,
  "&[data-orientation='horizontal']": { height: 3 },
  "&[data-orientation='vertical']": { width: 3 },
});

export const SliderRange = styled(RadixSlider.Range, {
  position: "absolute",
  height: "100%",
});

export const SliderThumb = styled(RadixSlider.Thumb, {
  all: "unset",
  display: "block",
  width: 10,
  height: 10,
  backgroundColor: "black",
  borderRadius: 5,
  "&:hover": { backgroundColor: "white" },
  "&:focus": { boxShadow: "0 0 0 2px black" },
});
