import fs from 'fs';

export default class RendererBin {
  constructor (options) {
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
    this.saveBinAwait(filePath, screenData.buffer).then( () => {
      console.log(`Screen saved to ${filePath}`);
    });
  }

  /**
   * Save an array of pixel data to a binary file
   *
   * @param {string} path  Path to the file.
   * @param {Uint8Array} data Array (UInt8) with the raw image data
   * @return {Promise<any>}
   */
  saveBinAwait (path, data) {
    return new Promise(resolve => {
      const buf = Buffer.from(data);
      fs.writeFile(path, buf, (e) => {
        if (e) throw e;
        resolve();
      });
    });
  }
}
