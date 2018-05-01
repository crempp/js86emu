import System from "./emu/System";
import SystemConfig from "./emu/config/SystemConfig";
import {segIP} from "./emu/utils/Utils";
import {formatMemory} from "./emu/utils/Debug";

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
    // file: "8086-tiny-bios.bin"
  },

  renderer: {
    class: 'RendererPNG',
  },

  // debug: true,
});

let repConfig = new SystemConfig({
  cpu: {
    registers16: [
      /* AX */ 0x00AA,
      /* BX */ 0,
      /* CX */ 0x0010,
      /* DX */ 0,
      /* SI */ 0,
      /* DI */ 0x0020,
      /* BP */ 0,
      /* SP */ 0,
      /* IP */ 0,
      /* CS */ 0,
      /* DS */ 0,
      /* ES */ 0x0100,
      /* SS */ 0,
      /* FL */ 0
    ],
  },

  renderer: {
    class: 'RendererPNG',
  },

  debug: true,
});

/*****************************************************************************/
let config = sysConfig;
let system = new System(config);

// system.cpu.mem8[0x00] = 0xF3;
// system.cpu.mem8[0x01] = 0xAA;
// system.cpu.mem8[0x02] = 0xF4;
// system.loadMem([
//   0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
//   0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10
// ], 0x01020);

async function runEmulation () {
  console.log("booting...");
  await system.boot();

  // console.log(`BEFORE: \n${formatMemory(system.cpu.mem8, 0x01020, 0x01020 + 0x10)}`);

  console.log("running...");
  system.run(1200000);

  // console.log(`AFTER : \n${formatMemory(system.cpu.mem8, 0x01020, 0x01020 + 0x10)}`);

  // force a video scan at the end of the run
  system.videoCard.scan();
}

// This forces console.log to write, without this the process will usually exit
// with unflushed writes
if (config.debug) {
  process.stdout._handle.setBlocking(true);
}

runEmulation().then(() => {
  // If we're using RendererPNG or RendererBin we can't exit right away or the
  // writes won't finish
  setTimeout(() => {
    process.exit();
  }, 1000);
}).catch((e) => {
  console.error(e);
});
