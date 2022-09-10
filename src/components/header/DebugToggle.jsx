import React, {Component} from "react";
import { styled } from "../../stitches.config";
import Toggle from "../radix/Toggle";
import {SystemContext} from "../../Context";

const StyledToggle = styled(Toggle, {
  fontSize: "0.7rem",
});

const Icon = styled("ion-icon", {
  pointerEvents: "none,"
});

export default class DebugToggle extends Component {
  static contextType = SystemContext;

  state = {
    debug: false,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <StyledToggle
        defaultPressed={this.state.debug}
        onPressedChange={(pressed) => this.toggleState(pressed)}
        title="Debug emulation"
      >
        <Icon name="bug-outline" />
      </StyledToggle>
    );
  }

  toggleState(state) {
    this.setState({debug: state});
    if (state) this.context.getSystem().debugOn();
    else this.context.getSystem().debugOff();
  }

}