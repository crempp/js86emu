import System from "./emu/System";
import SystemConfig from "./emu/config/SystemConfig";
import { logState } from "./emu/utils/Debug";

function loadMem (data, from, cpu) {
  for (let i = 0; i < data.length; i++) {
    cpu.mem8[from + i] = data[i];
  }
}

function waitAndExit(wait=1000) {
  // If we're using RendererPNG or RendererBin we can't exit right away or the
  // writes won't finish
  setTimeout(() => {
    process.exit();
  }, wait);
}

// https://defuse.ca/online-x86-assembler.htm
let instructions = [
  0xe5, 0x21,        // in   ax,   0x21
  0x83, 0xc8, 0x40,  // or   ax,   0x40
  0xe7, 0x21,        // out  0x21, ax
  0xF4,              // hlt
];

let testerConfig = new SystemConfig({
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
    ]
  },
  renderer: {
    class: 'RendererNoop',
  },
  debug: true,
});

let config = testerConfig;
let system = new System(config);

async function runEmulation () {
  console.log("booting...");
  await system.boot();

  system.loadMem(instructions, 0xFFFF0);

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
  logState(system);
  console.error(e);
  waitAndExit();
});

