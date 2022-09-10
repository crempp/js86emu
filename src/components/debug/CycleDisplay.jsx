import React, {Component} from "react";
import { styled } from "../../stitches.config";

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
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Display>
        <div>
          <Label>cycle</Label><Data>9335772</Data>
        </div>
        <div>
          <Label>CS:IP:</Label><Data>0xF000:0xE6B3</Data>
        </div>
      </Display>
    );
  }
}