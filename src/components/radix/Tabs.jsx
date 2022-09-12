import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { styled } from "../../stitches.config";

export const TabRoot = styled(Tabs.Root, {
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

export const TabList = styled(Tabs.List, {
  backgroundColor: "#808080",
  paddingLeft: "0.5rem",
  paddingRight: "0.5rem",
});

export const TabTrigger = styled(Tabs.Trigger, {
  backgroundColor: "$controlBackground",
  color: "$fontColor",
  fontSize: "0.7rem",
  border: "1px solid #888888",
  borderRadius: "3px",
  padding: "3px",
  marginRight: "8px",
  "&:hover": {
    backgroundColor: "$controlActive"
  },
  "&[data-state=active]": {
    backgroundColor: "$controlActive",
    color: "#e6e6e6"
  },
  "&:focus": {
    boxShadow: "0 0 0 1px #333333"
  },
});

export const TabContent = styled(Tabs.Content, {
  height: "100%",
});
