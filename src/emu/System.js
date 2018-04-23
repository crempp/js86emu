import hrtime from 'browser-process-hrtime';

import CPU8086 from "./cpu/8086";
import {
  STATE_RUNNING, NS_PER_SEC,
} from './Constants';
import VideoMDA from "./video/VideoMDA";
import { SystemConfigException } from "./utils/Exceptions";
import SystemConfig from "./config/SystemConfig";

// We don't know the renderer until runtime. Webpack is a static compiler and
// thus can't require dynamically. Also I was having issues with dynamic
// imports in node though it should work.
// So import all renderers and look them up in the object at runtime.
// Someday I will do more research to see if I can optimize this.
import RendererBin from './video/renderers/RendererBin';
import RendererCanvas from './video/renderers/RendererCanvas';
import RendererPNG from './video/renderers/RendererPNG';
const RENDERERS = {
  "RendererBin": RendererBin,
  "RendererCanvas": RendererCanvas,
  "RendererPNG": RendererPNG,
};

export default class System {
  constructor (config) {
    if (!(config instanceof SystemConfig)) {
      throw new SystemConfigException("System Config Error - config is not a SystemConfig instance");
    }
    config.validate();

    this.cpu = new CPU8086(config);

    let renderer = new RENDERERS[config.renderer.class](config.renderer.options);
    this.videoCard = new VideoMDA(this.cpu.mem8, renderer, config);

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

    this.prevTiming = hrtime();

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

      if (this.cycleCount >= 1510) {
        let a = 1;
      }

      this.cycleCount++;
    }

    console.log(`Done running - ${this.cycleCount} cycles`);
    let diff       = hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    let hz         = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
    console.log(`  ran at ${(hz / (1000**2)).toFixed(6)} MHZ`);
    // console.log(`  completed in ${totalTime/NS_PER_SEC} seconds`);
    // console.log(`  did ${totalScans} scans`);
  }

  timingCheck() {
    let diff       = hrtime(this.prevTiming);
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
