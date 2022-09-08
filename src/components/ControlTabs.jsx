import React, {Component} from "react";
import { css } from "@emotion/react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Label from "@radix-ui/react-label";

const style = {
  tab: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.7rem",
  }
};

export default class ControlTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Tabs.Root
        defaultValue="one"
        css={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Space Mono', monospace",
          fontStyle: "1rem",
        }}
        // value="one"
      >
        <Tabs.List
          css={{
            backgroundColor: "#808080",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
          }}
        >
          <Tabs.Trigger value="one" css={css`${style.tab}`}>
            Debug
          </Tabs.Trigger>
          <Tabs.Trigger value="two" css={css`${style.tab}`}>
            Log
          </Tabs.Trigger>
          <Tabs.Trigger value="three" css={css`${style.tab}`}>
            Config
          </Tabs.Trigger>
        </Tabs.List>
        <div css={{
          padding: 20,
          flexGrow: 1,
        }}>
          <Tabs.Content value="one">

          </Tabs.Content>
          <Tabs.Content value="two">Two content</Tabs.Content>
          <Tabs.Content value="three">
            <Label.Root>Memory Size</Label.Root> <input></input>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    )
  }
}