import DMA8237 from "./devices/DMA8237";
import PIC8259 from "./devices/PIC8259";
import NullDevice from "./devices/NullDevice";
import TestDevice from "./devices/TestDevice";
import {InvalidDeviceException} from "./utils/Exceptions";

export default class IO {
  constructor (config) {
    // TODO: Move this to the system and pass devices in.
    const DEVICES = {
      null:      new NullDevice(config),
      "DMA8237": new DMA8237(config),
      "PIC8259": new PIC8259(config),
      // "VideoMDA": system.videoCard
      "TestDevice": new TestDevice(config)
    };

    this.config = config;

    this.devices = [];
    this.ports = new Array(this.config.ports.size);

    // Initialize ports with null (nothing attached)
    for (let i = 0; i < this.ports.length; i++) {
      this.registerPort(i, 'rw', DEVICES[null]);
    }

    // Register the defined ports from the ranges defined in the config
    // If range is empty leave it as a null device
    for (let i = 0; i < this.config.ports.devices.length; i++) {
      let rangeConfig = this.config.ports.devices[i];

      let device = DEVICES[null];
      if (rangeConfig.device !== null) {
        if (rangeConfig.device in DEVICES) {
          device = DEVICES[rangeConfig.device];
        }
        else {
          throw new InvalidDeviceException(`Unknown device - ${rangeConfig.device}`);
        }
      }
      this.registerDevice(device);

      if (rangeConfig.range.length === 1) {
        this.registerPort(rangeConfig.range[0], rangeConfig.dir, device);
      }
      else {
        for (let j = rangeConfig.range[0]; j <= rangeConfig.range[1]; j++){
          this.registerPort(j, rangeConfig.dir, device);
        }
      }
    }
  }

  registerPort (port, rw, device) {
    this.ports[port] = device
  }

  unRegisterPort(port) {
    this.ports[port] = new DEVICES["NULL"](this.config);
  }

  registerDevice(device) {
    if (!(device in this.devices)){
      this.devices.push(device);
    }
  }

  unRegisterDevice(device) {
    let index = this.devices.indexOf(device);
    if (index !== -1) {
      this.devices.splice(index, 1);
    }
  }

  write(port, value, size) {
    this.ports[port].write(port, value, size);
  }

  read(port, size) {
    return this.ports[port].read(port, size);
  }

  cycle() {
    // Loop through devices and run a cycle
    for(let i = 0; i < this.devices.length; i++) {
      this.devices[i].deviceCycle();
    }
  }
}
