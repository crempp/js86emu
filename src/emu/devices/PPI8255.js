import Device from "./Device";
import {PortAccessException} from "../utils/Exceptions";

const OUTPUT = 0;
const INPUT  = 1;
const MODE0  = 0;
const MODE1  = 1;
const MODE2  = 2;
const MODE_SET_INACTIVE = 0;
const MODE_SET_ACTIVE = 1;

/**
 * Programmable Peripheral Interface (8255)
 *
 * The PPI provides 24 I/O pins for general purpose use. The IBM 5150 uses
 * these pins to interface with:
 *    * PC speaker
 *    * Floppy motor (on/off)
 *    * DIP switches
 *    * Keyboard
 *
 * The 24 I/O pins may be individually programmed in 2 groups of different
 * configurations of input or output modes. This is controlled by the control
 * register.
 *
 * The PPI on the 5150 listens to four I/O ports
 *     * 0x60: Port A input/output (keyboard, DIP Switch 1)
 *     * 0x61: Port B output (PC speaker, floppy motor, other mysteries)
 *     * 0x62: Port C lower (DIP Switch 2)
 *     * 0x63: Command/Mode control register
 *
 * Port C upper is not used
 *
 *                Control Word
 * +----+----+----+----+----+----+----+----+
 * | D7 | D6 | D5 | D4 | D3 | D2 | D1 | D0 |
 * +----+----+----+----+----+----+----+----+
 *         / D0: Port C Lower [1 = Input, 0 = Output]
 *   Grp B | D1: Port B [1 = Input, 0 = Output]
 *         \ D2: Mode Selection [0 = Mode 0, 1 = Mode 1]
 *         / D3: Port C Upper [1 = Input, 0 = Output]
 *         | D4: Port A [1 = Input, 0 = Output]
 *   Grp A | D5: | Mode Selection [00 = Mode 0,
 *         \ D6: |    01 = Mode 1, 1X = Mode 2]
 *           D7: Mode Set Flag [1 = Active]
 */
export default class PPI8255 extends Device{
  constructor (config, system) {
    super(config, system);
    this.PPIControlWordRegister = 0x00;

    // Broken out control flags
    this.grpAModeSelection = MODE0;
    this.grpBmodeSelection = MODE0;
    // On reset all ports are in INPUT mode
    this.portAInOut        = INPUT;
    this.portBInOut        = INPUT;
    this.portCLowerInOut   = INPUT;
    this.portCUpperInOut   = INPUT;
    this.modeSetFlag       = MODE_SET_INACTIVE;

    // Port Buffers
    this.portA      = 0x00;
    this.portB      = 0x00;
    this.portCLower = 0x00;
    this.portCUpper = 0x00;
  }

  boot() {
    console.log(`  BOOT device: ${this.constructor.name}`);
  }

  write(port, value, size) {
    switch (port) {
      case 0x60: // Port A
        if (this.grpAModeSelection === MODE0 && this.portAInOut === OUTPUT) {
          this.portA = value;
        }
        break;
      case 0x61: // Port B
        if (this.grpBmodeSelection === MODE0 && this.portBInOut === OUTPUT) {
          this.portB = value;
        }
        break;
      case 0x62: // Port C
        if (this.grpAModeSelection === MODE0 && this.portCUpperInOut === OUTPUT) {
          this.portCUpper = value >> 4;
        }
        if (this.grpBmodeSelection === MODE0 && this.portCLowerInOut === OUTPUT) {
          this.portCLower = value & 0xF;
        }
        break;
      case 0x63:
        this.PPIControlWordRegister = value;
        this.grpBmodeSelection      = value & 0x4  >> 2;
        this.portAInOut             = value & 0x10 >> 4;
        this.portBInOut             = value & 0x2  >> 1;
        this.portCLowerInOut        = value & 0x1;
        this.portCUpperInOut        = value & 0x8  >> 3;
        this.modeSetFlag            = value & 0x80 >> 7;
        if ((value & 0x60) >> 5 === 0) this.grpAModeSelection = MODE0;
        else if ((value & 0x60) >> 5 === 1) this.grpAModeSelection = MODE1;
        else this.grpAModeSelection = MODE2;
        break;
    }
  }

  read(port, size){
    let value = 0x00;
    switch (port) {
      case 0x60: // Port A
        if (this.grpAModeSelection === MODE0 && this.portAInOut === INPUT) {
          value = this.portA;
        }
        break;
      case 0x61: // Port B
        if (this.grpBmodeSelection === MODE0 && this.portBInOut === INPUT) {
          value = this.portB;
        }
        break;
      case 0x62: // Port C
        if (this.grpAModeSelection === MODE0 && this.portCUpperInOut === INPUT) {
          value |= this.portCUpper << 4;
        }
        if (this.grpBmodeSelection === MODE0 && this.portCLowerInOut === INPUT) {
          value |= this.portCLower;
        }
        break;
      case 0x63:
        throw new PortAccessException("Read from write-only port");
    }
    return value;
  }

  deviceCycle(){
    if (this.config.debug) {
      console.log(`  CYCLE device: ${this.constructor.name}`);
    }
  }
}
