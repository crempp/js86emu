import React, {Component} from "react";
import { styled } from "../../stitches.config";
import { EmulationContext } from "../../Context";
import {regCS, regIP} from "../../emu/Constants";
import {hexString16} from "../../emu/utils/Debug";

const Display = styled("div", {
  fontSize: "0.9rem",
  width: "100%",
  border: "1px solid #888888",
  padding: "2px",
  marginBottom: "8px",
  boxSizing: "border-box",
});

const Label = styled("span", {
  fontWeight: "bold",
  color: "#aaaaaa",
  width: "3.5rem",
  display: "inline-block",
});

const Data = styled("span", {});

export default class CycleDisplay extends Component {
  static contextType = EmulationContext;

  render() {
    let emulationState = this.context.getSystemState();
    let cycles = emulationState.cycles ? emulationState.cycles : "-";
    let cs = emulationState.cpu ? hexString16(emulationState.cpu.reg16[regCS]) : "-";
    let ip = emulationState.cpu ? hexString16(emulationState.cpu.reg16[regIP]) : "-";
    return (
      <Display>
        <div>
          <Label>cycle</Label><Data>{cycles}</Data>
        </div>
        <div>
          <Label>CS:IP:</Label><Data>{cs}:{ip}</Data>
        </div>
      </Display>
    );
  }
}