import System from "./emu/System";
import SystemConfig from "./emu/config/SystemConfig";
import { debug } from "./emu/utils/Debug";

function waitAndExit(wait=1000) {
  // If we're using RendererPNG or RendererBin we can't exit right away or the
  // writes won't finish
  setTimeout(() => {
    process.exit();
  }, wait);
}

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
    class: 'RendererPNG',
  },

  programBlob: {
    file: "files/program-blobs/codegolf",
    addr: 0x00
  },

  video: {
    memoryStart:  0x8000,
  },

  debug: true,
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
    class: 'RendererPNG',
  },

  // debugAtCycle: 378329,
  debugAtCycle: 1,
  debug: false,
  debugOpString: true,
});

/*****************************************************************************/
// let config = sysConfig;
let config = codeGolfConfig;
let system = new System(config);

async function runEmulation () {
  console.log("booting...");
  await system.boot();

  console.log("running...");
  await system.run(4000000);
}

// This forces console.log to write, without this the process will usually exit
// with unflushed writes
if (config.debug) {
  process.stdout._handle.setBlocking(true);
}

runEmulation().then(() => {
  waitAndExit();
}).catch((e) => {
  debug(system);
  console.error(e);
  waitAndExit();
});

