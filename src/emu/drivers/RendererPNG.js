import fs from "fs";
import { PNG } from "pngjs";

export default class RendererPNG {
  constructor () {
    this.path = "screenOut";
    this.width = null;
    this.height = null;

    if (!fs.existsSync(this.path)){
      fs.mkdirSync(this.path);
    }
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
  }

  /**
   * Render the screen data
   *
   * @param {Uint8Array} screenData The raw screen data
   */
  render (screenData) {
    let filePath = `${this.path}/screen-${Date.now()}.png`;
    this.savePNGAync(filePath, screenData).then( () => {
      console.log(`Screen saved to ${filePath}`);
    });
  }

  /**
   * Save an array of pixel data to a PNG file
   *
   * @param {string} path  Path to the file.
   * @param {Uint8Array} data Array (UInt8) with the raw image data
   * @return {Promise<any>}
   */
  savePNGAync (path, data) {
    return new Promise(resolve => {
      let png = new PNG({
        width:          this.width,
        height:         this.height,
        colorType:      6,
        inputColorType: 6,
        bitDepth:       8,
        inputHasAlpha:  true,
      });

      for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
          let idx = (png.width * y * 4) + (x * 4);
          png.data[idx]     = data[idx];
          png.data[idx + 1] = data[idx + 1];
          png.data[idx + 2] = data[idx + 2];
          png.data[idx + 3] = data[idx + 3];
        }
      }

      let buf = PNG.sync.write(png);
      fs.writeFile(path, buf, (e) => {
        if (e) throw e;
        resolve();
      });
    });
  }
}
