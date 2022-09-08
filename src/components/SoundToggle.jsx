import React, {Component} from "react";
import { css } from "@emotion/react";
import Toggle from "./radix/Toggle";
import {SystemContext} from "../Context";

const style = {

};

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
      <Toggle
        className={this.props.className}
        css={css`${style}`}
        defaultPressed={this.state.sound}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        {icon}
      </Toggle>
    );
  }

  toggleState(state) {
    this.setState({sound: state});
    // if (state) this.context.getSystem().play();
    // else this.context.getSystem().pause();
  }

}