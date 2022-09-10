import React, {Component} from "react";
import { styled } from "../../stitches.config";
import { SystemContext } from "../../Context";

const Container = styled("div", {
  width: "84px",
  justifyContent: "right",
  fontSize: "0.7rem",
});

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
      <Container>
        {(this.state.speed / 1000000).toFixed(2)} MHz
      </Container>
    );
  }

  updateEmuState() {
    const emuState = this.context.getSystemState();
    this.setState({speed: emuState.speed});
  }
}