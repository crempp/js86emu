export default class RendererCanvas {
  constructor (options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.width = null;
    this.height = null;
  }

  /**
   * Set the render size
   *
   * @param {number} width Renderer width
   * @param {number} height Renderer height
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Render the screen data
   *
   * @param {Uint8Array} screenData The raw screen data
   */
  render (screenData) {
    let imageData = this.ctx.createImageData(this.width, this.height);
    for (let i=0; i < screenData.length; i+=4) {
      imageData.data[i]   = screenData[i];   //red
      imageData.data[i+1] = screenData[i+1]; //green
      imageData.data[i+2] = screenData[i+2]; //blue
      imageData.data[i+3] = screenData[i+3]; //alpha
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
}
