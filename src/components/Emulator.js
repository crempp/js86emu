import React, { Component } from "react";
import { SystemContext } from "../Context";

// Good example for resizing
// https://github.com/yavorsky/yavorsky.org/blob/master/components/canvas/polygon/Lines.js

export default class Emulator extends Component {
  canvasRef;

  static contextType = SystemContext;

  constructor(props) {
    super(props);
    this.canvasRef= React.createRef();
    this.state = {
      width: 0,
      height: 0
    };
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("componentDidUpdate", this.context);
    let promise = this.runEmulation();
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log("shouldComponentUpdate", nextProps);
    return true;
  }

  async runEmulation () {
    let system = this.context.getSystem();

    // TODO: Find a more graceful way of setting the canvas
    system.config.renderer.options.canvas = this.canvasRef.current;

    system.debug.info("booting...", true);
    await system.boot();

    system.debug.info("running...", true);
    await system.run();
  }

  render() {
    const { width, height } = this.state;

    return (
      <canvas id={"screen"} ref={this.canvasRef}/>
    );
  }
}