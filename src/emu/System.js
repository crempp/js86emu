import CPUConfig from "./cpu/CPUConfig";
import CPU8086 from "./cpu/8086";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS, STATE_RUNNING, NS_PER_SEC, regFlags,
} from './Constants';
import VideoMDA from "./video/VideoMDA";
import RendererPNG from "./video/renderers/RendererPNG";
import {formatFlags, formatMemory, formatOpcode, formatRegisters, formatStack, hexString16} from "./utils/Debug";
import {segIP} from "./utils/Utils";
import RendererBin from "./video/renderers/RendererBin";

export default class System {
  constructor () {
    this.cpuConfig = new CPUConfig({
      memorySize: 64 * (1024),
    });

    this.cpu = new CPU8086(this.cpuConfig);

    this.cpu.reg16[regIP] = 0;
    this.cpu.reg16[regSP] = 0x100;
    this.cpu.reg16[regCS] = 0x0000;

    let renderer = new RendererPNG();
    // let renderer = new RendererBin();
    this.videoCard = new VideoMDA(this.cpu.mem8, renderer);

    /**
     * CPU cycle counter. This tracks the number of instruction cycles the CPU
     * has executed.
     */
    this.cycleCount = 0;

    this.prevTiming = null;

    // TODO: See if there's a better way to prevent sync skips than using a prev
    this.newVideoSync = 10000;  // cycles, start small until timingCheck() runs
    this.videoSync = 10000;
    this.runningHz = 0;

    this.timeSyncCycles = 4 * 1000000 / 100; // About 100 times per sec
  }

  async boot () {
    await this.videoCard.init();
  }

  run (cyclesToRun = null) {
    this.cpu.state = STATE_RUNNING;
    let freq = this.cpu.frequency;

    this.prevTiming = process.hrtime();

    let totalScans = 0;

    while (cyclesToRun === null || cyclesToRun-- > 0) {
      // console.log("-".repeat(80 - 7));
      // console.log("8086.cycle()             : Running instruction cycle [" + this.cycleCount + "]");

      // if (this.cpu.state === STATE_PAUSED) {
      //   break;
      // }

      this.cpu.cycle();

      // Run timing check
      if (this.cycleCount % this.timeSyncCycles === 0) {
        this.timingCheck();
      }

      // Run videocard scan
      if (this.videoSync !== 0 && this.cycleCount % this.videoSync === 0){
        this.videoSync = this.newVideoSync;
        totalScans++;
        this.videoCard.scan();
      }

      if (this.cycleCount === 10000) {
        let a = 1;
      }

      this.cycleCount++;
    }



    console.log(`Done running - ${this.cycleCount} cycles`);
    let diff       = process.hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    let hz         = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
    console.log(`  ran at ${(hz / (1000**2)).toFixed(6)} MHZ`);
    // console.log(`  completed in ${totalTime/NS_PER_SEC} seconds`);
    // console.log(`  did ${totalScans} scans`);
  }

  timingCheck() {
    let diff       = process.hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    this.runningHz = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);

    // Update the number of cycles between video syncs
    this.newVideoSync = Math.max(Math.round(this.runningHz / this.videoCard.verticalSync), 50000);

    // console.log(`Running at ${this.runningHz.toFixed(2)} HZ (${(this.runningHz / (1024**2)).toFixed(6)} MHZ)`);
    // console.log(`  newVideoSync = ${this.newVideoSync}`);
    // console.log(`  videoSync = ${this.videoSync}`);
  }

  loadMem (data, from) {
    for (let i = 0; i < data.length; i++) {
      this.cpu.mem8[from + i] = data[i];
    }
  }
}
