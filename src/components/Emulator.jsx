import React, { Component } from "react";
import { styled } from "../stitches.config";
import { EmulationContext } from "../Context";

// Good example for resizing
// https://github.com/yavorsky/yavorsky.org/blob/master/components/canvas/polygon/Lines.js

const EmulatorCanvas = styled("canvas", {
  backgroundColor: "#000000",
  padding: "0",
});

export default class Emulator extends Component {
  static contextType = EmulationContext;

  constructor(props) {
    super(props);
    this.canvasRef= React.createRef();
  }

  componentDidMount() {
    this.context.setCanvas(this.canvasRef);
    this.context.bootIfReady();
  }

  render() {
    return (
      <EmulatorCanvas id={"screen"} ref={this.canvasRef} />
    );
  }
}