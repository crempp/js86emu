import React, { Component } from "react";
import {SystemContext} from "../Context";

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
    console.log(this.context);
    let promise = this.runEmulation();
  }

  async runEmulation () {
    // TODO: Find a more graceful way of setting the canvas
    this.context.system.config.renderer.options.canvas = this.canvasRef.current;

    this.context.system.debug.info("booting...", true);
    await this.context.system.boot();

    this.context.system.debug.info("running...", true);
    await this.context.system.run();
  }

  render() {
    const { width, height } = this.state;

    return (
      <canvas id={"screen"} ref={this.canvasRef}/>
    );
  }
}

// const withContext = (Component) => {
//   return (props) => {
//     return (<SystemContext.Consumer>
//       {(context) => (
//         <Component {...props} context={context}/>
//       )}
//     </SystemContext.Consumer>);
//   };
// };
//
// export default withContext(Emulator);