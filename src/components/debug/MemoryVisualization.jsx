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
    // TODO: The following causes an error where the server returns a different value
    //       then client.Convert to a functional component and try this again
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
    console.log("     newSliderPosition", newSliderPosition);

    // Update canvas position
    let viewMidpoint = this.state.viewWidth / 2;
    let dataPosition = -1 * Math.round(memoryPointer / this.state.imgDataHeight);
    let newCanvasPosition = dataPosition + viewMidpoint;
    console.log("    ", viewMidpoint, dataPosition, newCanvasPosition);

    // Set state
    this.setState({
      sliderPosition: [newSliderPosition],
      canvasPosition: newCanvasPosition,
      memoryPointer: memoryPointer,
    });

    this.canvasRef.current.draw(newCanvasPosition);
  }


  onSliderMove(value) {
    let newMemoryPointer = Math.round((value[0] / 100) * this.state.memorySize);
    console.log("[onSliderMove] ", value[0], newMemoryPointer);
    this.onMemoryPointerUpdate(newMemoryPointer);
  }

  getMemoryPointer() {
    return this.state.memoryPointer;
  }

  componentDidMount() {
    // console.log("MemoryVisualization::componentDidMount");

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
    // console.log("MemoryVisualization::componentDidUpdate");
    if (this.context.emuReady && !this.canvasRef.current.initialized) {
      console.log("update:init");
      this.canvasRef.current.updateMemory(this.state.mem8);
      this.onMemoryPointerUpdate(this.state.memoryPointer);
    }
  }

  // TODO: Make the actual methods arrow functions
  oMPU = (p) => this.onMemoryPointerUpdate(p);
  gMP = () => this.getMemoryPointer();
  oSM = (value) => this.onSliderMove(value);

  render() {
    // console.log("MemoryVisualization::render");
    return (
      <CanvasContainer>
        <MemoryCanvas
          ref={this.canvasRef}
          onMemoryPointerUpdate={this.oMPU}
          getMemoryPointer={this.gMP}
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
          onValueChange={this.oSM}
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
          memoryPointer={this.state.memoryPointer}
          memorySize={this.state.memorySize}
        />
      </CanvasContainer>
    );
  }
}