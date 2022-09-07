import React, {Component} from "react";
import { css } from "@emotion/react";
import Toggle from "./radix/Toggle";
import {SystemContext} from "../Context";

const style = {

};

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
      <Toggle
        className={this.props.className}
        css={css`${style}`}
        defaultPressed={this.state.run}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        {icon}
      </Toggle>
    );
  }

  toggleState(state) {
    this.setState({run: state});
    if (state) this.context.getSystem().play();
    else this.context.getSystem().pause();
  }

}