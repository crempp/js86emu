import React, {Component} from "react";
import {css, styled} from "../../stitches.config";
import {EmulationContext} from "../../Context";
import {hexString16, hexString8} from "../../emu/utils/Debug";
import {
  regAH,
  regAL,
  regAX,
  regBH,
  regBL, regBP,
  regBX,
  regCH,
  regCL, regCS,
  regCX,
  regDH, regDI,
  regDL, regDS,
  regDX, regES,
  regIP, regSI, regSP, regSS
} from "../../emu/Constants";

const Table = styled("table", {
  fontSize: "0.9rem",
  width: "100%",
  border: "1px solid #888888",
  paddingTop: "2px",
  paddingBottom: "2px",
  marginBottom: "8px",
  borderSpacing: 0,
});

const Tr = styled("tr", {

  td: {
    "&:nth-child(2)": {
      borderRight: "1px solid #888888",
    },
    "&:nth-child(6)": {
      borderRight: "3px double #888888",
    },
    "&:nth-child(8)": {
      borderRight: "3px double #888888",
    }
  }
});

const Label = styled("td", {
  paddingLeft: "4px",
  paddingRight: "4px",
  fontWeight: "bold",
  color: "#aaaaaa",
});

const Data = styled("td", {
  paddingLeft: "4px",
  paddingRight: "4px",
});

export default class RegisterTable extends Component {
  static contextType = EmulationContext;

  render() {
    let emulationState = this.context.getSystemState();

    let ip = "-";
    let ax = "-";
    let bx = "-";
    let cx = "-";
    let dx = "-";

    let al = "-";
    let ah = "-";
    let bl = "-";
    let bh = "-";
    let cl = "-";
    let ch = "-";
    let dl = "-";
    let dh = "-";

    let cs = "-";
    let ds = "-";
    let es = "-";
    let ss = "-";

    let si = "-";
    let di = "-";
    let bp = "-";
    let sp = "-";

    if (emulationState.cpu) {
      ip = hexString16(emulationState.cpu.reg16[regIP]);
      ax = hexString16(emulationState.cpu.reg16[regAX]);
      bx = hexString16(emulationState.cpu.reg16[regBX]);
      cx = hexString16(emulationState.cpu.reg16[regCX]);
      dx = hexString16(emulationState.cpu.reg16[regDX]);

      al = hexString8(emulationState.cpu.reg8[regAL]);
      ah = hexString8(emulationState.cpu.reg8[regAH]);
      bl = hexString8(emulationState.cpu.reg8[regBL]);
      bh = hexString8(emulationState.cpu.reg8[regBH]);
      cl = hexString8(emulationState.cpu.reg8[regCL]);
      ch = hexString8(emulationState.cpu.reg8[regCH]);
      dl = hexString8(emulationState.cpu.reg8[regDL]);
      dh = hexString8(emulationState.cpu.reg8[regDH]);

      cs = hexString16(emulationState.cpu.reg16[regCS]);
      ds = hexString16(emulationState.cpu.reg16[regDS]);
      es = hexString16(emulationState.cpu.reg16[regES]);
      ss = hexString16(emulationState.cpu.reg16[regSS]);

      si = hexString16(emulationState.cpu.reg16[regSI]);
      di = hexString16(emulationState.cpu.reg16[regDI]);
      bp = hexString16(emulationState.cpu.reg16[regBP]);
      sp = hexString16(emulationState.cpu.reg16[regSP]);
    }

    return (
      <Table>
        <tbody>
          <Tr>
            <Label>IP: </Label><Data>{ip}</Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
          </Tr>
          <Tr>
            <Label>AX: </Label><Data>{ax}</Data>
            <Label>AH: </Label><Data>{ah}</Data>
            <Label>AL: </Label><Data>{al}</Data>
            <Label>CS: </Label><Data>{cs}</Data>
            <Label>SI: </Label><Data>{si}</Data>
          </Tr>
          <Tr>
            <Label>BX: </Label><Data>{bx}</Data>
            <Label>BH: </Label><Data>{bh}</Data>
            <Label>BL: </Label><Data>{bl}</Data>
            <Label>DS: </Label><Data>{ds}</Data>
            <Label>DI: </Label><Data>{di}</Data>
          </Tr>
          <Tr>
            <Label>CX: </Label><Data>{cx}</Data>
            <Label>CH: </Label><Data>{ch}</Data>
            <Label>CL: </Label><Data>{cl}</Data>
            <Label>ES: </Label><Data>{es}</Data>
            <Label>BP: </Label><Data>{bp}</Data>
          </Tr>
          <Tr>
            <Label>DX: </Label><Data>{dx}</Data>
            <Label>DH: </Label><Data>{dh}</Data>
            <Label>DL: </Label><Data>{dl}</Data>
            <Label>SS: </Label><Data>{ss}</Data>
            <Label>SP: </Label><Data>{sp}</Data>
          </Tr>

        </tbody>
      </Table>
    );
  }
}