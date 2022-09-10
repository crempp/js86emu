import React, {Component} from "react";
import { styled } from "@stitches/react";

const Container = styled("div", {
  backgroundColor: "blue",
  fontSize: "0.8rem",
  height: "100%",
  padding: "4px",
});

const Line = styled("div", {
  width: "100%",
  "&[data-state=current]": {
    backgroundColor: "cyan",
    color: "black",
  },
});

const MemAddr = styled("span", {
  display: "inline-block",
  width: "110px",
});

const MemData = styled("span", {
  display: "inline-block",
  width: "130px",
});

const Code = styled("span", {
  display: "inline-block",
  width: "170px",
});

export default class Disassembly extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Container>
        <Line ><MemAddr>[0x000FE6B3]</MemAddr><MemData>0x51</MemData><Code>push CX</Code></Line>
        <Line><MemAddr>[0x000FE6B4]</MemAddr><MemData>0x50 0x0F</MemData><Code>mov AX 0x01</Code></Line>
        <Line> <MemAddr>[0x000FE6B5]</MemAddr><MemData>0xE4 0x6B 0x01</MemData><Code>mov AX 0x01</Code></Line>
        <Line><MemAddr>[0x000FE6B6]</MemAddr><MemData>0x50</MemData><Code>mov AX 0x01</Code></Line>
        <Line ><MemAddr>[0x000FE6B3]</MemAddr><MemData>0x51</MemData><Code>push CX</Code></Line>
        <Line><MemAddr>[0x000FE6B4]</MemAddr><MemData>0x50 0x0F</MemData><Code>mov AX 0x01</Code></Line>
        <Line> <MemAddr>[0x000FE6B5]</MemAddr><MemData>0xE4 0x6B 0x01</MemData><Code>mov AX 0x01</Code></Line>
        <Line><MemAddr>[0x000FE6B6]</MemAddr><MemData>0x50</MemData><Code>mov AX 0x01</Code></Line>
        <Line ><MemAddr>[0x000FE6B3]</MemAddr><MemData>0x51</MemData><Code>push CX</Code></Line>
        <Line><MemAddr>[0x000FE6B4]</MemAddr><MemData>0x50 0x0F</MemData><Code>mov AX 0x01</Code></Line>
        <Line data-state={"current"}> <MemAddr>[0x000FE6B5]</MemAddr><MemData>0xE4 0x6B 0x01</MemData><Code>mov AX 0x01</Code></Line>
        <Line><MemAddr>[0x000FE6B6]</MemAddr><MemData>0x50</MemData><Code>mov AX 0x01</Code></Line>
      </Container>
    );
  }
}