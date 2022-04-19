import {InvalidDeviceException, PortAccessException} from "./utils/Exceptions";

// We don't know the renderer or devices until runtime. Webpack is a static
// compiler and thus can't require dynamically. Also, I was having issues with
// dynamic imports in node though it should work.
// ...so import all renderers/device and look them up in the object at runtime.
// Someday I will do more research to see if I can optimize this.
import NullDevice from "./devices/NullDevice";
import DMA8237 from "./devices/DMA8237";
import PIC8259 from "./devices/PIC8259";
import VideoMDA from "./devices/VideoMDA";
import NMIMaskRegister from "./devices/NMIMaskRegister";
import TestDevice from "./devices/TestDevice";
import PPI8255 from "./devices/PPI8255";
import {hexString16} from "./utils/Debug";
import {b} from "./Constants";


// https://bochs.sourceforge.io/techspec/PORTS.LST
/**
 * The IO system creates an array mapping port numbers with device in
 */
export default class IO {
  constructor (config, system, availableDevices = null) {
    this.config = config;
    this.system = system;

    // I think this must happen after creating the CPU
    if (availableDevices !== null) {
      this.availableDevices = availableDevices
    }
    else {
      this.availableDevices = {
        "DMA8237": new DMA8237(config, this.system),
        "PIC8259": new PIC8259(config, this.system),
        "PPI8255": new PPI8255(config, this.system),
        "VideoMDA": new VideoMDA(config, this.system),
        "NMIMaskRegister": new NMIMaskRegister(config, this.system),
        "TestDevice": new TestDevice(config, this.system),
      };
    }
    // always have the null device available
    this.availableDevices[null] = new NullDevice(config, this.system);

    this.devices = [];
    this.ports = new Array(this.config.ports.size);

    // Initialize ports with null (nothing attached)
    for (let i = 0; i < this.ports.length; i++) {
      this.registerPort(i, 'rw', this.availableDevices[null]);
    }

    // Register the defined ports from the ranges defined in the config
    // If range is empty leave it as a null device
    for (let i = 0; i < this.config.ports.devices.length; i++) {
      let rangeConfig = this.config.ports.devices[i];

      let device = this.availableDevices[null];
      if (rangeConfig.device !== null) {
        if (rangeConfig.device in this.availableDevices) {
          device = this.availableDevices[rangeConfig.device];
        }
        else {
          throw new InvalidDeviceException(`Unknown device - ${rangeConfig.device}`);
        }
      }
      this.registerDevice(rangeConfig.device, device);

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

  boot() {
    for(let i = 0; i < this.devices.length; i++) {
      this.devices[i].boot();
    }
  }

  registerPort (port, rw, device) {
    this.ports[port] = device;
  }

  unRegisterPort(port) {
    this.ports[port] = this.availableDevices[null];
  }

  registerDevice(name, device) {
    if (!(name in this.devices)){
      this.devices[name] = device;
    }
  }

  unRegisterDevice(device) {
    delete this.devices[name];
  }

  write(port, value, size) {
    if (this.ports[port] === undefined) {
      throw new PortAccessException("I/O port undefined. Check your SystemConfiguration");
    }

    this.ports[port].write(port, value, size);

    if (this.config.debug) {
      console.log(`  WRITE device: ${this.ports[port].constructor.name} port: ${hexString16(port)}, value:${hexString16(value)}, size: ${(size === b)? 'b': 'w'}`);
    }
  }

  read(port, size) {
    if (this.ports[port] === undefined) {
      throw new PortAccessException("I/O port undefined. Check your SystemConfiguration");
    }

    let value = this.ports[port].read(port, size);

    if (this.config.debug) {
      console.log(`  READ device: ${this.ports[port].constructor.name} port: ${hexString16(port)}, value:${hexString16(value)}, size: ${(size === b)? 'b': 'w'}`);
    }

    return value;
  }

  cycle() {
    // Loop through devices and run a cycle
    for(let i = 0; i < this.devices.length; i++) {
      this.devices[i].deviceCycle();
    }
  }
}
