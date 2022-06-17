import hrtime from 'browser-process-hrtime';
import 'setimmediate';
import CPU8086 from "./cpu/8086";
import IO from "./IO";
import SystemConfig from "./config/SystemConfig";
import {
  regCS, regIP, STATE_RUNNING, STATE_HALT
} from './Constants';
import { SystemConfigException } from "./utils/Exceptions";
import {loadBINAsync, seg2abs} from "./utils/Utils";
import Debug, {hexString32} from "./utils/Debug";
import Clock from "./Clock";
import Keyboard from "./devices/Keyboard";

export default class System {
  constructor (config) {
    if (!(config instanceof SystemConfig)) {
      throw new SystemConfigException("System Config Error - config is not a SystemConfig instance");
    }
    config.validate();

    this.config = config;

    this.immediateHandle = null;
    this.cyclesToRun = null;
    this.io = null;

    this.steppingMode = false;
    this.debug = new Debug(this);

    // TODO: Figure out what to do with these
    this.videoROMAddress = [0xC000, 0x0000]; // 0x000C0000
    this.NMIMasked = false; // update this with this.io.devices["NMIMaskRegister"].isMasked();

    // Create clock
    this.clock = new Clock(this);

    // Create CPU
    this.cpu = new CPU8086(config, this);

    // Create IO port interface
    // This needs to be done after initializing CPU
    this.io = new IO(this.config, this);

    // Temporary handle on video card until I find a better way to access it
    this.videoCard = this.io.availableDevices["VideoMDA"];

    // Create keyboard
    this.keyboard = new Keyboard(config, this);
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
      this.debug.info("Loading BIOS...", true);
      // Load BIOS file
      let biosPath = `${this.config.bios.path}${this.config.bios.file}`;
      let bios = await loadBINAsync(biosPath);
      // Calculate start address for the BIOS
      // Currently hard-coded for 8086
      let biosAddr = this.config.memorySize - bios.length;

      if (this.config.debug) this.debug.info(`Loading BIOS at ${hexString32(biosAddr)}`, true);
      this.loadMem(bios, biosAddr);
    }

    // Load video BIOS

    // TODO: Boot I/O devices. This is where the videoCard.init() should go
    this.io.boot();

    // Clear cache

    // Self test

    // Init state
    await this.videoCard.init();

    this.cpu.state = STATE_RUNNING;
  }

  /**
   * Run the CPU continuously or if cyclesToRun is given only run the given
   * number of cycles.
   *
   * @param {(number|null)} cyclesToRun The number of cycles to run
   * @param {function} finishedCB Callback to call when the run is completed
   */
  async run (cyclesToRun = null, finishedCB = null) {
    return new Promise(resolve => {
      this.cyclesToRun = cyclesToRun;
      this.cycle((sys) => {
        this.end();
        if (typeof finishedCB === 'function') finishedCB(sys);
        resolve(this);
      });
    });
  }

  /**
   * Perform once cycle of the system.
   *
   * This method is designed to be used with setInterval and will clear its
   * intervalID when the system is done running.
   */
  cycle(finishedCB) {
    if (this.clock.cycles === this.config.debugAtCycle ||
        seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP]) === this.config.debugAtIP)
    {
      this.config.debug = true;
    }

    // Do a CPU Cycle
    this.cpu.cycle();

    // Cycle Devices
    this.io.cycle();

    // Tick the clock
    this.clock.tick();

    if (this.cyclesToRun !== null && --this.cyclesToRun <= 0) this.cpu.state = STATE_HALT;

    // Queue next cycle
    if (this.cpu.state === STATE_RUNNING) {
      this.immediateHandle = setImmediate(this.cycle.bind(this),  finishedCB);
    }
    // Or finish running
    else {
      if (typeof finishedCB === 'function') finishedCB(this);
    }
  }

  end() {
    // Do a final video scan to flush video memory to screen
    this.videoCard.scan();

    // Clear the next immediate
    clearImmediate(this.immediateHandle);

    // Print debug info
    console.log(`Done running - ${this.clock.cycles} cycles`);
    console.log(`  ran at ${(this.clock.hz / (1000 ** 2)).toFixed(6)} MHZ`);
  }

  getDevice(name) {
    return this.io.devices[name];
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
