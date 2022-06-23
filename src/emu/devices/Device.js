/**
 * A Device is an I/O device with port-based I/O. This includes chips on the
 * mainboard. This also includes add-on cards but these inherit from Card which
 * inherit from Device.
 */
export default class Device {
  constructor(config, system) {
    this.config = config;
    this.system = system;
    this.debug = this.system.debug;
  }

  write(port, value, size) {
    throw new Error("Method not implemented in Device sub-class");
  }

  read(port, size) {
    throw new Error("Method not implemented in Device sub-class");
  }

  deviceCycle() {
    throw new Error("Method not implemented in Device sub-class");
  }

  boot() {
    throw new Error("Method not implemented in Device sub-class");
  }
}