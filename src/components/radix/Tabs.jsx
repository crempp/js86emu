import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { styled } from "@stitches/react";

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
  backgroundColor: "#cccccc",
  color: "#555555",
  fontSize: "0.7rem",
  marginRight: "8px",
  "&[data-state=active]": {
    backgroundColor: "#e8e8e8",
    color: "#000000",
  }
});

export const TabContent = styled(Tabs.Content, {

});
