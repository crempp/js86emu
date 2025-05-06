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

    //-------------------------------------------------------------------------
    // Port B Interfacing lines
    //-------------------------------------------------------------------------

    /**
     * Timer Speaker Gate (Port B - Bit 0)
     *
     * This bit is connected to the programmable interval timer (PIT) second
     * channel which is used for the speaker. The way in which the gate
     * influences the counter depends on the counter mode. It will synchronize
     * the counter or inhibit counting or affect other behaviours.
     *
     * @type {number}
     */
    this.timer2GateSpk = 0;

    /**
     * Speaker Data (Port B - Bit 1)
     *
     * This bit is connected to the speaker output line and produces the speaker souned.
     *
     * @type {number}
     */
    this.spkrData = 0;

    /**
     * Switch 2 Read 1-4 or 5  (Port B - Bit 2)
     *
     * In the 5150, the second dip switch has 8 positions but is only connected
     * to 4 pins on the 8255. This bit toggles which switch positions are read
     * by the 8255. When the bit is high positions 1-4 are read, when the bit
     * is low position 5 is read. Note that positions 6-8 are not used.
     *
     * @type {number}
     */
    this.readSW1SW4OrSW5 = SW5;

    /**
     * Motor Off (Port B - Bit 3)
     *
     * This bit controls the cassette motor. When low the motor is on, when
     * high the motor is off.
     *
     * @type {number}
     */
    this.motorOff = 0;

    /**
     * Enable RAM Parity Check (Port B - Bit 4)
     *
     * This bit controls whether RAM parity check is performed. The signal is
     * active low so when the bit is low parity check is enabled, when the bit
     * is high parity check is disabled.
     *
     * @type {number}
     */
    this.enableRamParityChk = 0;

    /**
     * Enable IO Check (Port B - Bit 5)
     *
     * ?????? (Active Low)
     *
     * @type {number}
     */
    this.enableIOCk = 0;

    /**
     * Keyboard Clock Line Low (Port B - Bit 6)
     *
     * This bit will hold the keyboard clock line low. When the bit is low the
     * clock line will be held low. When the bit is high the keyboard clock
     * will behave normally, following the normal keyboard clock signal.
     *
     * @type {boolean}
     */
    this.holdKbdClkLow = true;

    /**
     * Port A Keyboard or DIP Switch 1 (Port B - Bit 7)
     *
     * In the 5150 the 8255 shares port A with both the keyboard and DIP switch
     * 1. This bit controls whether the keyboard or switch 1 is connected to
     * port A. If the bit is high the switch is connected, if the bit is low
     * the keyboard is connected.
     *
     * @type {number}
     */
    this.portAKeyboardOrDIP = KEYBOARD;

    //-------------------------------------------------------------------------
    // Port B Interfacing lines
    //-------------------------------------------------------------------------

    /**
     * CASS Data In (Port C - Bit 4)
     *
     * ??
     *
     * @type {number}
     */
    this.CassDataIn = 0;

    /**
     * Timer Counter Channel 2 Output (Port C - Bit 5)
     *
     * This bit is connected to the 8253 channel 2 timer output.
     *
     * @type {number}
     */
    this.TC2Out = 0;

    /**
     * IO Check (Port C - Bit 6)
     *
     * ???
     *
     * @type {number}
     */
    this.IOChk = 0;

    /**
     * Parity Check (Port C - Bit 7)
     *
     * ??? Leave as 0 always, shouldn't have errors
     *
     * @type {number}
     */
    this.parityChk = 0;
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
    this.holdKbdClkLow      = (this.portB >> 6) & 0x01;
    this.portAKeyboardOrDIP = (this.portB >> 7) & 0x01;

    this.system.io.devices["PIT8253"].setGate(2, this.timer2GateSpk);
    this.system.keyboard.setLine("clk", this.holdKbdClkLow);
    if (this.portAKeyboardOrDIP === 1) this.system.keyboard.clear();
  }

  boot() {}

  deviceCycle(){}
}
