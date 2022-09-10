import React, {Component} from "react";
import { styled } from "../../stitches.config";
import Toggle from "../radix/Toggle";
import {SystemContext} from "../../Context";

const StyledToggle = styled(Toggle, {
  fontSize: "0.7rem",
});

export default class RunToggle extends Component {
  static contextType = SystemContext;

  state = {
    run: true,
  };

  constructor(props) {
    super(props);
  }

  render() {
    let icon = (this.state.run) ? <ion-icon name="play-outline" /> :<ion-icon name="pause-outline" />;

    return (
      <StyledToggle
        defaultPressed={this.state.run}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        {icon}
      </StyledToggle>
    );
  }

  toggleState(state) {
    this.setState({run: state});
    if (state) this.context.getSystem().play();
    else this.context.getSystem().pause();
  }

}