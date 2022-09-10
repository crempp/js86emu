import React, {Component} from "react";
import { styled } from "../../stitches.config";
import Toggle from "../radix/Toggle";
import {SystemContext} from "../../Context";

const StyledToggle = styled(Toggle, {
  fontSize: "0.7rem",
});

export default class SoundToggle extends Component {
  static contextType = SystemContext;

  state = {
    sound: true,
  };

  constructor(props) {
    super(props);
  }

  render() {
    let icon = (this.state.sound) ? <ion-icon name="volume-high-outline" /> :<ion-icon name="volume-mute-outline" />;

    return (
      <StyledToggle
        defaultPressed={this.state.sound}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        {icon}
      </StyledToggle>
    );
  }

  toggleState(state) {
    this.setState({sound: state});
    // if (state) this.context.getSystem().play();
    // else this.context.getSystem().pause();
  }

}