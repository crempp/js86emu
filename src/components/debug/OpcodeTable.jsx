import React, {Component} from "react";
import { styled } from "@stitches/react";

const Table = styled("table", {
  fontSize: "0.9rem",
  width: "100%",
  border: "1px solid #888888",
  padding: "2px",
  marginBottom: "8px",
  borderSpacing: 0,
});

const Tr = styled("tr", {

});

const Label = styled("td", {
  fontWeight: "bold",
  color: "#aaaaaa",
});

const Data = styled("td", {

});

export default class OpcodeTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table>
        <tbody>
          <Tr>
            <Label>opcode:</Label><Data>01010001[0x51]</Data>
            <Label>address:</Label><Data>[NULL]</Data>
            <Label>prefix:</Label><Data>00000000[0x00]</Data>
          </Tr>
          <Tr>
            <Label>d:</Label><Data>0[0x00]</Data>
            <Label>w:</Label><Data>1[0x01]</Data>
            <Label>size:</Label><Data>w</Data>
          </Tr>
          <Tr>
            <Label>mod:</Label><Data>[NULL]</Data>
            <Label>reg:</Label><Data>[NULL]</Data>
            <Label>rm:</Label><Data>NULL</Data>
          </Tr>
        </tbody>
      </Table>
    );
  }
}