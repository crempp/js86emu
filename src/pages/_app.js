import React, {Component} from "react";
import { Global, css } from "@emotion/react";
import { BrowserFSAsync } from "../emu/utils/Utils";
import FS_CONFIG from "../FileSystemConfig";
import { SystemContext } from "../Context";
import System from "../emu/System";
import IBM5150 from "../emu/config/IBM5150";
// import CodeGolf from "../emu/config/Test-CodeGolf";


export default class App extends Component {
  state = {
    getSystemConfig: null,
    getSystemState: null,
    getSystem: null,
  };

  system = null;

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    await BrowserFSAsync(FS_CONFIG);

    let config = IBM5150;
    let system =  new System(config);
    this.system = system;

    this.setState({
      getSystemConfig: () => this.system.config,
      getSystemState: this.getSystemState,
      getSystem: () => this.system,
    });

    // make global for debugging
    window.system = system;
  }

  componentWillUnmount() {}

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Global styles={css`
        html, body {
          height: 100%;
          width: 100%;
          padding: 0;
          margin: 0;
          //background-color: #262626;
          background-color: #454545;
          font-family: 'Space Mono', monospace;
          //color: #dddddd;
          color: #e6e6e6;
          font-size: 1rem;
          line-height: 1.4;
        }
        #__next {
          height: 100%;
          width: 100%;
          padding: 0;
          margin: 0;
        }
      `}/>

        <SystemContext.Provider value={{
          getSystemConfig: this.state.getSystemConfig,
          getSystemState: this.state.getSystemState,
          getSystem: this.state.getSystem,
        }}>
          <Component {...pageProps} />
        </SystemContext.Provider>
      </>
    );
  }

  getSystemState = () => {
    return {
      speed: this.system.clock.hz,
    };
  };
}
