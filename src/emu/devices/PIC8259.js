/**
 *  0  RAM REFRESH & CLOCK TICK
 *  1  KEYBOARD INTERFACE
 *  2  EGA VIDEO (some interface cards have the option of using an IRQ)
 *  3  COM2 (also COM4)
 *  4  COM1 (also COM3)
 *  5  HARD DISK (PC/XT type computer only)
 *  6  FLOPPY DISK
 *  7  PARALLEL PRINTER PORT LPT 1
 */

import Device from "./Device";
import {FLAG_IF_MASK, PIN_HIGH, regCS, regFlags, regIP} from "../Constants";
import {FeatureNotImplementedException} from "../utils/Exceptions";

// singleCascadeMode
const CASCADE = 0;
const SINGLE = 1;
// triggeredMode
const EDGE = 0;
const LEVEL = 1;
// procMode
const PROC_MCS80 = 0;
const PROC_8086 = 1;
// EOIMode
const NORMAL_EOI = 0;
const AUTO_EOI = 1;
// masterSlave
const MASTER = 1;
const SLAVE = 0;
// Initialization State
const NONE = 0;
const ICW1_COMPLETED = 1;
const ICW2_COMPLETED = 2;
const ICW3_COMPLETED = 3;
const ICW4_COMPLETED = 4;
const READY          = 5;
// Read Register Commands
const NO_COMMAND = 0
const READ_IR_REG_ON_NEXT_PULSE = 1;
const READ_IS_REG_ON_NEXT_PULSE = 2;
// Special Mask Mode
const NO_MODE = 0;
const RESET_SPECIAL_MASK = 1;
const SET_SPECIAL_MASK = 2;

export default class PIC8259 extends Device{
  constructor(config, system) {
    super(config, system);

    this.state = NONE;
    this.interruptMask = 0x00;
    this.vectorByte = 0x00;

    this.ICW4Needed         = false;
    this.singleCascadeMode  = SINGLE;
    this.IVTInterval        = 8;
    this.triggeredMode      = EDGE;
    this.procMode           = PROC_8086;
    this.EOIMode            = NORMAL_EOI;
    this.masterSlave        = SLAVE;
    this.buffered           = false;
    this.specialFullyNested = false;

    this.interruptLevel = 0;
    this.rotate = false;
    this.selectLevel = 0;
    this.readRegCommand = NO_COMMAND;
    this.pollCommand = false;
    this.specialMaskMode = NO_MODE;
  }

  write(port, value, size) {
    switch (port) {
      case 0x20: // Master PIC command port
        let bit3 = (value >> 3) & 0x1;
        let bit4 = (value >> 4) & 0x1;

        if (bit4 === 1) {
          //===================================================================
          // ICW1
          //     ---|------|--------------
          //     D0 | IC4  | 1=IC4 needed, 0=No IC4 needed
          //     D1 | SNGL | 1=Single, 0=Cascade mode
          //     D2 | ADI  | 1=Interval of 4, 0=Interval of 8
          //     D3 | LTIM | 1=Level triggered, 0=Edge triggered
          //     D4 |  1   |
          //     D5 |  A5  | \
          //     D6 |  A6  | | A5-A7 of Int vector address (MCS-80/85 only)
          //     D7 |  A7  | /
          //     A1 |  0
          //
          // TODO:
          //   * If D4 = 1 then this is ICW1
          //   * clear interruptMaskRegister
          //   * IR7 input is assigned priority 7
          //   * The slave mode address is set to 7 (?)
          //   * Special Mask Mode is cleared and Status Read is set to IRR
          //   * If IC4 = 0 then all functions selected in ICW4 are set to zero (Non-Buffered mode* no Auto-EOI, MCS-80, 85 system)
          //===================================================================

          this.ICW4Needed = (value & 0x1) === 1;
          this.singleCascadeMode = (value >> 1) & 0x1;
          this.IVTInterval = ((value >> 2) & 0x1 === 0) ? 8 : 4
          this.triggeredMode = (value >> 3) & 0x1;

          // Update the initialization state
          this.state = ICW1_COMPLETED;
        }

        else if (bit3 === 0 && bit4 === 0) {
          //===================================================================
          // OCW2
          //
          //     ---|------|--------------
          //     D0 | L0   | \
          //     D1 | L1   | | Int level to act on when SL set
          //     D2 | l2   | /
          //     D3 |  0   |
          //     D4 |  0   |
          //     D5 | EOI  | End Of Interrupt Mode
          //     D6 |  SL  | Select-Level
          //     D7 |  R   | Rotate
          //===================================================================

          this.interruptLevel = (value & 0x7);
          this.EOIMode = ((value >> 5) & 0x1 === 0 ? AUTO_EOI : NORMAL_EOI);
          this.selectLevel = (value >> 6) & 0x1;
          this.rotate = (!((value >> 7) & 0x1 === 0));
        }

        else if (bit3 === 1 && bit4 === 0) {
          //===================================================================
          // OCW3
          //
          //     ---|------|--------------
          //     D0 | RIS  | \ Read Register Command
          //     D1 | RR   | /
          //     D2 | P    | Poll Command
          //     D3 |  1   |
          //     D4 |  0   |
          //     D5 | SMM  | \ Special Mask Mode
          //     D6 | ESMM | /
          //     D7 |  0   |
          //===================================================================

          this.readRegCommand = (value & 3);
          this.pollCommand = !((value >> 2) & 0x1 === 0);
          this.specialMaskMode = (value >> 5) & 0x3;
        }
        break;
      case 0x21: // Master PIC data port
        if (this.state === ICW1_COMPLETED) {
          //===================================================================
          // ICW2
          //
          // The 5 most significant bits (D3-D7) form the 5 most significant
          // bits of the vector.
          //
          //     ---|------|--------------
          //     D0 |   X  | Doesn't matter
          //     D1 |   X  | Doesn't matter
          //     D2 |   X  | Doesn't matter
          //     D3 |  V3  |
          //     D4 |  V4  |
          //     D5 |  V5  |
          //     D6 |  V6  |
          //     D7 |  V7  |
          //===================================================================

          this.vectorByte = (value & 0xF8);

          // Update the initialization state
          if (this.ICW4Needed) this.state = ICW2_COMPLETED;
          else this.state = READY;
        }
        else if (this.singleCascadeMode === 0) {
          //===================================================================
          // ICW3
          //
          //   We can skip because this it's only used with more than one PIC
          //   in cascade mode and ATM we just emulate a single PIC
          //   In fact, it's currently an error if we reach this code path.
          //===================================================================

          this.debug.error("ERROR, Recieved a PIC initialization command word" +
              " 3, this is only supported in systems with more than one PIC," +
              " which this system does not have.");
        }
        else if (this.state === ICW2_COMPLETED) {
          //===================================================================
          // ICW4
          //
          //     ---|------|--------------
          //     D0 | mPM  | 1=8086/88 mode, 0=MCS-80/85 mode
          //     D1 | AEOI | 1=Auto EOI, 0=Normal EOI
          //     D2 | M/S  | \ 0X=Non-buffered mode, 10=Buffered, slave
          //     D3 | BUF  | / 11=Buffered, master
          //     D4 | SFNM | 1=Special fully nested mode, 0=Not special fully nested
          //     D5 |  0   | Must be 0
          //     D6 |  0   | Must be 0
          //     D7 |  0   | Must be 0
          //===================================================================
          this.procMode    = value & 0x1;
          this.EOIMode     = (value >> 1) & 0x1;
          this.masterSlave = (value >> 2) & 0x1;
          this.buffered    = ((value >> 3) & 0x1) === 1;
          this.specialFullyNested = ((value >> 4) & 0x1) === 1;

          // Update the initialization state
          this.state = READY;
        }
        else {
          //===================================================================
          // OCW1
          //===================================================================
          this.interruptMask = value & 0xFF;
        }
        break;
    }
  }

  read(port, size){
    switch (port) {
      case 0x20: // Master PIC command port
        throw new FeatureNotImplementedException("Reading from port 0x20 is not implemented");
      case 0x21:
        return this.interruptMask;
    }

  }

  /**
   * Trigger an IRQ event on the CPU
   *
   * TODO: Implement prioritization and special modes
   *
   * @param irqNumber IRQ number to trigger
   */
  triggerIRQ(irqNumber) {
    let isFlagMasked = (this.system.cpu.reg16[regFlags] & FLAG_IF_MASK) === 0;
    let isPICMasked = (this.interruptMask & (2**irqNumber)) !== 0 ;
    if (isFlagMasked || isPICMasked) {
      this.system.debug.info(`MASKED INT: ${irqNumber}`);
    }
    else {
      this.system.debug.info(`INT:${irqNumber}`);
      let vector = (this.vectorByte + irqNumber) * 4;
      this.system.cpu.int(irqNumber,
          (this.system.cpu.mem8[vector + 1] << 8) + this.system.cpu.mem8[vector],
          (this.system.cpu.mem8[vector + 3] << 8) + this.system.cpu.mem8[vector + 2]);
    }
  }

  timerHandler(value) {
    this.debug.info(`  PIC8259:timerHandler(${value})`);
    if (value === PIN_HIGH) {
      this.triggerIRQ(0);
    }
  }

  boot() {
    this.system.io.devices["PIT8253"].registerChannelLister(0, this.timerHandler.bind(this));
  }

  deviceCycle() {}
}
