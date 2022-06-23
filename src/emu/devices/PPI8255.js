import Device from "./Device";
import {PortAccessException} from "../utils/Exceptions";

const OUTPUT = 0;
const INPUT  = 1;
const MODE0  = 0;
const MODE1  = 1;
const MODE2  = 2;
const MODE_SET_INACTIVE = 0;
const MODE_SET_ACTIVE = 1;

const KEYBOARD = 0;
const DIP      = 1;

const SW5    = 0;
const SW1SW4 = 1;


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
 *     * 0x62: Port C input (DIP Switch 2)
 *     * 0x63: Command/Mode control register
 *
 * Port C upper is not used
 *

 */
export default class PPI8255 extends Device{
  constructor (config, system) {
    super(config, system);
    this.PPIControlWordRegister = 0x00;
    // Port Buffers
    this.portA      = 0x00;
    this.portB      = 0x00;
    this.portCLower = 0x00;
    this.portCUpper = 0x00;

    // Broken out control flags
    this.grpAModeSelection = MODE0;
    this.grpBmodeSelection = MODE0;
    // On reset all ports are in INPUT mode
    this.portAInOut        = INPUT;
    this.portBInOut        = INPUT;
    this.portCLowerInOut   = INPUT;
    this.portCUpperInOut   = INPUT;
    this.modeSetFlag       = MODE_SET_INACTIVE;

    // Port B Interfacing lines         bit
    this.timer2GateSpk      = 0;        // 0
    this.spkrData           = 0;        // 1
    this.readSW1SW4OrSW5    = SW5;      // 2
    this.motorOff           = 0;        // 3
    this.enableRamParityChk = 0;        // 4 (Active Low)
    this.enableIOCk         = 0;        // 5 (Active Low)
    this.holdKbbClkLow      = true;     // 6 (Active Low)
    this.portAKeyboardOrDIP = KEYBOARD; // 7

    // Port C Interfacing lines  bit
    this.CassDataIn    = 0;      // 4
    this.TC2Out        = 0;      // 5
    this.IOChk         = 0;      // 6
    this.parityChk     = 0;      // 7 (Leave as 0 always, shouldn't have errors)
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
          this.decodeAndApplyPortB();
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
        //                Control Word
        // +----+----+----+----+----+----+----+----+
        // | D7 | D6 | D5 | D4 | D3 | D2 | D1 | D0 |
        // +----+----+----+----+----+----+----+----+
        //         / D0: Port C Lower [1 = Input, 0 = Output]
        //   Grp B | D1: Port B [1 = Input, 0 = Output]
        //         \ D2: Mode Selection [0 = Mode 0, 1 = Mode 1]
        //         / D3: Port C Upper [1 = Input, 0 = Output]
        //         | D4: Port A [1 = Input, 0 = Output]
        //   Grp A | D5: | Mode Selection [00 = Mode 0,
        //         \ D6: |    01 = Mode 1, 1X = Mode 2]
        //           D7: Mode Set Flag [1 = Active]
          // 1 00 1   1 0 0 1
        this.PPIControlWordRegister = value;

        this.portCLowerInOut   = value & 0x1;
        this.portBInOut        = (value >> 1) & 0x1;
        this.grpBmodeSelection = (value >> 2) & 0x1;
        this.portCUpperInOut   = (value >> 3) & 0x1;
        this.portAInOut        = (value >> 4) & 0x1;
        this.modeSetFlag       = (value >> 7) & 0x1;

        switch ((value >> 5) & 0x3) {
          case 0:
            this.grpAModeSelection = MODE0;
            break;
          case 1:
            this.grpAModeSelection = MODE1;
            break;
          case 2:
          case 3:
            this.grpAModeSelection = MODE2;
            break;
        }
        break;
    }
  }

  read(port, size){
    let value = 0x00;
    switch (port) {
      case 0x60: // Port A
        if (this.grpAModeSelection === MODE0 && this.portAInOut === INPUT) {
          //
          if (this.portAKeyboardOrDIP === DIP) {
            value = this.config.jumpers.sw1;
          } else {
            if (this.system.keyboard) {
              value = this.system.keyboard.buffer;
            }
            else {
              value = 0;
            }
          }
        }
        break;
      case 0x61: // Port B
        if (this.grpBmodeSelection === MODE0 && this.portBInOut === INPUT) {
          // TODO: Should not read port B in XT machines. Should we throw an error?
          value = this.portB;
        }
        break;
      case 0x62: // Port C
        if (this.grpAModeSelection === MODE0 && this.portCUpperInOut === INPUT) {
          let nibble = 0x0;
          nibble |= this.CassDataIn;
          nibble |= this.TC2Out    << 1;
          nibble |= this.IOChk     << 2;
          nibble |= this.parityChk << 3;
          value |= nibble << 4;
        }
        if (this.grpBmodeSelection === MODE0 && this.portCLowerInOut === INPUT) {
          // NOTE: The switch lower and upper nibbles are cross-connected.
          //       switch 5 however is connected to readSW1SW4OrSW5 through
          //       circuitry and looks like it could conflict with switch 1.
          //       not sure how to handle this.
          value |= ((this.config.jumpers.sw2 >> 4) & 0xF);
        }
        break;
      case 0x63:
        throw new PortAccessException("Read from write-only port");
    }
    return value;
  }

  decodeAndApplyPortB() {
    this.timer2GateSpk      = this.portB & 0x01;
    this.spkrData           = (this.portB >> 1) & 0x01;
    this.readSW1SW4OrSW5    = (this.portB >> 2) & 0x01;
    this.motorOff           = (this.portB >> 3) & 0x01;
    this.enableRamParityChk = (this.portB >> 4) & 0x01;
    this.enableIOCk         = (this.portB >> 5) & 0x01;
    this.holdKbbClkLow      = (this.portB >> 6) & 0x01;
    this.portAKeyboardOrDIP = (this.portB >> 7) & 0x01;

    this.system.io.devices["PIT8253"].setGate(2, this.timer2GateSpk);
    this.system.keyboard.setLine("clk", this.holdKbbClkLow);
    if (this.portAKeyboardOrDIP === 1) this.system.keyboard.clear();
  }

  boot() {}

  deviceCycle(){}
}
