import React, {Component} from "react";
import { styled } from "../../stitches.config";

import { TabRoot, TabList, TabTrigger, TabContent } from "../radix/Tabs";
import RegisterTable from "./RegisterTable";
import FlagTable from "./FlagTable";
import Disassembly from "./Disassembly";
import CycleDisplay from "./CycleDisplay";
import OpcodeTable from "./OpcodeTable";
import MemoryVisualization from "./MemoryVisualization";
import {Label} from "../radix/Label";

const TabsContainer = styled("div", {
  height: "100%",
});

const ColumnTabContent = styled("div", {
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

export default class DebugTabs extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TabRoot defaultValue="memory">
        <TabList>
          <TabTrigger value="debug">Debug</TabTrigger>
          <TabTrigger value="memory">
            Memory
          </TabTrigger>
          <TabTrigger value="log">Log</TabTrigger>
          <TabTrigger value="config">Config</TabTrigger>
        </TabList>
        <TabsContainer>
          <TabContent value="debug">
            <ColumnTabContent>
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
          </TabContent>
          <TabContent value="memory">
            <ColumnTabContent>
              <Column>
                <MemoryVisualization />
              </Column>
            </ColumnTabContent>
          </TabContent>
          <TabContent value="log">
            <ColumnTabContent>
              LOG
            </ColumnTabContent>
          </TabContent>
          <TabContent value="config">
            <ColumnTabContent>
              <Label>Memory Size</Label> <input></input>
            </ColumnTabContent>
          </TabContent>
        </TabsContainer>
      </TabRoot>
    );
  }
}