import Device from "./Device";

export default class PIC8259 extends Device{
  constructor(config, system) {
    super(config, system);

    /** Interrupt Mask Register */
    this.IMR_PIC1 = 0b00000000;
    this.IMR_PIC2 = 0b00000000;
  }

  boot() {}

  write(port, value, size) {

  }

  read(port, size){
    let value = 0xFF;
    return value;
  }

  deviceCycle() {}

  setIRQ(irqNumber) {

  }
}
