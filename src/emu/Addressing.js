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
    if (value || value === 0) result = this.writeRMReg8(value);
    else result = this.readRMReg8();

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 1;
    return result;
  }
  Ev (value = null) {
    winston.log("debug", "Addressing.Ev()          : (value=" + hexString16(value) + ")");

    let result;
    if (value || value === 0) result = this.writeRMReg16(value);
    else result = this.readRMReg16();

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
    let addr = this.calcImmAddr();

    if (value || value === 0) result = this.writeMem8(addr, value);
    else result = this.readMem8(addr);

    winston.log("debug", "Addressing.Ev()          :     result=" + hexString16(result));

    this.cpu.cycleIP += 2;
    return result;
  }
  Iv (value = null) {
    winston.log("debug", "Addressing.Iv()          : (value=" + hexString16(value) + ")");
    let result;
    let addr = this.calcImmAddr();

    if (value || value === 0) result = this.writeMem16(addr, value);
    else result = this.readMem16(addr);

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
        addr = (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
          this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
        // TODO: I can make this simpler using mem16, test this.
        // addr = this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
        break;
      case 0b111 : // [BX]
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
  }

  calcRMDispAddr () {
    winston.log("debug", "Addressing.calcRMDispAddr() : ()");
    let addr;

    switch (this.cpu.opcode.mod) {
      case 0b01: // Use R/M Tablae 2 with 8-bit displacement
        disp = this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        disp = disp ||
          ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
            this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)] );
        // TODO: I can make this simpler using mem16, test this.
        // disp = disp || this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];

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

  readRMReg8 () {
    winston.log("debug", "Addressing.readRMReg8()  : ()");
    let addr;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        addr = this.calcRMAddr();
        return this.readMem8(addr);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        addr = this.calcRMDispAddr();
        return this.readMem8(addr);
      case 0b11: // Two register instruction; use REG table
        return this.readRegVal(true);
    }
    return addr;
  }

  readRMReg16 () {
    winston.log("debug", "Addressing.readRMReg16() : ()");
    let addr;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        addr = this.calcRMAddr();
        return this.readMem16(addr);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        addr = this.calcRMDispAddr();
        return this.readMem16(addr);
      case 0b11: // Two register instruction; use REG table
        return this.readRegVal(true);
    }
    return addr;
  }

  writeRMReg8 (value) {
    winston.log("debug", "Addressing.writeRMReg8() : (value=" + value + ")");
    let addr;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        addr = this.calcRMAddr();
        return this.writeMem8(addr, value);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        addr = this.calcRMDispAddr();
        return this.writeMem8(addr, value);
      case 0b11: // Two register instruction; use REG table
        return this.writeRegVal(value, true);
    }
    return addr;
  }

  writeRMReg16 (value) {
    winston.log("debug", "Addressing.writeRMReg16(): (value=" + value + ")");
    let addr;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        addr = this.calcRMAddr();
        return this.writeMem16(addr, value);
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        addr = this.calcRMDispAddr();
        return this.writeMem16(addr, value);
      case 0b11: // Two register instruction; use REG table
        return this.writeRegVal(value, true);
    }
    return addr;
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

  calcImmAddr () {
    winston.log("debug", "Addressing.calcImmAddr() : ()");
    return this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + this.cpu.cycleIP);
  }

  readMem8 (addr) {
    winston.log("debug", "Addressing.readMem8() : addr=" + addr);
    return (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
  }

  readMem16 (addr) {
    winston.log("debug", "Addressing.readMem16() : (addr=" + addr + ")");
    return ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr + 1)] << 8) |
             this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
    // TODO: I can make this simpler using mem16, test this.
    // return this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)]
  }

  writeMem8 (addr, value) {
    winston.log("debug", "Addressing.writeMem8() : (addr=" + addr + ", value=" + value + ")");
    this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)] = (value & 0x00FF);
  }

  writeMem16 (addr, value) {
    winston.log("debug", "Addressing.writeMem16() : (addr=" + addr + ", value=" + value + ")");
    this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)] = (value);
  }

  seg2abs (segment, offset) {
    // Handle segment overrides
    if      (this.cpu.CS_OVERRIDE) segment = this._regCS;
    else if (this.cpu.DS_OVERRIDE) segment = this._regDS;
    else if (this.cpu.ES_OVERRIDE) segment = this._regES;
    else if (this.cpu.SS_OVERRIDE) segment = this._regSS;
    return (segment * 16) + offset;
  }

  // calcRMAddr () {
  //   winston.log("debug", "Addressing.calcRMAddr()  : ()");
  //   let addr, disp;
  //
  //   switch (this.cpu.opcode.mod) {
  //     case 0b00: // Use R/M Table 1 for R/M operand
  //       switch (this.cpu.opcode.rm)
  //       {
  //         case 0b000 : // [BX + SI]
  //           addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI];
  //           break;
  //         case 0b001 : // [BX + DI]
  //           addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI];
  //           break;
  //         case 0b010 : // [BP + SI]
  //           addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI];
  //           break;
  //         case 0b011 : // [BP + DI]
  //           addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI];
  //           break;
  //         case 0b100 : // [SI]
  //           addr = this.cpu.reg16[regSI];
  //           break;
  //         case 0b101 : // [DI]
  //           addr = this.cpu.reg16[regDI];
  //           break;
  //         case 0b110 : // Direct Address
  //           // Direct address is always 2 bytes
  //           //   - yoshicapstonememo.googlecode.com/svn/trunk/4_2_86.pdf
  //           addr = (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
  //             this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
  //           // TODO: I can make this simpler using mem16, test this.
  //           // addr = this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
  //           break;
  //         case 0b111 : // [BX]
  //           addr = this.cpu.reg16[regBX];
  //           break;
  //       }
  //       switch (this.cpu.opcode.w) {
  //         case 0:
  //           return (this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
  //         case 1:
  //           return ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr + 1)] << 8) |
  //             this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], addr)]);
  //         // TODO: I can make this simpler using mem16, test this.
  //         // return this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], addr)]
  //       }
  //       break;
  //     case 0b01: // Use R/M Table 2 with 8-bit displacement
  //       disp = this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
  //     case 0b10: // Use R/M Table 2 with 16-bit displacement
  //       disp = disp ||
  //         ((this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 3)] << 8) |
  //           this.cpu.mem8[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)] );
  //       // TODO: I can make this simpler using mem16, test this.
  //       // disp = disp || this.cpu.mem16[this.seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + 2)];
  //
  //       switch (opcode.rm)
  //       {
  //         case 0b000 : // [BX + SI]
  //           addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI] + disp;
  //           break;
  //         case 0b001 : // [BX + DI]
  //           addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI] + disp;
  //           break;
  //         case 0b010 : // [BP + SI]
  //           addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI] + disp;
  //           break;
  //         case 0b011 : // [BP + DI]
  //           addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI] + disp;
  //           break;
  //         case 0b100 : // [SI]
  //           addr = this.cpu.reg16[regSI];
  //           break;
  //         case 0b101 : // [DI]
  //           addr = this.cpu.reg16[regDI];
  //           break;
  //         case 0b110 : // [BP]
  //           addr = this.cpu.reg16[regBP];
  //           break;
  //         case 0b111 : // [BX]
  //           addr = this.cpu.reg16[regBX];
  //           break;
  //       }
  //       break;
  //     case 0b11: // Two register instruction; use REG table
  //       addr = this.readRegVal();
  //       break;
  //   }
  //   return addr;
  // }
}
