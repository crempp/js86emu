import React, {Component} from "react";
import Toggle from "../radix/Toggle";
import {EmulationContext} from "../../Context";

export default class DebugToggle extends Component {
  static contextType = EmulationContext;

  state = {
    debug: false,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Toggle
        defaultPressed={this.state.debug}
        onPressedChange={(pressed) => this.toggleState(pressed)}
        title="Debug emulation"
      >
        <ion-icon name="bug-outline" />
      </Toggle>
    );
  }

  toggleState(state) {
    this.setState({debug: state});
    if (state) this.context.getSystem().debugOn();
    else this.context.getSystem().debugOff();
  }

}