import hrtime from 'browser-process-hrtime';

import CPU8086 from "./cpu/8086";
import {
  regCS, regIP,
  NS_PER_SEC, STATE_RUNNING, STATE_HALT,
} from './Constants';
import VideoMDA from "./video/VideoMDA";
import { SystemConfigException } from "./utils/Exceptions";
import SystemConfig from "./config/SystemConfig";
import { debug } from "./utils/Debug";

// We don't know the renderer until runtime. Webpack is a static compiler and
// thus can't require dynamically. Also I was having issues with dynamic
// imports in node though it should work.
// So import all renderers and look them up in the object at runtime.
// Someday I will do more research to see if I can optimize this.
import RendererBin from './video/renderers/RendererBin';
import RendererCanvas from './video/renderers/RendererCanvas';
import RendererPNG from './video/renderers/RendererPNG';
import {loadBINAsync, seg2abs, segIP} from "./utils/Utils";
import {hexString32} from "./utils/Debug";
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

    this.config = config;
    this.cycleCount = 0;
    this.timeSyncCycles = config.timeSyncCycles;
    this.prevTiming = null;
    this.videoSync = config.videoSync;
    this.newVideoSync = config.videoSync;
    this.runningHz = 0;
    this.portCallbacks = [];

    this.biosJumpAddress = [0xF000, 0xFFF0]; // 0x000FFFF0
    this.videoROMAddress = [0xC000, 0x0000]; // 0x000C0000

    // Create CPU
    this.cpu = new CPU8086(config, this);

    // Create video and renderer
    if (config.isNode && config.renderer.class === 'RendererCanvas') {
      throw new SystemConfigException(`RendererCanvas is not a valid renderer when running in nodejs`);
    }
    if (!(config.renderer.class in RENDERERS)) {
      throw new SystemConfigException(`${config.renderer.class} is not a valid renderer`);
    }
    let renderer = new RENDERERS[config.renderer.class](config.renderer.options);
    this.videoCard = new VideoMDA(this.cpu.mem8, renderer, config);

    // Setup port callbacks
    this.portCallbacks.push(this.videoCard.ports);
  }

  /**
   * System boot initialization. This method is asynchronous and returns a promise.
   *
   * @return {Promise<void>}
   */
  async boot () {
    // Clear memory

    // Load BIOS
    console.log("Loading BIOS...");
    if (!this.config.programBlob) {
      // Load BIOS file
      let biosPath = `${this.config.bios.biosPath}${this.config.bios.file}`;
      let bios = await loadBINAsync(biosPath);
      // Calculate start address for the BIOS
      let biosAddr = (1024 * 1024) - bios.length;

      if (this.config.debug) console.info(`Loading BIOS at ${hexString32(biosAddr)}`);
      this.loadMem(bios, biosAddr);
    }

    // Load video BIOS

    // Clear cache

    // Self test

    // Jump to BIOS
    console.log("Jump to BIOS...");
    if (!this.config.programBlob && !this.config.cpu.registers16) {
      this.cpu.reg16[regCS] = this.biosJumpAddress[0];
      this.cpu.reg16[regIP] = this.biosJumpAddress[1];
    }

    // Init state


    await this.videoCard.init();

    // If there's a program blob specified load it
    if (this.config.programBlob) {
      console.log(`Loading program blob ${this.config.programBlob.file}...`);
      let bin = await loadBINAsync(this.config.programBlob.file);
      this.loadMem(bin, this.config.programBlob.addr);
    }
  }

  /**
   * Run the CPU continously or if cyclesToRun is given only run the given
   * number of cycles.
   *
   * @param {(number|null)} cyclesToRun The number of cycles to run
   */
  run (cyclesToRun = null) {
    this.cpu.state = STATE_RUNNING;

    this.prevTiming = hrtime();

    let totalScans = 0;

    while (cyclesToRun === null || cyclesToRun-- > 0) {

      if (this.cycleCount === this.config.debugAtCycle ||
          seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP]) === this.config.debugAtIP)
      {
        this.config.debug = true;
      }

      // if (this.cpu.state === STATE_PAUSED) {
      //   break;
      // }
      if (this.cpu.state === STATE_HALT) {
        break;
      }

      // Do a cycle
      this.cpu.cycle();

      // Handle ports
      this.ports();

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

      this.cycleCount++;
    }

    console.log(`Done running - ${this.cycleCount} cycles`);
    let diff       = hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    let hz         = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
    console.log(`  ran at ${(hz / (1000**2)).toFixed(6)} MHZ`);
  }

  /**
   * Check the timing and update the measured cycles per second in MHZ.
   */
  timingCheck() {
    let diff       = hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    this.runningHz = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);

    // Update the number of cycles between video syncs
    this.newVideoSync = Math.max(Math.round(this.runningHz / this.videoCard.verticalSync), 50000);
  }

  ports () {
    for (let cb in this.portCallbacks) {
      cb();
    }
  }

  /**
   * Load an Uint8Array into memory starting at the given address.
   *
   * @param {Uint8Array} data Data array to be loaded into memory
   * @param {number} from Memory address to begin loading data
   */
  loadMem (data, from) {
    for (let i = 0; i < data.length; i++) {
      this.cpu.mem8[from + i] = data[i];
    }
  }
}
