import Device from "./Device";

export default class NullDevice extends Device{
  constructor (config, system) {
    super(config, system);
  }

  boot() {
    console.log(`  BOOT device: ${this.constructor.name}`);
  }

  write(port, value, size) {}

  read(port, size){}

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
