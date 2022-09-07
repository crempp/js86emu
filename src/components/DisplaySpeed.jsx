import React, {Component} from "react";
import { css } from "@emotion/react";
import {DebugContext, SystemContext} from "../Context";

const componentCss = {
  sdf: "asdf",
};

export default class DisplaySpeed extends Component {
  static contextType = SystemContext;

  constructor(props) {
    super(props);
    this.state = {
      speed: 0,
    }
  }

  componentDidMount() {
    this.stateInterval = setInterval(() => this.updateEmuState(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div css={css`${componentCss}`}>
        {this.state.speed.toFixed(2)} MHz
      </div>
    );
  }

  updateEmuState() {
    const emuState = this.context.getSystemState();
    this.setState({speed: emuState.speed});
  }
}