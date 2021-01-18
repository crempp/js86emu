export default class PIC8259 {
  constructor(config) {
    this.config = config;

    /** Interrupt Mask Register */
    this.IMR_PIC1 = 0b00000000;
    this.IMR_PIC2 = 0b00000000;
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
