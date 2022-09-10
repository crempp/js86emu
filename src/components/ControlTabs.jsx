import React, {Component} from "react";
import { styled } from "@stitches/react";
import * as Label from "@radix-ui/react-label";
import { TabRoot, TabList, TabTrigger, TabContent } from "./radix/Tabs";
import RegisterTable from "./debug/RegisterTable";
import FlagTable from "./debug/FlagTable";
import Disassembly from "./debug/Disassembly";
import CycleDisplay from "./debug/CycleDisplay";
import OpcodeTable from "./debug/OpcodeTable";

const TabsContainer = styled("div", {
  height: "100%",
});

const ColumnTabContent = styled(TabContent, {
  display: "flex",
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "space-between",
  alignItems: "flex-start",
  height: "100%",
  width: "100%",
});

const Column = styled("div", {
  height: "100%",
  width: "100%",
});

export default class ControlTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabRoot defaultValue="debug">
        <TabList>
          <TabTrigger value="debug">Debug</TabTrigger>
          <TabTrigger value="memory">Memory</TabTrigger>
          <TabTrigger value="log">Log</TabTrigger>
          <TabTrigger value="config">Config</TabTrigger>
        </TabList>
        <TabsContainer>
          <ColumnTabContent value="debug">
            <Column>
              <CycleDisplay />
              <OpcodeTable />
              <RegisterTable />
              <FlagTable />
            </Column>
            <Column>
              <Disassembly />
            </Column>
          </ColumnTabContent>
          <ColumnTabContent value="memory">
            MEMORY
            {/*TODO: memory map with IP pointer*/}
          </ColumnTabContent>
          <ColumnTabContent value="log">
            LOG
          </ColumnTabContent>
          <ColumnTabContent value="config">
            <Label.Root>Memory Size</Label.Root> <input></input>
          </ColumnTabContent>
        </TabsContainer>
      </TabRoot>
    );
  }
}