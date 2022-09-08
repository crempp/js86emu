import React, {Component} from "react";
import { css } from "@emotion/react";
import {DebugContext, SystemContext} from "../Context";

const style = {
  width: "84px",
  justifyContent: "right",
};

export default class DisplaySpeed extends Component {
  static contextType = SystemContext;

  constructor(props) {
    super(props);
    this.state = {
      speed: 0,
    };
  }

  componentDidMount() {
    this.stateInterval = setInterval(() => this.updateEmuState(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.stateInterval);
  }

  render() {
    return (
      <div
        className={this.props.className}
        css={css`${style}`}
      >
        {(this.state.speed / 1000000).toFixed(2)} MHz
      </div>
    );
  }

  updateEmuState() {
    const emuState = this.context.getSystemState();
    this.setState({speed: emuState.speed});
  }
}