// import winston from 'winston'
import CPUConfig from "./cpu/CPUConfig";
import CPU8086 from "./cpu/8086";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS, STATE_RUNNING, NS_PER_SEC,
} from './Constants';
import VideoMDA from "./video/VideoMDA";
import RendererGD from "./video/renderers/RendererGD";

const DEBUG = false;

export default class System {
  constructor () {
    this.cpuConfig = new CPUConfig({
      memorySize: 2**16,
    });

    this.cpu = new CPU8086(this.cpuConfig);

    this.cpu.reg16[regIP] = 0;
    this.cpu.reg16[regSP] = 0x100;
    this.cpu.reg16[regCS] = 0x0000;

    // let renderer = new RendererGD();
    // this.videoCard = new VideoMDA(this.cpu.mem8, renderer);

    /**
     * CPU cycle counter. This tracks the number of instruction cycles the CPU
     * has executed.
     */
    this.cycleCount = 0;

    this.prevTiming = null;

    this.videoSync = 1000;  // cycles

    this.runningHz = 0;

    this.timeSyncCycles = 500;
  }

  async boot () {
    // await this.videoCard.init(this.videoRenderer);
  }

  run (cyclesToRun = null) {
    this.cpu.state = STATE_RUNNING;
    let freq = this.cpu.frequency;
    let vSyncCycles = 0;

    this.prevTiming = process.hrtime();

    while (cyclesToRun === null || cyclesToRun-- > 0) {
      // winston.log("debug", "-".repeat(80 - 7));
      // winston.log("debug", "8086.cycle()             : Running instruction cycle [" + this.cycleCount + "]");

      // if (this.cpu.state === STATE_PAUSED) {
      //   break;
      // }

      this.cpu.cycle();

      if (this.cycleCount % this.timeSyncCycles === 0) {
        this.timingTest();
        // vSyncCycles = Math.round(this.runningHz / this.videoCard.verticalSync)
      }

      if (vSyncCycles !== 0 && this.cycleCount % this.videoSync === 0){
        // this.videoCard.scan();
      }

      this.cycleCount++;
    }

    console.log(`Done running - ${this.cycleCount} cycles`);
    let diff       = process.hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    let hz         = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
    console.log(`  ran at ${(hz / (1024**2)).toFixed(6)} MHZ`)
  }

  timingTest() {
    let diff       = process.hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    this.runningHz = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
    if (DEBUG) console.log(`Running at ${this.runningHz.toFixed(2)} HZ (${(this.runningHz / (1024**2)).toFixed(6)} MHZ)`);
  }
}
