import React, {Component} from "react";
import { styled } from "../../stitches.config";
import { EmulationContext } from "../../Context";

const Container = styled("div", {
  width: "84px",
  justifyContent: "right",
  fontSize: "0.7rem",
});

export default class DisplaySpeed extends Component {
  static contextType = EmulationContext;

  render() {
    let emulationState = this.context.getSystemState();
    let speed = emulationState.speed ? emulationState.speed : "-";
    return (
      <Container>
        {(speed / 1000).toFixed(2)} MHz
      </Container>
    );
  }
}