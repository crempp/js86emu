import React, {Component} from "react";
import { styled } from "../../stitches.config";
import {
  FLAG_AF_MASK, FLAG_CF_MASK,
  FLAG_DF_MASK,
  FLAG_IF_MASK,
  FLAG_OF_MASK, FLAG_PF_MASK,
  FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_ZF_MASK,
  regFlags,
  regIP
} from "../../emu/Constants";
import {EmulationContext} from "../../Context";

const Table = styled("table", {
  fontSize: "0.9rem",
  width: "100%",
  border: "1px solid #888888",
  padding: "2px",
  marginBottom: "8px",
  borderSpacing: 0,
});

const Th = styled("th", {
  paddingRight: "2px",
  paddingLeft: "2px;",
  textAlign: "center",
});

const Tr = styled("tr", {

});

const Td = styled("td", {
  paddingRight: "2px",
  paddingLeft: "2px;",
  textAlign: "center",
  "&[data-state=active]": {
    backgroundColor: "#4d6b53",
  }
});

export default class FlagTable extends Component {
  static contextType = EmulationContext;

  render() {
    let emulationState = this.context.getSystemState();

    let oF = "-";
    let dF = "-";
    let iF = "-";
    let tF = "-";
    let sF = "-";
    let zF = "-";
    let aF = "-";
    let pF = "-";
    let cF = "-";

    if (emulationState.cpu) {
      oF = ((emulationState.cpu.reg16[regFlags] & FLAG_OF_MASK) >> 11);
      dF = ((emulationState.cpu.reg16[regFlags] & FLAG_DF_MASK) >> 10);
      iF = ((emulationState.cpu.reg16[regFlags] & FLAG_IF_MASK) >> 9);
      tF = ((emulationState.cpu.reg16[regFlags] & FLAG_TF_MASK) >> 8);
      sF = ((emulationState.cpu.reg16[regFlags] & FLAG_SF_MASK) >> 7);
      zF = ((emulationState.cpu.reg16[regFlags] & FLAG_ZF_MASK) >> 6);
      aF = ((emulationState.cpu.reg16[regFlags] & FLAG_AF_MASK) >> 4);
      pF = ((emulationState.cpu.reg16[regFlags] & FLAG_PF_MASK) >> 2);
      cF = (emulationState.cpu.reg16[regFlags] & FLAG_CF_MASK);
    }

    return (
      <Table>
        <thead>
          <Tr>
            <Th>OF</Th>
            <Th>DF</Th>
            <Th>IF</Th>
            <Th>TF</Th>
            <Th>SF</Th>
            <Th>ZF</Th>
            <Th>AF</Th>
            <Th>PF</Th>
            <Th>CF</Th>
          </Tr>
        </thead>
        <tbody>
          <Tr>
            <Td>{oF}</Td>
            <Td>{dF}</Td>
            <Td>{iF}</Td>
            <Td>{tF}</Td>
            <Td>{sF}</Td>
            <Td>{zF}</Td>
            <Td>{aF}</Td>
            <Td>{pF}</Td>
            <Td>{cF}</Td>
          </Tr>
        </tbody>
      </Table>
    );

  }
}