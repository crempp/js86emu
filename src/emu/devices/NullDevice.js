export default class NullDevice {
  constructor (config) {
    this.config = config;
  }

  write(port, value, size) {
    if (this.config.debug) {
      console.log(`  WRITE device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
  }

  read(port, size){
    let value = 0xFF;
    if (this.config.debug) {
      console.log(`  READ device: ${this.constructor.name} port: ${port}, value:${value}, size${size}`);
    }
    return value;
  }

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
