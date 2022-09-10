import structuredClone from "core-js-pure/actual/structured-clone";
import { SystemConfigException } from "../utils/Exceptions";
import {assign} from "../utils/Utils";

const DEFAULTS = {
  // Memory size must remain at 1Mb despite what the jumpers are set to because
  // the BIOS loads at the top of that and we don't support memory holes yet.
  memorySize: 0x100000,
  memory: null,

  /** The number of cycles between timing syncs */
  timeSyncCycles: 4 * 1000000 / 100, // About 100 times per sec

  programBlob: null,

  bios: {
    path: "/files/bios-roms/",
    file: null
  },

  cpu : {
    class:       "8086",
    registers16: null, //[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    frequency:   4 * 1024**2, // 4 Mhz
    flags:       0x0000,
  },

  video: {
    class:        "VideoMDA",
    memorySize:   4 * 1024,
    memoryStart:  0xB8000,
    verticalSync: 50,       // Hertz
    fontPath:     "files/fonts/",
    /** Number of cycles per video sync. This is updated every timeSyncCycles */
    defaultCycleSync: 10000,
  },

  renderer: {
    class:   "RendererCanvas",
    options: {
      canvas: null,
    },
  },

  ports: {
    memoryMapped: false, // TODO: is this needed? I think memory mapped I/O just works in normal address space
    size: 0xFFFF,        // IBM 5150 has 64k I/O address space
    // TODO: Copy from IBM5150
    devices: []          // Each system must define its I/O devices
  },

  jumpers: {
    // Switch 1
    // 1-7-8: Number of 5 1/4" drives
    // 2:     Co-processor installed
    // 3-4:   Installed memory on system board
    // 5-6:   Monitor Type
    //
    // Switch 2 [7] p.2-28
    // 1-2-3-4: Installed memory options
    // 5-6-7-8: Unused, must be off
    //
    // Drive settings
    //              --SW1--
    //              1  7  8
    //     0 drives 1  1  1
    //     1 drives 0  1  1
    //     2 drives 0  0  1
    //     3 drives 0  1  0
    //     4 drives 0  0  0
    //
    // Co-processor settings
    //               -SW1-
    //                 2
    //  installed      0
    //  not installed  1
    //
    // Monitor settings
    //                    -SW1-
    //                    5  6
    //     Card w/ BIOS   1  1
    //     CGA (40 x 25)  0  1
    //     CGA (80 x 25)  1  0
    //     MDA (80 x 25)  0  0
    //
    // Memory settings
    // These settings vary depending on BIOS version and have different meaning
    // when an expansion card is installed. See references for details. The
    // listed settings is for the 64KB-256KB main board
    //                -SW1-  ----SW2---
    //                3  4   1  2  3  4
    //       /  16kb  1  1   1  1  1  1
    //  System  32kb  0  1   1  1  1  1
    //   Board  48kb  1  0   1  1  1  1
    //       \  64kb  0  0   1  1  1  1
    //
    //       /  96kb  0  0   0  1  1  1
    //       | 128kb  0  0   1  0  1  1
    //  Option 160kb  0  0   0  0  1  1
    //   Board 192kb  0  0   1  1  0  1
    //       | 224kb  0  0   0  1  0  1
    //       \ 256kb  0  0   1  0  0  1
    // References:
    //    * [7] p.2-28
    //    * http://www.minuszerodegrees.net/5150/misc/5150_motherboard_switch_settings.htm
    //    * http://www.minuszerodegrees.net/5150/ram/5150_ram_64_256_SW2.jpg
    sw1: 0b11000011,
    sw2: 0b11110000,
  },

  debug: false,
  cycleBreak: false,
  debugAtCycle: null,
  debugAtIP: null,
  debugOpString: false,

  // Breakpoints are structured in the following way for rapid lookup
  // {
  //   CS_ADDR: {
  //     IP_ADDR: {
  //       name: "",
  //       enabled: true
  //     }
  //   }
  // }
  breakpoints: {
    // 0xF000: {
    //   0xE05B: {
    //     name: "START",
    //     enabled: false,
    //   },
    // }
  }
};

/**
 * SystemConfig
 *
 * The system configuration class which serves as a container for system parameters.
 *
 */
export default class SystemConfig {

  constructor(initial) {
    let config = structuredClone(DEFAULTS);
    assign(config, initial);

    // Use any default values not already sey by initial values provided
    for (let key in config) {
      if (!(key in this)) this[key] = config[key];
    }

    this.isNode = (typeof window === "undefined");
  }

  validate() {
    if (typeof this.memorySize !== "number") throw new SystemConfigException("CPU Config Error - memory size is not an number");
    if (this.memorySize < 1024) throw new SystemConfigException("CPU Config Error - memory size too small");
    if (this.memorySize > 1048576) throw new SystemConfigException("CPU Config Error - memory size too large");
  }
}
