// import fs from 'fs';
// import { PNG } from 'pngjs';
//
// // NOTE: Can't write async because you need to wait for the callback to return
// // before starting next write
// //   - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
//
// export default class RendererBin {
//   constructor (options) {
//     this.path = "screenOut";
//
//     if (!fs.existsSync(this.path)){
//       fs.mkdirSync(this.path);
//     }
//   }
//
//   render (screenData, width, height) {
//     let filePath = `${this.path}/screen-${Date.now()}.bin`;
//     this.saveBinAwait(filePath, screenData.buffer).then( () => {
//       console.log(`Screen saved to ${filePath}`);
//     });
//   }
//
//   /**
//    * Save an array of pixel data to a binary file
//    *
//    * @param {string} path  Path to the file.
//    * @param {Uint8Array} data Array (UInt8) with the raw image data
//    * @return {Promise<any>}
//    */
//   saveBinAwait (path, data) {
//     return new Promise(resolve => {
//       const buf = Buffer.from(data);
//       fs.writeFileSync(path, buf);
//       resolve();
//     });
//   }
// }
