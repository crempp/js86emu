import React, {Component} from "react";
import { styled } from "../../stitches.config";
import {EmulationContext} from "../../Context";
import {binString8, hexString8} from "../../emu/utils/Debug";
import {b, u, v, w} from "../../emu/Constants";

const Table = styled("table", {
  fontSize: "0.9rem",
  width: "100%",
  border: "1px solid #888888",
  padding: "2px",
  marginBottom: "8px",
  borderSpacing: 0,
  tableLayout: "fixed",
});

const Tr = styled("tr", {

});

const Label = styled("td", {
  fontWeight: "bold",
  color: "#aaaaaa",
  width: "5.2em",
});

const Data = styled("td", {
  fontSize: "0.9em"
});

export default class OpcodeTable extends Component {
  static contextType = EmulationContext;

  render() {
    let emulationState = this.context.getSystemState();

    let opcodeBin = "-";
    let opcodeHex = "-";
    let addressBin = "-";
    let addressHex = "-";
    let prefixBin = "-";
    let prefixHex = "-";
    let d = "-";
    let w = "-";
    let size = "-";
    let modBin = "-";
    let modHex = "-";
    let regBin = "-";
    let regHex = "-";
    let rmBin = "-";
    let rmHex = "-";

    if (emulationState.cpu) {
      opcodeBin = binString8(emulationState.cpu.opcode.opcode_byte);
      opcodeHex = hexString8(emulationState.cpu.opcode.opcode_byte);
      if (emulationState.cpu.opcode.addressing_byte) {
        addressBin = binString8(emulationState.cpu.opcode.addressing_byte);
        addressHex = hexString8(emulationState.cpu.opcode.addressing_byte);
      }
      prefixBin = binString8(emulationState.cpu.opcode.prefix);
      prefixHex = hexString8(emulationState.cpu.opcode.prefix);
      d = emulationState.cpu.opcode.d;
      w = emulationState.cpu.opcode.w;
      if (emulationState.cpu.opcode.addrSize === b) size = "b";
      else if (emulationState.cpu.opcode.addrSize === w) size = "w";
      else if (emulationState.cpu.opcode.addrSize === v) size = "v";
      else if (emulationState.cpu.opcode.addrSize === u) size = "?";
      if (emulationState.cpu.opcode.mod) {
        modBin = binString8(emulationState.cpu.opcode.mod).slice(-2);
        modHex = hexString8(emulationState.cpu.opcode.mod);
      }
      if (emulationState.cpu.opcode.rm) {
        regBin = binString8(emulationState.cpu.opcode.rm).slice(-3);
        regHex = hexString8(emulationState.cpu.opcode.rm);
      }
      if (emulationState.cpu.opcode.reg) {
        rmBin = binString8(emulationState.cpu.opcode.reg).slice(-3);
        rmHex = hexString8(emulationState.cpu.opcode.reg);
      }
    }

    return (
      <Table>
        <tbody>
          <Tr>
            <Label>opcode:</Label><Data>{opcodeHex}</Data>
            <Label>address:</Label><Data>{addressHex}</Data>
            <Label>prefix:</Label><Data>{prefixHex}</Data>
          </Tr>
          <Tr>
            <Label>d:</Label><Data>{d}</Data>
            <Label>w:</Label><Data>{w}</Data>
            <Label>size:</Label><Data>{size}</Data>
          </Tr>
          <Tr>
            <Label>mod:</Label><Data>{modBin}[{modHex}]</Data>
            <Label>reg:</Label><Data>{regBin}[{regHex}]</Data>
            <Label>rm:</Label><Data>{rmBin}[{rmHex}]</Data>
          </Tr>
        </tbody>
      </Table>
    );
  }
}