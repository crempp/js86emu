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
  constructor(props) {
    super(props);
  }

  render() {
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
            <Td>0</Td>
            <Td>0</Td>
            <Td data-state={"active"}>1</Td>
            <Td>0</Td>
            <Td>0</Td>
            <Td data-state={"active"}>1</Td>
            <Td>0</Td>
            <Td data-state={"active"}>1</Td>
            <Td>0</Td>
          </Tr>
        </tbody>
      </Table>
    );

  }
}