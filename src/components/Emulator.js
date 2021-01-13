import React, { Component } from 'react';
import System from "../emu/System";
import { BrowserFSAsync } from "../emu/utils/Utils";

// Good example for resizing
// https://github.com/yavorsky/yavorsky.org/blob/master/components/canvas/polygon/Lines.js

// Browser filesystem configuration
// https://github.com/jvilk/BrowserFS
// TODO: Move this to a config file
const FS_CONFIG = {
  fs: "MountableFileSystem",
  options: {
    '/files': {
      fs: "HTTPRequest",
      options: {
        index: "/files/fs.json",
        baseUrl: "/files"
      }
    },
    '/tmp/screenOut': {
      fs: "LocalStorage"
    },
  }
};

export default class extends Component {
  canvasRef;

  constructor(props) {
    super(props);
    this.canvasRef= React.createRef();
    this.state = {
      config: props.config,
      width: 0,
      height: 0
    };
  }

  componentDidMount() {
    let promise = this.runEmulation();
  }

  componentWillUnmount() {

  }

  async runEmulation () {
    await BrowserFSAsync(FS_CONFIG);

    this.state.config.renderer.options = this.state.config.renderer.options || {};
    this.state.config.renderer.options.canvas = this.canvasRef.current;

    let system = new System(this.state.config);

    console.log("booting...");
    await system.boot();

    console.log("running...");
    system.run();

    // force a video scan at the end of the run
    system.videoCard.scan();
  };

  render() {
    const { config, width, height } = this.state;

    return (
      <canvas id={"screen"} ref={this.canvasRef}/>
    );
  }
};
