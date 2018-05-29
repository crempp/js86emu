import System from "./emu/System";
import RendererCanvas from "./emu/video/renderers/RendererCanvas";
import SystemConfig from "./emu/config/SystemConfig";
import { BrowserFSAsync } from "./emu/utils/Utils";

// Browser filesystem configuration
// https://github.com/jvilk/BrowserFS
const FS_CONFIG = {
  fs: "MountableFileSystem",
  options: {
    '/files': {
      fs: "HTTPRequest",
      options: {
        index: "files/fs.json",
        baseUrl: "/files"
      }
    },
    '/screenOut': {
      fs: "LocalStorage"
    },
  }
};

let codeGolfConfig = new SystemConfig({
  memorySize: 1024 * 1024,

  cpu: {
    registers16: [
      /* AX */ 0,
      /* BX */ 0,
      /* CX */ 0,
      /* DX */ 0,
      /* SI */ 0,
      /* DI */ 0,
      /* BP */ 0,
      /* SP */ 0x0100,
      /* IP */ 0,
      /* CS */ 0,
      /* DS */ 0,
      /* ES */ 0,
      /* SS */ 0,
      /* FL */ 0,
    ],
  },

  renderer: {
    class: 'RendererCanvas',
    options: {canvas: document.getElementById('screen')}
  },

  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },

  video: {
    memoryStart:  0x8000,
  },

  debug: false,
});

let sysConfig = new SystemConfig({
  bios: {
    file: "PCXTBIOS.BIN"
  },

  video: {
    class:        'VideoMDA',
    memorySize:   4 * 1024,
    memoryStart:  0xB0000,
    verticalSync: 50,       // Hertz
  },

  renderer: {
    class: 'RendererCanvas',
    options: {canvas: document.getElementById('screen')}
  },

  debug: false,
});

/*****************************************************************************/
// let config = sysConfig;
let config = codeGolfConfig;

async function runEmulation () {
  await BrowserFSAsync(FS_CONFIG);

  let system = new System(config);

  console.log("booting...");
  await system.boot();

  console.log("running...");
  system.run();

  // force a video scan at the end of the run
  system.videoCard.scan();
};

document.addEventListener("DOMContentLoaded", runEmulation);
