import React, {Component} from "react";
import { styled } from "../../stitches.config";
import MemoryCanvas from "./MemoryCanvas";
import {hexString32} from "../../emu/utils/Debug";
import {SliderRange, SliderRoot, SliderThumb, SliderTrack} from "../radix/Slider";
import {SystemContext} from "../../Context";
import MemoryTable from "./MemoryTable";


const CanvasContainer = styled("div", {
  width: "100%",
  position: "relative",
});

const Line = styled("div", {
  width: "3px",
  backgroundColor: "rgb(200,200,200,0.5)",
  position: "absolute",
  top: 0,
  left: "50%",
});

const Marker = styled("div", {
  justifyContent: "center",
  display: "flex",
});

export default class MemoryVisualization extends Component {
  static contextType = SystemContext;

  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.initialized = false;

    // TODO: The following causes an error where the server returns a different value
    //       then client.Convert to a functional component and try this again
    // if (typeof window !== "undefined") {
    //   windowWidth = window.innerWidth;
    // }

    let windowWidth = 1000;
    this.viewHeight = 64;

    this.state = {
      mem8: null,
      memorySize: 0,
      imgDataWidth: 0,
      imgDataHeight: this.viewHeight,
      viewWidth: windowWidth,
      viewHeight: this.viewHeight,
      canvasScrollScale: 1,
      canvasMidpoint: 1000/2,

      memoryPointer: 0,
      sliderPosition: [0],
      canvasPosition: 0,
    };
  }

  onMemoryPointerUpdate = (memoryPointer) => {
    // Update slider position
    let newSliderPosition = Math.round((memoryPointer / this.state.memorySize) * 100);

    // Update canvas position
    let viewMidpoint = this.state.viewWidth / 2;
    let dataPosition = -1 * Math.round(memoryPointer / this.state.imgDataHeight);
    let newCanvasPosition = dataPosition + viewMidpoint;

    // Set state
    this.setState({
      sliderPosition: [newSliderPosition],
      canvasPosition: newCanvasPosition,
      memoryPointer: memoryPointer,
    });

    this.canvasRef.current.draw(newCanvasPosition);
  };

  onSliderMove = (value) => {
    let newMemoryPointer = Math.round((value[0] / 100) * this.state.memorySize);
    this.onMemoryPointerUpdate(newMemoryPointer);
  };

  getMemoryPointer = () => {
    return this.state.memoryPointer;
  };


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.initialized && !this.canvasRef.current.initialized && this.context.emuReady) {
      this.init();
    }
    else if (this.initialized && this.context.emuReady) {
      // Since MemoryCanvas does not listen to any state (to avoid redrawing
      // the canvas) we must tell MemoryCanvas there was an update and to draw
      // the new memory data.
      let sysState = this.context.getSystemState();
      this.canvasRef.current.updateMemory(sysState.mem8);
      this.canvasRef.current.draw(this.state.canvasPosition);
    }
  }

  init() {
    this.initialized = true;
    let sysState = this.context.getSystemState();
    this.setState({
      mem8: sysState.mem8,
      memorySize: sysState.memorySize,
      imgDataWidth: sysState.memorySize / this.viewHeight,
    }, () => {
      this.canvasRef.current.updateMemory(sysState.mem8);
      this.onMemoryPointerUpdate(this.state.memoryPointer);
    });
  }

  render() {
    return (
      <CanvasContainer>
        <MemoryCanvas
          ref={this.canvasRef}
          onMemoryPointerUpdate={this.onMemoryPointerUpdate}
          getMemoryPointer={this.getMemoryPointer}
          memorySize={this.state.memorySize}
          imgDataWidth={this.state.imgDataWidth}
          imgDataHeight={this.state.imgDataHeight}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
        />

        <Line css={{ hSize: this.state.viewHeight }}/>

        <SliderRoot
          value={this.state.sliderPosition}
          max={100}
          step={1}
          aria-label="memoryPointer"
          onValueChange={this.onSliderMove}
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </SliderRoot>

        <Marker>
          {hexString32(this.state.memoryPointer)}
        </Marker>

        <MemoryTable
          mem8={this.state.mem8}
          onMemoryPointerUpdate={this.onMemoryPointerUpdate}
          memoryPointer={this.state.memoryPointer}
          memorySize={this.state.memorySize}
        />
      </CanvasContainer>
    );
  }
}