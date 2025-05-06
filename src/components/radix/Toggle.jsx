import React from "react";
import { styled } from "../../stitches.config";
import * as RadixToggle from "@radix-ui/react-toggle";

const Toggle = styled(RadixToggle.Root, {
  backgroundColor: "$controlBackground",
  color: "$fontColor",
  fontSize: "0.7rem",
  border: "1px solid #888888",
  borderRadius: "3px",
  padding: "3px",
  display: "flex",
  justifyContent: "center",
  alignContent: "center",
  flexDirection: "column",
  "&:hover": {
    backgroundColor: "$controlActive"
  },
  "&[data-state=on]": {
    backgroundColor: "$controlActive",
    color: "$fontColor",
  },
  "&:focus": {
    boxShadow: "0 0 0 1px #333333"
  },
});

export default Toggle;