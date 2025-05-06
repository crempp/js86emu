import React, {PureComponent} from "react";
import {styled} from "../../stitches.config";

const MemCanvas = styled("canvas", {
  width: "100%",
  cursor: "grab",
});

/**
 * MemoryCanvas Component
 *
 * We do not have mem8 as part of state because we don't want to rerender the
 * canvas when it changes. We only want to update the contents of the canvas.
 *
 * So we count on parent components to call `updateMemory` and `draw`.
 *
 * There is likely a better way to do this but this works decently well for the
 * moment.
 */
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

      // Clamp left edge
      if (newMemoryPointer < 0) {
        newMemoryPointer = 0;
      }
      // Clamp right edge
      else if (newMemoryPointer > this.props.memorySize) {
        newMemoryPointer = this.props.memorySize;
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
    this.initialized = true;
    this.imgData = new Uint8ClampedArray(this.props.imgDataWidth * this.props.imgDataHeight * 4);

    for (let u = 0; u < this.props.imgDataWidth; u++) {
      for (let v = 0; v < this.props.imgDataHeight; v++) {
        const iMem = (u * this.props.imgDataHeight) + v;
        const iImg = (v * this.props.imgDataWidth * 4) + (u * 4);

        this.imgData[iImg  ] = (memData[iMem] & 0b00000011) * 36;        // red
        this.imgData[iImg+1] = ((memData[iMem] & 0b00011100) >> 2) * 36; // green
        this.imgData[iImg+2] = ((memData[iMem] & 0b11100000) >> 5) * 36; // blue
        this.imgData[iImg+3] = 255;                                      // alpha
      }
    }
  }

  draw(position) {
    const imageData = new ImageData(this.imgData, this.props.imgDataWidth, this.props.imgDataHeight);
    this.ctx.fillStyle = "#e6e6e6";
    this.ctx.fillRect(0, 0, this.props.viewWidth, this.props.viewHeight);
    this.ctx.putImageData(imageData, position, 0);
  }

  componentDidMount() {
    this.canvas = this.canvasRef.current;
    this.ctx = this.canvas.getContext("2d");
  }

  render() {
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