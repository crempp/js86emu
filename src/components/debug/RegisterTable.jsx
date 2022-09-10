import React, {Component} from "react";
import { styled } from "../../stitches.config";

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
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table>
        <tbody>
          <Tr>
            <Label>IP: </Label><Data>0xE6B3</Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
            <Label></Label><Data></Data>
          </Tr>
          <Tr>
            <Label>AX: </Label><Data>0x0000</Data>
            <Label>AL: </Label><Data>0x00</Data>
            <Label>AH: </Label><Data>0x00</Data>
            <Label>CS: </Label><Data>0xF000</Data>
            <Label>SI: </Label><Data>0xFF53</Data>
          </Tr>
          <Tr>
            <Label>BX: </Label><Data>0x6000</Data>
            <Label>BL: </Label><Data>0x00</Data>
            <Label>BH: </Label><Data>0x60</Data>
            <Label>DS: </Label><Data>0x0040</Data>
            <Label>DI: </Label><Data>0x0080</Data>
          </Tr>
          <Tr>
            <Label>CX: </Label><Data>0xFFF3</Data>
            <Label>CL: </Label><Data>0xF3</Data>
            <Label>CH: </Label><Data>0xFF</Data>
            <Label>ES: </Label><Data>0x0000</Data>
            <Label>BP: </Label><Data>0x0000</Data>
          </Tr>
          <Tr>
            <Label>DX: </Label><Data>0x0004</Data>
            <Label>DL: </Label><Data>0x04</Data>
            <Label>DH: </Label><Data>0x00</Data>
            <Label>SS: </Label><Data>0x0030</Data>
            <Label>SP: </Label><Data>0x13EC</Data>
          </Tr>

        </tbody>
      </Table>
    );
  }
}