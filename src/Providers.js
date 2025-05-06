import React, {Component} from "react";
import {BrowserFSAsync} from "./emu/utils/Utils";
import FS_CONFIG from "./FileSystemConfig";
import IBM5150 from "./emu/config/IBM5150";
import System from "./emu/System";
import { EmulationContext } from "./Context";


export class EmulationProvider extends Component {
  updateTime = 1000;
  stateInterval = null;
  canvasRef = null;
  mounted = false;

  constructor(props) {
    super(props);
    this.state = {
      emuReady: false,
      system: null,
      systemState: {
        speed: null,
        mem8: null,
        memorySize: null,
        cycles: null,
        cpu: null,
      }
    };
  }

  getSystemConfig = () => {
    return this.state.system.config;
  };

  getSystem = () => {
    return this.state.system;
  };

  getSystemState = () => {
    return this.state.systemState;
  };

  setCanvas = (canvasRef) => {
    this.canvasRef = canvasRef;
  };

  async runEmulation (system) {
    system.config.renderer.options.canvas = this.canvasRef.current;

    system.debug.info("booting...", true);
    await system.boot();

    this.setState({
      emuReady: true,
      system: system,
    }, () => {
      this.stateInterval = setInterval(() => this.updateSystemState(), this.updateTime);
    });

    system.debug.info("running...", true);
    await system.run();
  }

  updateSystemState() {
    if (this.state.emuReady && this.state.system.cpu !== null) {
      this.setState({
        systemState: {
          speed: this.state.system.clock.hz,
          mem8: this.state.system.cpu.mem8,
          memorySize: this.state.system.config.memorySize,
          cycles: this.state.system.clock.cycles,
          cpu: this.state.system.cpu.getState(),
        }
      });
    }
  }

  async bootIfReady() {
    if (
      this.canvasRef !== null &&
      this.mounted
    ) {
      await BrowserFSAsync(FS_CONFIG);

      let config = IBM5150;
      let system = new System(config);

      this.runEmulation(system).then(() => {
        system.debug.info("Done", true);
      });

      // make global for debugging
      window.system = system;
    }
  }

  componentDidMount() {
    this.mounted = true;
    this.bootIfReady();
  }

  componentWillUnmount() {
    clearInterval(this.stateInterval);
  }

  render() {
    return (
      <EmulationContext.Provider value={{
        bootIfReady: this.bootIfReady,
        emuReady: this.state.emuReady,
        getSystem: this.getSystem,
        getSystemConfig: this.getSystemConfig,
        getSystemState: this.getSystemState,
        setCanvas: this.setCanvas,
      }}>
        {this.props.children}
      </EmulationContext.Provider>
    );
  }
}