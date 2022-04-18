/**
 * CPUConfig
 *
 * The CPU configuration class which serves as a container for CPU parameters.
 *
 */
import { SystemConfigException } from '../utils/Exceptions';
import {assign} from "../utils/Utils";

const DEFAULTS = {
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
    class:       '8086',
    registers16: null, //[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    frequency:   10 * 1024**2, // 10 Mhz
    flags:       0x0000,
  },
  video: {
    class:        'VideoMDA',
    memorySize:   4 * 1024,
    memoryStart:  0xB8000,
    verticalSync: 50,       // Hertz
    fontPath:     "files/fonts/",
    /** Number of cycles per video sync. This is updated every timeSyncCycles */
    syncCycles: 10000,
  },
  renderer: {
    class:   'RendererCanvas',
    options: {
      canvas: null,
    },
  },
  ports: {
    memoryMapped: false, // TODO: is this needed? I think memory mapped I/O just works in normal address space
    size: 0xFFFF,        // IBM 5150 has 64k I/O address space
    devices: []          // Each system must define its I/O devices
  },
  debug: false,
  cycleBreak: false,
  debugAtCycle: null,
  debugAtIP: null,
  debugOpString: false,
};

export default class SystemConfig {

  constructor(initial) {
    assign(DEFAULTS, initial);

    // Use any default values not already sey by initial values provided
    for (let key in DEFAULTS) {
      if (!(key in this)) this[key] = DEFAULTS[key];
    }

    this.isNode = (typeof window === 'undefined');
  }

  validate() {
    if (typeof this.memorySize !== "number") throw new SystemConfigException("CPU Config Error - memory size is not an number");
    if (this.memorySize < 1024) throw new SystemConfigException("CPU Config Error - memory size too small");
    if (this.memorySize > 1048576) throw new SystemConfigException("CPU Config Error - memory size too large");
  }
}
