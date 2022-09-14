import React, {PureComponent} from "react";
import {styled} from "../../stitches.config";

const MemCanvas = styled("canvas", {
  width: "100%",
  cursor: "grab",
});

export default class MemoryCanvas extends PureComponent {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.dragging = false;
    this.imgData = null;
    this.initialized = false;
  }

  mouseMove(evt){
    // If the mouse button is pressed
    if (evt.buttons === 1) {
      let dx = evt.movementX;
      if (dx === 0) return;

      // Begin dragging
      this.dragging = true;

      // We've moved dx pixels, the height of the image is imgDataHeight,
      // so we've moved dx * imgDataHeight bytes in memory
      let dBytes = -1 * dx * this.props.imgDataHeight;
      let newMemoryPointer = this.props.getMemoryPointer() + dBytes;
      console.log("dx, newMemoryPointer", dx, newMemoryPointer);

      // Clamp left edge
      if (newMemoryPointer < 0) {
        newMemoryPointer = 0;
      }
      // Clamp right edge
      else if (newMemoryPointer > this.props.memorySize) {
        newMemoryPointer = this.props.newMemoryPointer;
      }

      // Let parent know we've updated the position
      this.props.onMemoryPointerUpdate(newMemoryPointer);
    }
    // If we've stopped dragging change cursor back
    else if (evt.buttons === 0 && this.dragging) {
      this.dragging = false;
    }
  }

  updateMemory(memData) {
    console.log("MemoryCanvas::updateMemory");
    this.initialized = true;
    this.imgData = new Uint8ClampedArray(this.props.imgDataWidth * this.props.imgDataHeight * 4);
    for (let y = 0; y < this.props.imgDataHeight; y++) {
      for (let x = 0; x < this.props.imgDataWidth; x++) {
        const i = (y * this.props.imgDataWidth + x) * 4;
        const j = (y * this.props.imgDataWidth + x);

        // Convert byte to color
        const c = [
          (memData[j] & 0b00000011) * 36,
          ((memData[j] & 0b00011100) >> 2) * 36,
          ((memData[j] & 0b11100000) >> 5) * 36
        ];

        this.imgData[i  ] = c[0];   // red
        this.imgData[i+1] = c[1];   // green
        this.imgData[i+2] = c[2];   // blue
        this.imgData[i+3] = 255;    // alpha
      }
    }
  }

  draw(position) {
    console.log("MemoryCanvas::draw", position);
    const imageData = new ImageData(this.imgData, this.props.imgDataWidth, this.props.imgDataHeight);
    this.ctx.fillStyle = "pink";
    this.ctx.fillRect(0, 0, this.props.viewWidth, this.props.viewHeight)
    this.ctx.putImageData(imageData, position, 0);
  }

  componentDidMount() {
    // console.log("MemoryCanvas::componentDidMount");
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext("2d");
  }

  render() {
    // console.log("MemoryCanvas::render");
    return (
      <MemCanvas
        ref={this.canvasRef}
        width={this.props.viewWidth}
        height={this.props.viewHeight}
        onMouseMove={(evt) => this.mouseMove(evt)}
        css={{ hSize: this.props.viewHeight }}
      />
    );
  }
}