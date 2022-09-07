import React, {Component} from "react";
import { css } from "@emotion/react";
import Toggle from "./radix/Toggle";
import {SystemContext} from "../Context";

const style = {};

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
      <Toggle
        className={this.props.className}
        css={css`${style}`}
        defaultPressed={this.state.debug}
        onPressedChange={(pressed) => this.toggleState(pressed)}
      >
        <ion-icon name="bug-outline"></ion-icon>
      </Toggle>
    );
  }

  toggleState(state) {
    this.setState({debug: state});
    if (state) this.context.getSystem().debugOn();
    else this.context.getSystem().debugOff();
  }

}