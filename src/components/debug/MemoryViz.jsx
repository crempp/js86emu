import React, {Component} from "react";
import { styled } from "../../stitches.config";
import MemoryVizCanvas from "./MemoryVizCanvas";
import {hexString32} from "../../emu/utils/Debug";
import {SliderRange, SliderRoot, SliderThumb, SliderTrack} from "../radix/Slider";

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

export default class MemoryViz extends Component {
  constructor(props) {
    super(props);

    this.scrollScale = 1;
    this.canvasWidth = 1000; // px
    this.viewHeight = 64;


    let config = {
      memorySize: 0,
      imgDataWidth: 0,
      imgDataHeight: 0,
      viewWidth: 0,
      viewHeight: 0,
      memoryPosition: 0,
    };

    this.state = {
      memSize: 0x100000, // TODO: get this from actual mem size
      imageWidth: 0x100000 / this.viewHeight, // TODO: get this from actual mem size
      canvasPosition: 0,
      sliderPos: [0],

      memoryPosition: 0,
    };
  }

  onCanvasDrag(canvasPosition) {
    let newSliderPos = this.canvas2SliderPos(canvasPosition);

    let newMemPos = 0;

    this.setState({
      canvasPosition: canvasPosition,
      sliderPos: [newSliderPos]

    });

    console.log("[onCanvasDrag] newCanvas: ", canvasPosition, " newSlider: ", newSliderPos);
  }

  onSliderMove(value) {
    let canvasPosition = this.slider2CanvasPos(value);
    this.setState({
      canvasPosition: canvasPosition,
      sliderPos: [value],
    });

    console.log("[onSliderMove] newCanvas: ", canvasPosition, " newSlider: ", value);
  }

  canvas2SliderPos(value) {
    return -1 * Math.floor( (value / this.state.imageWidth) * 100);
    // 1048576 -200
  }

  slider2CanvasPos(value) {
    return -1 * Math.floor(this.state.memSize / 100 * value);
  }

  render() {
    return (
      <CanvasContainer>
        <MemoryVizCanvas
          onMove={(p) => this.onCanvasDrag(p)}
          scrollScale={this.scrollScale}
          canvasWidth={this.canvasWidth}
          viewHeight={this.viewHeight}
          imageWidth={this.state.imageWidth}
        />
        <Line css={{ hSize: this.viewHeight }}/>
        <Marker>
          {/*{hexString32(this.state.canvasPosition * this.viewHeight * -1)}*/}
          {this.state.canvasPosition * this.viewHeight * -1}
        </Marker>
        <SliderRoot
          // ref={this.sliderRef}
          value={this.state.sliderPos}
          max={100}
          step={1}
          aria-label="MemoryPosition"
          onValueChange={(value) => this.onSliderMove(value)}
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