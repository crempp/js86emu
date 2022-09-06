import React from "react";
import * as RadixToggle from "@radix-ui/react-toggle";

export default ({ children, ...props }) => (
  <RadixToggle.Root
    css={{
      backgroundColor: "#353535",
      color: "#e6e6e6",
      border: "1px solid #888888",
      borderRadius: "3px",
      padding: "3px",
      display: "flex",
      justifyContent: "center",
      alignContent: "center",
      flexDirection: "column",
      "&:hover": {
        backgroundColor: "#666666"
      },
      "&[data-state=on]": {
        backgroundColor: "#666666",
        color: "#e6e6e6"
      },
      "&:focus": {
        boxShadow: "0 0 0 1px #333333"
      },

    }}
    {...props}
  >
    {children}
  </RadixToggle.Root>
);