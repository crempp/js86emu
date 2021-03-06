import { b, w } from '../Constants';

class TestDevice {
  constructor (config) {
    this.config = config;
    this.buffer8 = new Uint8Array(0xFFFF);
    this.buffer16 = new Uint16Array(0xFFFF);
    for (let i = 0; i < this.buffer8.length; i++) {
      this.buffer8[i] = 0;
    }
    for (let i = 0; i < this.buffer16.length; i++) {
      this.buffer16[i] = 0;
    }
  }

  write(port, value, size) {
    if (size === b) {
      this.buffer8[port] = value;
    }
    else if (size === w) {
      this.buffer16[port] = value;
    }
  }

  read(port, size){
    if (size === b) {
      return this.buffer8[port];
    }
    else if (size === w) {
      return this.buffer16[port];
    }
  }

  deviceCycle(){}
}

export default TestDevice
