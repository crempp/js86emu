import React, {Component} from "react";
import {styled} from "../../stitches.config";
import {SystemContext} from "../../Context";

const MemCanvas = styled("canvas", {
  width: "100%",
  cursor: "grab",
});

export default class MemoryVizCanvas extends Component {
  static contextType = SystemContext;

  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.scrollScale = this.props.scrollScale;
    this.canvasWidth = this.props.canvasWidth;
    this.viewHeight = this.props.viewHeight;

    this.dragging = false;
    this.pixels = null;
    this.canvasPosition = 0;
    this.memoryPosition = 0;

    this.state={
      memSize: 0x100000,  // TODO: get this from actual mem size
      mem8: null,
      imageWidth: this.props.imageWidth, // TODO: get this from actual mem size
      height: 64,
    };
  }

  mouseMove(evt){
    // If the mouse button is pressed
    if (evt.buttons === 1) {
      let dx = evt.movementX;
      if (dx === 0) return;

      // Begin dragging
      this.dragging = true;

      // Update the canvas position
      this.canvasPosition += (dx * this.scrollScale);

      // Update memory position
      this.memoryPosition = 0;

      // Clamp left edge
      // if (this.canvasPosition > 0) {
      //   this.canvasPosition = 0;
      //   return;
      // }
      // Clamp right edge
      // else if (this.canvasPosition < ((this.state.imageWidth*-1)+this.canvas.width)) {
      //   this.canvasPosition = ((this.state.imageWidth - this.canvasWidth) * -1);
      //   return;
      // }

      // Update image
      this.draw();

      // Let parent know we've updated the position
      this.props.onMove(this.canvasPosition);
    }
    // If we've stopped dragging change cursor back
    else if (evt.buttons === 0 && this.dragging) {
      this.dragging = false;
    }
  }

  setupData() {
    // Load random data
    let mem8 = new Uint8Array(this.state.memSize);
    for (let i = 0; i<this.state.memSize; i++) {
      mem8[i] = Math.random() * 255;
    }

    // const emuState = this.context.getSystemState();
    // let mem8 = new Uint8Array(emuState.mem8);
    // this.setState({mem8: mem8});

    this.mem2Img(mem8);
    this.draw();
  }

  mem2Img(data) {
    this.pixels = new Uint8ClampedArray(this.state.imageWidth * this.state.height * 4);
    for (let y = 0; y < this.state.height; y++) {
      for (let x = 0; x < this.state.imageWidth; x++) {
        const i = (y * this.state.imageWidth + x) * 4;
        const j = (y * this.state.imageWidth + x);
        const c = this.num2Color(data[j]);
        this.pixels[i  ] = c[0];   // red
        this.pixels[i+1] = c[1];   // green
        this.pixels[i+2] = c[2];   // blue
        this.pixels[i+3] = 255; // alpha
      }
    }
  }

  num2Color(num) {
    return [
      (num & 0b00000011) * 36,
      ((num & 0b00011100) >> 2) * 36,
      ((num & 0b11100000) >> 5) * 36
    ];
  }

  draw() {
    const imageData = new ImageData(this.pixels, this.state.imageWidth, this.state.height);
    this.ctx.fillStyle = "pink";
    this.ctx.rect(0, 0, this.canvasWidth, this.viewHeight);
    this.ctx.fill();
    this.ctx.putImageData(imageData, this.canvasPosition, 0);
  }

  componentDidMount() {
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext("2d");
    // When the emulator has loaded set up the visualization
    if (this.context.emuReady && this.state.mem8 === null) {
      this.setupData();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // When the emulator has loaded set up the visualization
    if (this.context.emuReady && this.state.mem8 === null) {
      this.setupData();
    }
  }

  render() {
    return (
      <MemCanvas
        ref={this.canvasRef}
        width={this.canvasWidth}
        height={this.state.height}
        onMouseMove={(evt) => this.mouseMove(evt)}
        css={{ hSize: this.viewHeight }}
      />
    );
  }
}