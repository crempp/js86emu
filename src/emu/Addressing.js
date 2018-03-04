import winston from 'winston';

import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';
import {hexString16} from "./Debug";

export default class Addressing {
  constructor(cpu) {
    this.cpu = cpu;
    this.mem8 = cpu.mem8;
    this.mem16 = cpu.mem16;
  }

  // if (value || value === 0) {
  //   winston.log("debug", "addressing - Ib - set");
  // } else {
  //   winston.log("debug", "addressing - Ib - get");
  //   return 0
  // }

  AX () {
    winston.log("debug", "addressing - AX(" + value + ")");
  }
  AH () {
    winston.log("debug", "addressing - AH(" + value + ")");
  }
  AL () {
    winston.log("debug", "addressing - AL(" + value + ")");
  }
  BX () {
    winston.log("debug", "addressing - BX(" + value + ")");
  }
  BH () {
    winston.log("debug", "addressing - BH(" + value + ")");
  }
  BL () {
    winston.log("debug", "addressing - BL(" + value + ")");
  }
  CX () {
    winston.log("debug", "addressing - CX(" + value + ")");
  }
  CH () {
    winston.log("debug", "addressing - CH(" + value + ")");
  }
  CL () {
    winston.log("debug", "addressing - CL(" + value + ")");
  }
  DX () {
    winston.log("debug", "addressing - DX(" + value + ")");
  }
  DH () {
    winston.log("debug", "addressing - DH(" + value + ")");
  }
  DL () {
    winston.log("debug", "addressing - DL(" + value + ")");
  }

  SI () {
    winston.log("debug", "addressing - SI(" + value + ")");
  }
  DI () {
    winston.log("debug", "addressing - DI(" + value + ")");
  }
  BP () {
    winston.log("debug", "addressing - BP(" + value + ")");
  }
  SP () {
    winston.log("debug", "addressing - SP(" + value + ")");
  }

  CS () {
    winston.log("debug", "addressing - CS(" + value + ")");
  }
  DS () {
    winston.log("debug", "addressing - DS(" + value + ")");
  }
  ES () {
    winston.log("debug", "addressing - ES(" + value + ")");
  }
  SS () {
    winston.log("debug", "addressing - SS(" + value + ")");
  }

  Ap () {
    winston.log("debug", "addressing - Ap(" + value + ")");
  }
  Eb () {
    winston.log("debug", "addressing - Eb(" + value + ")");
  }
  Ev (value = null) {
    winston.log("debug", "addressing - Ev(" + value + ")");
    let addr = this.calcRMAddr();

    console.log("addr: ", addr);
    console.log("value: ", hexString16(this.readWordFromAddress(addr)));

    if (value || value === 0) return this.writeWordToAddress(addr, value);
    else return this.readWordFromAddress(addr);
  }
  Ew () {
    winston.log("debug", "addressing - Ew(" + value + ")");
  }
  Gb () {
    winston.log("debug", "addressing - Gb(" + value + ")");
  }
  Gv () {
    winston.log("debug", "addressing - Gv(" + value + ")");
  }
  I0 () {
    winston.log("debug", "addressing - I0(" + value + ")");
  }
  Ib () {
    winston.log("debug", "addressing - Ib(" + value + ")");
  }
  Iv (value = null) {
    winston.log("debug", "addressing - Iv(" + value + ")");
    // Immediate data. The operand value is encoded in subsequent bytes of the
    // instruction.


  }
  Iw () {
    winston.log("debug", "addressing - Iw(" + value + ")");
  }
  Jb () {
    winston.log("debug", "addressing - Jb(" + value + ")");
  }
  Jv () {
    winston.log("debug", "addressing - Jv(" + value + ")");
  }
  M () {
    winston.log("debug", "addressing - M(" + value + ")");
  }
  Mp () {
    winston.log("debug", "addressing - Mp(" + value + ")");
  }
  Ob () {
    winston.log("debug", "addressing - Ob(" + value + ")");
  }
  Ov () {
    winston.log("debug", "addressing - Ov(" + value + ")");
  }
  Sw () {
    winston.log("debug", "addressing - Sw(" + value + ")");
  }

  calcRMAddr () {
    winston.log("debug", "addressing - calcRMAddr()");
    let addr, disp;

    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        switch (this.cpu.opcode.rm)
        {
          case 0 : // [BX + SI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI];
            break;
          case 1 : // [BX + DI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI];
            break;
          case 2 : // [BP + SI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI];
            break;
          case 3 : // [BP + DI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI];
            break;
          case 4 : // [SI]
            addr = this.cpu.reg16[regSI];
            break;
          case 5 : // [DI]
            addr = this.cpu.reg16[regDI];
            break;
          case 6 : // Direct Address
            // Direct address is always 2 bytes
            //   - yoshicapstonememo.googlecode.com/svn/trunk/4_2_86.pdf
            addr = (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
              this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
            // TODO: I can make this simpler using mem16, test this.
            // addr = this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
            break;
          case 7 : // [BX]
            addr = this.cpu.reg16[regBX];
            break;
        }
        switch (this.cpu.opcode.w) {
          case 0:
            return (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
          case 1:
            return ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr + 1)] << 8) |
              this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
          // TODO: I can make this simpler using mem16, test this.
          // return this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)]
        }
        break;
      case 0b01:
        // Use R/M Table 2 with 8-bit displacement
        disp = this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
      case 0b10:
        // Use R/M Table 2 with 16-bit displacement
        disp = disp ||
          ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
            this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)] );
        // TODO: I can make this simpler using mem16, test this.
        // disp = disp || this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];

        switch (opcode.rm)
        {
          case 0 : // [BX + SI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI] + disp;
            break;
          case 1 : // [BX + DI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI] + disp;
            break;
          case 2 : // [BP + SI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI] + disp;
            break;
          case 3 : // [BP + DI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI] + disp;
            break;
          case 4 : // [SI]
            addr = this.cpu.reg16[regSI];
            break;
          case 5 : // [DI]
            addr = this.cpu.reg16[regDI];
            break;
          case 6 : // [BP]
            addr = this.cpu.reg16[regBP];
            break;
          case 7 : // [BX]
            addr = this.cpu.reg16[regBX];
            break;
        }
        break;
      case 0b11:
        // Two register instruction; use REG table
        addr = this.calcRegAddr();
        break;
    }
    return addr;
  }

  calcRegAddr () {
    winston.log("debug", "addressing - calcRegAddr()");
    let addr;

    switch (this.cpu.opcode.w) {
      case 0:
        switch (this.cpu.opcode.reg) {
          case 0b000:
            return this.cpu.reg8[regAL];
          case 0b001:
            return this.cpu.reg8[regCL];
          case 0b10:
            return this.cpu.reg8[regDL];
          case 0b011:
            return this.cpu.reg8[regBL];
          case 0b100:
            return this.cpu.reg8[regAH];
          case 0b101:
            return this.cpu.reg8[regCH];
          case 0b110:
            return this.cpu.reg8[regDH];
          case 0b111:
            return this.cpu.reg8[regBH];
        }
        break;
      case 1:
        switch (this.cpu.opcode.reg) {
          case 0b000:
            return this.cpu.reg16[regAX];
          case 0b001:
            return this.cpu.reg16[regCX];
          case 0b10:
            return this.cpu.reg16[regDX];
          case 0b011:
            return this.cpu.reg16[regBX];
          case 0b100:
            return this.cpu.reg16[regSP];
          case 0b101:
            return this.cpu.reg16[regBP];
          case 0b110:
            return this.cpu.reg16[regSI];
          case 0b111:
            return this.cpu.reg16[regDI];
        }
        break;
    }
  }

  writeWordToAddress (addr, value) {
    winston.log("debug", "addressing - writeWordToAddress(" + addr + ", " + value + ")");
    this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)] = (value);
  }

  readWordFromAddress (addr) {
    winston.log("debug", "addressing - readWordFromAddress(" + addr + ")");
    return ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr + 1)] << 8) |
             this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
    // TODO: I can make this simpler using mem16, test this.
    // return this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)]
  }

  writeByteToAddress (addr, value) {
    winston.log("debug", "addressing - writeByteToAddress(" + addr + ", " + value + ")");
    this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)] = (value & 0x00FF);
  }

  readByteFromAddress (addr) {
    winston.log("debug", "addressing - readByteFromAddress(" + addr + ")");
    return (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
  }

  seg2abs (segment, offset) {
    // Handle segment overrides
    if      (this.cpu.CS_OVERRIDE) segment = this._regCS;
    else if (this.cpu.DS_OVERRIDE) segment = this._regDS;
    else if (this.cpu.ES_OVERRIDE) segment = this._regES;
    else if (this.cpu.SS_OVERRIDE) segment = this._regSS;
    return (segment * 16) + offset;
  }
}
