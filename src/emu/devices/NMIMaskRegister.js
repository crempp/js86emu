import Device from "./Device";
import {PortAccessException} from "../utils/Exceptions";

/**
 * The NMI Mask Register enables and disables non-maskable interupts. This is
 * controlled by writing values to port 0xA0.
 *
 *   * Write 0x80 (bit 7 is 1) to enable NMI
 *   * Write 0x00 to disable NMI
 */
export default class NMIMaskRegister extends Device {
  constructor(config, system) {
    super(config, system);

    this.NMIMaskRegister = 0x0000;
  }

  boot() {}

  write(port, value, size) {
    this.NMIMaskRegister = value & 0x80;
  }

  read(port, size) {
    throw new PortAccessException("NMI Mask Register is write-only");
  }

  deviceCycle() {}

  isMasked() {
    return (this.NMIMaskRegister === 0x80);
  }
}


