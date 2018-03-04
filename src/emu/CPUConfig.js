/**
 * CPUConfig
 *
 * The CPU configuration class which serves as a container for CPU parameters.
 *
 */
import { CPUConfigException } from './Exceptions';

const DEFAULTS = {
  memorySize: 65536,
};

export default class CPUConfig {

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

  }

  validate() {
    if (typeof this.memorySize !== "number") throw new CPUConfigException("CPU Config Error - memory size is not an number");
    if (this.memorySize < 1024) throw new CPUConfigException("CPU Config Error - memory size too small");
    if (this.memorySize > 1048576) throw new CPUConfigException("CPU Config Error - memory size too large");
  }
}
