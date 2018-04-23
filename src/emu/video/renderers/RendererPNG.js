import fs from 'fs';
import { PNG } from 'pngjs';

// NOTE: Can't write async because you need to wait for the callback to return
// before starting next write
//   - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback

export default class RendererPNG {
  constructor (options) {
    this.path = "screenOut";
    this.width = null;
    this.height = null;

    // if (!fs.existsSync(this.path)){
    //   fs.mkdirSync(this.path);
    // }
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  render (screenData) {
    let filePath = `${this.path}/screen-${Date.now()}.png`;
    this.savePNGAwait(filePath, screenData).then( () => {
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
  savePNGAwait (path, data) {
    return new Promise(resolve => {
      let newfile = new PNG({
        width:          this.width,
        height:         this.height,
        colorType:      6,
        inputColorType: 6,
        bitDepth:       8,
        inputHasAlpha:  true,
      });

      for (let y = 0; y < newfile.height; y++) {
        for (let x = 0; x < newfile.width; x++) {
          let idx = (newfile.width * y * 4) + (x * 4);
          newfile.data[idx]     = data[idx];
          newfile.data[idx + 1] = data[idx + 1];
          newfile.data[idx + 2] = data[idx + 2];
          newfile.data[idx + 3] = data[idx + 3];
        }
      }
      let buff = PNG.sync.write(newfile);
      fs.writeFileSync(path, buff);
      resolve();
    });
  }
}
