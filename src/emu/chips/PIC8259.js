export default class PIC8259 {
  constructor(system) {
    this.system = system;

    /** Interrupt Mask Register */
    this.IMR_PIC1 = 0b00000000;
    this.IMR_PIC2 = 0b00000000;
  }
}
