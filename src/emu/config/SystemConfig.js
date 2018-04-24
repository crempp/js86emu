/**
 * CPUConfig
 *
 * The CPU configuration class which serves as a container for CPU parameters.
 *
 */
import { SystemConfigException } from '../utils/Exceptions';

const DEFAULTS = {

  memorySize: 64 * 1024,
  memory: null,

  cpu : {
    class:       '8086',
    registers16: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    frequency:   10 * 1024**2, // 10 Mhz
    flags:       0x0000,
  },

  video: {
    class:        'VideoMDA',
    fontPath:     "files/fonts/",
    memorySize:   4 * 1024,
    memoryStart:  0x8000,
    verticalSync: 50,       // Hertz
  },

  renderer: {
    class:   'RendererCanvas',
    options: {
      canvas: null,
    },
  },

  debug: false,

  programBlob: null,

  /** The number of cycles between timing syncs */
  timeSyncCycles: 4 * 1000000 / 100, // About 100 times per sec

  /** Number of cycles per video sync. This is updated every timeSyncCycles */
  videoSync: 10000,
};

export default class SystemConfig {

  constructor(initial) {
    // If an initial set of config values are given then use them
    if (typeof initial === 'object') {
      for (let key in initial) {
        if (key in DEFAULTS) {
          this[key] = initial[key];
        }
      }
    }

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
