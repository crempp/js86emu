import hrtime from 'browser-process-hrtime';
import 'setimmediate';
import CPU8086 from "./cpu/8086";
import IO from "./IO";
import SystemConfig from "./config/SystemConfig";
import {
  regCS, regIP,
  STATE_RUNNING, STATE_HALT, STATE_WAIT,
  NS_PER_SEC, PIN_8080_TEST, PIN_LOW,
} from './Constants';
import { SystemConfigException } from "./utils/Exceptions";
import {loadBINAsync, seg2abs} from "./utils/Utils";
import Debug, {hexString32} from "./utils/Debug";

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
    this.immediateHandle = null;
    this.cyclesToRun = null;
    this.io = null;

    this.steppingMode = false;
    this.debug = new Debug(this);

    // TODO: Figure out what to do with these
    this.videoROMAddress = [0xC000, 0x0000]; // 0x000C0000
    this.NMIMasked = false; // update this with this.io.devices["NMIMaskRegister"].isMasked();

    // Create CPU
    this.cpu = new CPU8086(config, this);

    // Create IO port interface
    // This needs to be done after initializing CPU
    this.io = new IO(this.config, this);

    // Temporary handle on video card until I find a better way to access it
    this.videoCard = this.io.availableDevices["VideoMDA"];

    // Breakpoints are structured in the following way for rapid lookup
    // {
    //   CS_ADDR: {
    //     IP_ADDR: {
    //       name: "",
    //       enabled: true
    //     }
    //   }
    // }
    this.breakpoints = {
      0xF000: {
        0xE05B: {
          name: "START",
          enabled: false,
        },
        0xE08E: {
          name: "C8",
          enabled: false,
        },
        0xE0AB: {
          name: "C9",
          enabled: false,
        },
        0xE0B0: {
          name: "C10",
          enabled: false,
        },
        0xE20B: {
          name: "ROS_CHECKSUM",
          enabled: false,
        },
        0xE0D8: {
          name: "C11",
          enabled: false,
        },
        0xE0DC: {
          name: "WIP",
          enabled: true,
        },
      }
    }
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

    // TODO: Boot I/O devices. This is where the videoCard.init() should go
    this.io.boot();

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
  async run (cyclesToRun = null, finishedCB = null) {
    return new Promise(resolve => {
      this.cyclesToRun = cyclesToRun;
      this.cycle((sys) => {
        // Do a final video scan to flush video memory to screen
        this.videoCard.scan();

        // Clear the next immediate
        clearImmediate(this.immediateHandle);

        // Call any call-back provided
        if (typeof finishedCB === 'function') finishedCB(sys);

        // Print debug info
        console.log(`Done running - ${this.cycleCount} cycles`);
        let diff = hrtime(this.prevTiming);
        let totalTime = diff[0] * NS_PER_SEC + diff[1];
        let hz = 1 / ((totalTime / this.cycleCount) / NS_PER_SEC);
        console.log(`  ran at ${(hz / (1000 ** 2)).toFixed(6)} MHZ`);

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

    if (this.cyclesToRun !== null && --this.cyclesToRun <= 0) this.cpu.state = STATE_HALT;

    if (this.cpu.state === STATE_RUNNING) {
      this.immediateHandle = setImmediate(this.cycle.bind(this),  finishedCB);
    }
    else {
      if (typeof finishedCB === 'function') finishedCB(this);
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
