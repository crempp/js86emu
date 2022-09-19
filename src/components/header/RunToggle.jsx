import React, {Component} from "react";
import Toggle from "../radix/Toggle";
import {EmulationContext} from "../../Context";

export default class RunToggle extends Component {
  static contextType = EmulationContext;

  constructor(props) {
    super(props);

    this.state = {
      run: true,
    };
  }

  toggleState(state) {
    this.setState({run: state});
    if (state) this.context.getSystem().play();
    else this.context.getSystem().pause();
  }

  render() {
    let icon = (this.state.run) ? <ion-icon name="play-outline" /> :<ion-icon name="pause-outline" />;

    return (
      <Toggle
        defaultPressed={this.state.run}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        {icon}
      </Toggle>
    );
  }
}