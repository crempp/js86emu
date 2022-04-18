import hrtime from 'browser-process-hrtime';
import 'setimmediate';
import CPU8086 from "./cpu/8086";
import VideoMDA from "./video/VideoMDA";
import IO from "./IO";
import SystemConfig from "./config/SystemConfig";
import {
  regCS, regIP,
  STATE_RUNNING, STATE_HALT, STATE_WAIT,
  NS_PER_SEC, PIN_8080_TEST, PIN_LOW,
} from './Constants';
import { SystemConfigException } from "./utils/Exceptions";
import {loadBINAsync, seg2abs} from "./utils/Utils";
import {hexString32} from "./utils/Debug";

// We don't know the renderer or devices until runtime. Webpack is a static
// compiler and thus can't require dynamically. Also, I was having issues with
// dynamic imports in node though it should work.
// ...so import all renderers/device and look them up in the object at runtime.
// Someday I will do more research to see if I can optimize this.
import RendererBin from './video/renderers/RendererBin';
import RendererCanvas from './video/renderers/RendererCanvas';
import RendererPNG from './video/renderers/RendererPNG';
import RendererNoop from "./video/renderers/RendererNoop";
import NullDevice from "./devices/NullDevice";
import DMA8237 from "./devices/DMA8237";
import PIC8259 from "./devices/PIC8259";
import TestDevice from "./devices/TestDevice";

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
    this.videoSyncCycles = config.video.syncCycles;
    this.newVideoSyncCycles = config.video.syncCycles;
    this.runningHz = 0;
    // this.intervalID = null;
    this.immediateHandle = null;
    this.cyclesToRun = null;

    this.RENDERERS = {
      "RendererNoop":   RendererNoop,
      "RendererBin":    RendererBin,
      "RendererCanvas": RendererCanvas,
      "RendererPNG":    RendererPNG,
    };

    this.DEVICES = {
      null:         new NullDevice(config),
      "DMA8237":    new DMA8237(config),
      "PIC8259":    new PIC8259(config),
      "VideoMDA":   null, // Set this during setup
      "TestDevice": new TestDevice(config)
    };

    this.videoROMAddress = [0xC000, 0x0000]; // 0x000C0000

    // Create CPU
    this.cpu = new CPU8086(config, this);

    // Create video and renderer
    // TODO: Make this a device, move setup code to Video class, move to devices and IO system
    if (config.isNode && config.renderer.class === 'RendererCanvas') {
      throw new SystemConfigException(`RendererCanvas is not a valid renderer when running in nodejs`);
    }
    if (!(config.renderer.class in this.RENDERERS)) {
      throw new SystemConfigException(`${config.renderer.class} is not a valid renderer`);
    }
    let renderer = new this.RENDERERS[config.renderer.class](config.renderer.options);
    this.videoCard = new VideoMDA(this, renderer, config);
    this.DEVICES["VideoMDA"] = this.videoCard;

    // Create IO port interface
    // This needs to be done after initializing all the other devices
    this.io = new IO(this.config, this.DEVICES);
    this.cpu.connectIO(this.io);
  }

  /**
   * System boot initialization. This method is asynchronous and returns a promise.
   *
   * @return {Promise<void>}
   */
  async boot () {
    // Load system BIOS or blob
    if (this.config.programBlob) {
      console.log(`Loading program blob ${this.config.programBlob.file}...`);
      let bin = await loadBINAsync(this.config.programBlob.file);
      this.loadMem(bin, this.config.programBlob.addr);
    }
    else if (typeof this.config.bios.file === 'string') {
      console.log("Loading BIOS...");
      // Load BIOS file
      let biosPath = `${this.config.bios.path}${this.config.bios.file}`;
      let bios = await loadBINAsync(biosPath);
      // Calculate start address for the BIOS
      // Currently hard-coded for 8086
      let biosAddr = this.config.memorySize - bios.length;

      if (this.config.debug) console.info(`Loading BIOS at ${hexString32(biosAddr)}`);
      this.loadMem(bios, biosAddr);
    }

    // Load video BIOS

    // Clear cache

    // Self test

    // Init state
    await this.videoCard.init();

    this.cpu.state = STATE_RUNNING;

    this.prevTiming = hrtime();
  }

  /**
   * Run the CPU continuously or if cyclesToRun is given only run the given
   * number of cycles.
   *
   * @param {(number|null)} cyclesToRun The number of cycles to run
   * @param {function} finishedCB Callback to call when the run is completed
   */
  run (cyclesToRun = null, finishedCB = null) {
    this.cyclesToRun = cyclesToRun;
    this.cycle(() => {
      // Do a final video scan to flush video memory to screen
      this.videoCard.scan();

      // Call any call-back provided
      if (typeof finishedCB === 'function') finishedCB();

      // Print debug info
      console.log(`Done running - ${this.cycleCount} cycles`);
      let diff       = hrtime(this.prevTiming);
      let totalTime  = diff[0] * NS_PER_SEC + diff[1];
      let hz         = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
      console.log(`  ran at ${(hz / (1000**2)).toFixed(6)} MHZ`);
    });
  }

  /**
   * Perform once cycle of the system.
   *
   * This method is designed to be used with setInterval and will clear its
   * intervalID when the system is done running.
   */
  cycle(finishedCB) {
    if (this.cycleCount === this.config.debugAtCycle ||
        seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP]) === this.config.debugAtIP)
    {
      this.config.debug = true;
    }

    // Do a cycle
    this.cpu.cycle();

    // Cycle Devices
    this.cycleDevices();

    // Run timing check
    if (this.cycleCount % this.timeSyncCycles === 0) {
      this.timingCheck();
    }

    // Run video card scan
    if (this.videoSyncCycles !== 0 && this.cycleCount % this.videoSyncCycles === 0){
      this.videoSyncCycles = this.newVideoSyncCycles;
      this.videoCard.scan();
    }

    this.cycleCount++;

    if (this.config.debug && (this.cyclesToRun !== null && this.cyclesToRun-- > 0)) this.cpu.state = STATE_HALT;

    if (this.cpu.state === STATE_RUNNING) {
      this.immediateHandle = setImmediate(this.cycle.bind(this),  finishedCB);
    }
    else {
      if (typeof finishedCB === 'function') finishedCB();
    }
  }

  /**
   * Run a cycle on each device
   */
  cycleDevices() {

  }

  /**
   * Check the timing and update the measured cycles per second in MHZ.
   */
  timingCheck() {
    let diff       = hrtime(this.prevTiming);
    let totalTime  = diff[0] * NS_PER_SEC + diff[1];
    this.runningHz = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);

    // Update the number of cycles between video syncs
    this.newVideoSyncCycles = Math.max(Math.round(this.runningHz / this.videoCard.verticalSync), 50000);
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
