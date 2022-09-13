import React, {Component, useEffect} from "react";
import { styled } from "../../stitches.config";
import MemoryCanvas from "./MemoryCanvas";
import {hexString32} from "../../emu/utils/Debug";
import {SliderRange, SliderRoot, SliderThumb, SliderTrack} from "../radix/Slider";
import {SystemContext} from "../../Context";

// TODO: load data at actual 0 point

const CanvasContainer = styled("div", {
  width: "100%",
  position: "relative",
});

const Line = styled("div", {
  width: "3px",
  backgroundColor: "rgb(5,5,5,0.5)",
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

    let windowWidth = 1000;
    // The following causes an error where the server returns a different value
    // then client.
    // TODO: Convert to a functional component and try this again
    // if (typeof window !== "undefined") {
    //   windowWidth = window.innerWidth;
    // }

    // Some of these should come from context
    let memorySize = 0x100000; // (1048576)
    let viewHeight = 64;

    this.state = {
      memorySize: memorySize,
      imgDataWidth: memorySize / viewHeight,
      imgDataHeight: viewHeight,
      viewWidth: windowWidth,
      viewHeight: viewHeight,
      canvasScrollScale: 1,
      canvasMidpoint: 1000/2,

      memoryPointer: 0,
      sliderPosition: [0],
      canvasPosition: 0,
    };
  }

  onMemoryPointerUpdate(memoryPointer) {
    console.log("onMemoryPointerUpdate", memoryPointer);
    // Update slider position
    let newSliderPosition = Math.round((memoryPointer / this.state.memorySize) * 100);

    // Update canvas position
    let viewMidpoint = Math.round(this.state.viewWidth / 2);
    let dataPosition = this.state.memoryPointer / this.state.imgDataHeight;
    let newCanvasPosition = dataPosition + viewMidpoint;

    // Set state
    this.setState({
      sliderPosition: [newSliderPosition],
      canvasPosition: newCanvasPosition,
      memoryPointer: memoryPointer,
    });

    this.canvasRef.current.draw(newCanvasPosition);
  }


  // onSliderMove(value) {
  //   let canvasPosition = this.slider2CanvasPos(value);
  //   this.setState({
  //     canvasPosition: canvasPosition,
  //     sliderPos: [value],
  //   });
  //
  //   console.log("[onSliderMove] newCanvas: ", canvasPosition, " newSlider: ", value);
  // }

  // canvas2SliderPos(value) {
  //   return -1 * Math.floor( (value / this.state.imageWidth) * 100);
  //   // 1048576 -200
  // }

  // slider2CanvasPos(value) {
  //   return -1 * Math.floor(this.state.memSize / 100 * value);
  // }

  getMemoryPointer() {
    return this.state.memoryPointer;
  }

  componentDidMount() {
    console.log("MemoryVisualization::componentDidMount");

    // TODO: Debugging, replace with real memory
    let mem8 = new Uint8Array(this.state.memorySize);
    for (let i = 0; i<this.state.memorySize; i++) {
      mem8[i] = Math.random() * 255;
    }
    // this.canvasRef.current.updateMemory(mem8);

    this.setState({mem8: mem8});

    if (this.context.emuReady && !this.canvasRef.current.initialized) {
      console.log("mount:init");
      this.canvasRef.current.updateMemory(mem8);
      this.onMemoryPointerUpdate(this.state.memoryPointer);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("MemoryVisualization::componentDidUpdate");
    if (this.context.emuReady && !this.canvasRef.current.initialized) {
      console.log("update:init");
      this.canvasRef.current.updateMemory(this.state.mem8);
      this.onMemoryPointerUpdate(this.state.memoryPointer);
    }
  }

  // TODO: Make the actual methods arrow functions
  oMPU = (p) => this.onMemoryPointerUpdate(p);
  gMP = () => this.getMemoryPointer();

  render() {
    // console.log("MemoryVisualization::render");
    return (
      <CanvasContainer>
        <MemoryCanvas
          ref={this.canvasRef}
          onMemoryPointerUpdate={this.oMPU}
          getMemoryPointer={this.gMP}
          imgDataWidth={this.state.imgDataWidth}
          imgDataHeight={this.state.imgDataHeight}
          viewWidth={this.state.viewWidth}
          viewHeight={this.state.viewHeight}
        />
        <Line css={{ hSize: this.viewHeight }}/>
        <Marker>
          {/*{hexString32(this.state.canvasPosition * this.viewHeight * -1)}*/}
          {this.state.memoryPointer}
        </Marker>
        <SliderRoot
          // ref={this.sliderRef}
          value={this.state.sliderPosition}
          max={100}
          step={1}
          aria-label="memoryPointer"
          // onValueChange={(value) => this.onSliderMove(value)}
        >
          <SliderTrack>
            <SliderRange />
          </SliderTrack>
          <SliderThumb />
        </SliderRoot>
      </CanvasContainer>
    );
  }
}