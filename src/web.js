import System from "./emu/System";
import RendererCanvas from "./emu/video/renderers/RendererCanvas";
import SystemConfig from "./emu/config/SystemConfig";
import {BrowserFSAsync, loadBINAsync} from "./emu/utils/Utils";

let system;

// Browser filesystem configuration
// https://github.com/jvilk/BrowserFS
const FS_CONFIG = {
  fs: "MountableFileSystem",
  options: {
    '/files': {
      fs: "HTTPRequest",
      options: {
        index: "files/fs.json",
        baseUrl: "http://localhost:8080/files"
      }
    },
    '/screenOut': {
      fs: "LocalStorage"
    },
  }
};

// System configuration
let sysConfig = new SystemConfig({
  cpu: {
    registers16: [0, 0, 0, 0, 0, 0, 0, 0x0100, 0, 0, 0, 0, 0, 0],
  },

  renderer: {
    class: 'RendererCanvas',
    options: {canvas: document.getElementById('screen')}
  },

  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },

  debug: false,
});

async function runEmulation () {
  await BrowserFSAsync(FS_CONFIG);

  system = new System(sysConfig);

  console.log("booting...");
  await system.boot();

  console.log("running...");
  system.run();

  // force a video scan at the end of the run
  system.videoCard.scan();
};

document.addEventListener("DOMContentLoaded", runEmulation);










