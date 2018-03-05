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

  AX (value = null) {
    winston.log("debug", "Addressing.AX()          : (value=" + hexString16(value) + ")");
  }
  AH (value = null) {
    winston.log("debug", "Addressing.AH()          : (value=" + hexString16(value) + ")");
  }
  AL (value = null) {
    winston.log("debug", "Addressing.AL()          : (value=" + hexString16(value) + ")");
  }
  BX (value = null) {
    winston.log("debug", "Addressing.BX()          : (value=" + hexString16(value) + ")");
  }
  BH (value = null) {
    winston.log("debug", "Addressing.BH()          : (value=" + hexString16(value) + ")");
  }
  BL (value = null) {
    winston.log("debug", "Addressing.BL()          : (value=" + hexString16(value) + ")");
  }
  CX (value = null) {
    winston.log("debug", "Addressing.CX()          : (value=" + hexString16(value) + ")");
  }
  CH (value = null) {
    winston.log("debug", "Addressing.CH()          : (value=" + hexString16(value) + ")");
  }
  CL (value = null) {
    winston.log("debug", "Addressing.CL()          : (value=" + hexString16(value) + ")");
  }
  DX (value = null) {
    winston.log("debug", "Addressing.DX()          : (value=" + hexString16(value) + ")");
  }
  DH (value = null) {
    winston.log("debug", "Addressing.DH()          : (value=" + hexString16(value) + ")");
  }
  DL (value = null) {
    winston.log("debug", "Addressing.DL()          : (value=" + hexString16(value) + ")");
  }

  SI (value = null) {
    winston.log("debug", "Addressing.SI()          : (value=" + hexString16(value) + ")");
  }
  DI (value = null) {
    winston.log("debug", "Addressing.DI()          : (value=" + hexString16(value) + ")");
  }
  BP (value = null) {
    winston.log("debug", "Addressing.BP()          : (value=" + hexString16(value) + ")");
  }
  SP (value = null) {
    winston.log("debug", "Addressing.SP()          : (value=" + hexString16(value) + ")");
  }

  CS (value = null) {
    winston.log("debug", "Addressing.CS()          : (value=" + hexString16(value) + ")");
  }
  DS (value = null) {
    winston.log("debug", "Addressing.DS()          : (value=" + hexString16(value) + ")");
  }
  ES (value = null) {
    winston.log("debug", "Addressing.ES()          : (value=" + hexString16(value) + ")");
  }
  SS (value = null) {
    winston.log("debug", "Addressing.SS()          : (value=" + hexString16(value) + ")");
  }

  Ap (value = null) {
    winston.log("debug", "Addressing.Ap()          : (value=" + hexString16(value) + ")");
  }
  Eb (value = null) {
    winston.log("debug", "Addressing.Eb()          : (value=" + hexString16(value) + ")");

    let result;
    let segment = this.cpu.reg16[regCS];
    if (value || value === 0) result = this.writeRMReg8(segment, value);
    else result = this.readRMReg8(segment);

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 1;
    return result;
  }
  Ev (value = null) {
    winston.log("debug", "Addressing.Ev()          : (value=" + hexString16(value) + ")");

    let result;
    let segment = this.cpu.reg16[regCS];
    if (value || value === 0) result = this.writeRMReg16(segment, value);
    else result = this.readRMReg16(segment);

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 1;
    return result;
  }
  Ew (value = null) {
    winston.log("debug", "Addressing.Ew()          : (value=" + hexString16(value) + ")");
  }
  Gb (value = null) {
    winston.log("debug", "Addressing.Gb()          : (value=" + hexString16(value) + ")");
  }
  Gv (value = null) {
    winston.log("debug", "Addressing.Gv()          : (value=" + hexString16(value) + ")");
  }
  I0 (value = null) {
    winston.log("debug", "Addressing.I0()          : (value=" + hexString16(value) + ")");
  }
  Ib (value = null) {
    winston.log("debug", "Addressing.Ib()          : (value=" + hexString16(value) + ")");
    let result;
    let segment = this.cpu.reg16[regCS];
    let offset = this.calcImmAddr(segment);

    if (value || value === 0) result = this.writeMem8(segment, offset, value);
    else result = this.readMem8(segment, offset);

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 2;
    return result;
  }
  Iv (value = null) {
    winston.log("debug", "Addressing.Iv()          : (value=" + hexString16(value) + ")");
    let result;
    let segment = this.cpu.reg16[regCS];
    let offset = this.calcImmAddr(segment);

    if (value || value === 0) result = this.writeMem16(segment, offset, value);
    else result = this.readMem16(segment, offset);

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 2;
    return result;
  }
  Iw (value = null) {
    winston.log("debug", "Addressing.Iw()          : (value=" + hexString16(value) + ")");
  }
  Jb (value = null) {
    winston.log("debug", "Addressing.Jb()          : (value=" + hexString16(value) + ")");
  }
  Jv (value = null) {
    winston.log("debug", "Addressing.Jv()          : (value=" + hexString16(value) + ")");
  }
  M (value = null) {
    winston.log("debug", "Addressing.M()          : (value=" + hexString16(value) + ")");
  }
  Mp (value = null) {
    winston.log("debug", "Addressing.Mp()          : (value=" + hexString16(value) + ")");
  }
  Ob (value = null) {
    winston.log("debug", "Addressing.Ob()          : (value=" + hexString16(value) + ")");
  }
  Ov (value = null) {
    winston.log("debug", "Addressing.Ov()          : (value=" + hexString16(value) + ")");
  }
  Sw (value = null) {
    winston.log("debug", "Addressing.Sw()          : (value=" + hexString16(value) + ")");
  }

  calcRMAddr () {
    winston.log("debug", "Addressing.calcRMAddr()  : ()");
    let addr;

    switch (this.cpu.opcode.rm)
    {
      case 0b000 : // [BX + SI]
        addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI];
        break;
      case 0b001 : // [BX + DI]
        addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI];
        break;
      case 0b010 : // [BP + SI]
        addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI];
        break;
      case 0b011 : // [BP + DI]
        addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI];
        break;
      case 0b100 : // [SI]
        addr = this.cpu.reg16[regSI];
        break;
      case 0b101 : // [DI]
        addr = this.cpu.reg16[regDI];
        break;
      case 0b110 : // Direct Address
        // Direct address is always 2 bytes
        //   - yoshicapstonememo.googlecode.com/svn/trunk/4_2_86.pdf
        addr = (this.cpu.mem8[this.seg2abs(regCS, this.cpu.reg16[regIP] + 3)] << 8) |
          this.cpu.mem8[this.seg2abs(regCS, this.cpu.reg16[regIP] + 2)];
        // TODO: I can make this simpler using mem16, test this.
        // addr = this.cpu.mem16[this.seg2abs(regCS, this.cpu.reg16[regIP] + 2)];
        break;
      case 0b111 : // [BX]
        addr = this.cpu.reg16[regBX];
        break;
    }
    switch (this.cpu.opcode.w) {
      case 0:
        return (this.cpu.mem8[this.seg2abs(regCS, addr)]);
      case 1:
        return ((this.cpu.mem8[this.seg2abs(regCS, addr + 1)] << 8) |
          this.cpu.mem8[this.seg2abs(regCS, addr)]);
      // TODO: I can make this simpler using mem16, test this.
      // return this.cpu.mem16[this.seg2abs(regCS, addr)]
    }
  }

  calcRMDispAddr () {
    winston.log("debug", "Addressing.calcRMDispAddr() : ()");
    let addr;

    switch (this.cpu.opcode.mod) {
      case 0b01: // Use R/M Tablae 2 with 8-bit displacement
        disp = this.cpu.mem8[this.seg2abs(regCS, this.cpu.reg16[regIP] + 2)];
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        disp = disp ||
          ((this.cpu.mem8[this.seg2abs(regCS, this.cpu.reg16[regIP] + 3)] << 8) |
            this.cpu.mem8[this.seg2abs(regCS, this.cpu.reg16[regIP] + 2)] );
        // TODO: I can make this simpler using mem16, test this.
        // disp = disp || this.cpu.mem16[this.seg2abs(regCS, this.cpu.reg16[regIP] + 2)];

        switch (opcode.rm)
        {
          case 0b000 : // [BX + SI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI] + disp;
            break;
          case 0b001 : // [BX + DI]
            addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI] + disp;
            break;
          case 0b010 : // [BP + SI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI] + disp;
            break;
          case 0b011 : // [BP + DI]
            addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI] + disp;
            break;
          case 0b100 : // [SI]
            addr = this.cpu.reg16[regSI];
            break;
          case 0b101 : // [DI]
            addr = this.cpu.reg16[regDI];
            break;
          case 0b110 : // [BP]
            addr = this.cpu.reg16[regBP];
            break;
          case 0b111 : // [BX]
            addr = this.cpu.reg16[regBX];
            break;
        }
        break;
    }
  }

  calcImmAddr (segment) {
    winston.log("debug", "Addressing.calcImmAddr() : ()");
    return this.seg2abs(segment, this.cpu.reg16[regIP] + this.cpu.cycleIP);
  }

  readRMReg8 (segment) {
    winston.log("debug", "Addressing.readRMReg8()  : ()");
    let offset;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        offset = this.calcRMAddr();
        return this.readMem8(segment, offset);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        offset = this.calcRMDispAddr();
        return this.readMem8(segment, offset);
      case 0b11: // Two register instruction; use REG table
        return this.readRegVal(true);
    }
    return offset;
  }

  readRMReg16 (segment) {
    winston.log("debug", "Addressing.readRMReg16() : ()");
    let offset;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        offset = this.calcRMAddr();
        return this.readMem16(segment, offset);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        offset = this.calcRMDispAddr();
        return this.readMem16(segment, offset);
      case 0b11: // Two register instruction; use REG table
        return this.readRegVal(true);
    }
    return offset;
  }

  writeRMReg8(segment, value) {
    winston.log("debug", "Addressing.writeRMReg8() : (value=" + value + ")");
    let offset;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        offset = this.calcRMAddr();
        return this.writeMem8(segment, offset, value);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        offset = this.calcRMDispAddr();
        return this.writeMem8(segment, offset, value);
      case 0b11: // Two register instruction; use REG table
        return this.writeRegVal(value, true);
    }
    return offset;
  }

  writeRMReg16(segment, value) {
    winston.log("debug", "Addressing.writeRMReg16(): (value=" + value + ")");
    let offset;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        offset = this.calcRMAddr();
        return this.writeMem16(segment, offset, value);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        offset = this.calcRMDispAddr();
        return this.writeMem16(segment, offset, value);
      case 0b11: // Two register instruction; use REG table
        return this.writeRegVal(value, true);
    }
    return offset;
  }

  readRegVal (useRM = false) {
    winston.log("debug", "Addressing.readRegVal()  : (useRM=" + useRM + ")");

    let rmReg = useRM ? this.cpu.opcode.rm : this.cpu.opcode.reg;
    switch (this.cpu.opcode.w) {
      case 0:
        switch (rmReg) {
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
        switch (rmReg) {
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

  writeRegVal (value, useRM = false) {
    winston.log("debug", "Addressing.writeRegVal()  : (value=" + value + ")");

    let rmReg = useRM ? this.cpu.opcode.rm : this.cpu.opcode.reg;
    switch (this.cpu.opcode.w) {
      case 0:
        switch (rmReg) {
          case 0b000:
            this.cpu.reg8[regAL] = value;
            break;
          case 0b001:
            this.cpu.reg8[regCL] = value;
            break;
          case 0b10:
            this.cpu.reg8[regDL] = value;
            break;
          case 0b011:
            this.cpu.reg8[regBL] = value;
            break;
          case 0b100:
            this.cpu.reg8[regAH] = value;
            break;
          case 0b101:
            this.cpu.reg8[regCH] = value;
            break;
          case 0b110:
            this.cpu.reg8[regDH] = value;
            break;
          case 0b111:
            this.cpu.reg8[regBH] = value;
            break;
        }
        break;
      case 1:
        switch (rmReg) {
          case 0b000:
            this.cpu.reg16[regAX] = value;
            break;
          case 0b001:
            this.cpu.reg16[regCX] = value;
            break;
          case 0b10:
            this.cpu.reg16[regDX] = value;
            break;
          case 0b011:
            this.cpu.reg16[regBX] = value;
            break;
          case 0b100:
            this.cpu.reg16[regSP] = value;
            break;
          case 0b101:
            this.cpu.reg16[regBP] = value;
            break;
          case 0b110:
            this.cpu.reg16[regSI] = value;
            break;
          case 0b111:
            this.cpu.reg16[regDI] = value;
            break;
        }
        break;
    }
  }

  /**
   * Read a byte from a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @return {number} Value from memory as a byte
   */
  readMem8(segment, offset) {
    return (this.cpu.mem8[this.seg2abs(segment, offset)]);
  }

  /**
   * Read a word from a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @return {number} Value from memory as a word
   */
  readMem16(segment, offset) {
    return ((this.cpu.mem8[this.seg2abs(segment, offset + 1)] << 8) |
             this.cpu.mem8[this.seg2abs(segment, offset)]);
  }

  /**
   * Write a byte to a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @param {number} value
   */
  writeMem8(segment, offset, value) {
    this.cpu.mem8[this.seg2abs(segment, offset)] = (value & 0x00FF);
  }

  /**
   * Write a word to a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @param {number} value
   */
  writeMem16(segment, offset, value) {
    this.cpu.mem8[this.seg2abs(segment, offset)] = (value & 0x00FF);
    this.cpu.mem8[this.seg2abs(segment, offset + 1)] = (value >> 8 & 0x00FF);
  }

  /**
   * Convert a segmented (seg:offset) memory address into an absolute address.
   *
   * https://en.wikibooks.org/wiki/X86_Assembly/16_32_and_64_Bits#Example
   *
   * @param {number} segment Segment register
   * @param {number} offset Offset amount from segment
   * @return {number} Absolute memory address
   */
  seg2abs (segment, offset) {
    // Handle segment overrides
    if      (this.cpu.CS_OVERRIDE) segment = this.cpu.reg16[regCS];
    else if (this.cpu.DS_OVERRIDE) segment = this.cpu.reg16[regDS];
    else if (this.cpu.ES_OVERRIDE) segment = this.cpu.reg16[regES];
    else if (this.cpu.SS_OVERRIDE) segment = this.cpu.reg16[regSS];

    return (segment * 16) + offset;
  }
}
