import fs from "fs";
import {saveBinAwait} from "../utils/Utils";

export default class RendererBin {
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
  render (screenData, width, height) {
    let filePath = `${this.path}/screen-${Date.now()}.bin`;
    saveBinAwait(filePath, screenData).then( () => {
      console.log(`Screen saved to ${filePath}`);
    });
  }
}
