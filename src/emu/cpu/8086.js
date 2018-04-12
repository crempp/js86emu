import winston from 'winston';

import Operations from './Operations.js'
import Addressing from './Addressing.js'
import CPU from './CPU';
import { CPUConfigException } from '../Exceptions';
import CPUConfig from './CPUConfig';
import { seg2abs, segIP } from "../Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
  b, w, v, u,
} from '../Constants';
import {
  hexString16, formatOpcode, formatMemory, formatFlags, formatRegisters,
  formatStack
} from '../Debug'

export default class CPU8086 extends CPU {
  constructor(config) {
    super();
    winston.log("debug", "8086.constructor()       :");

    // Validate config
    if (!(config instanceof CPUConfig)) {
      throw new CPUConfigException("CPU Config Error - config is not a CPUConfig instance");
    }
    config.validate();

    /**
     * CPU cycle counter. This tracks the number of instruction cycles the CPU
     * has executed.
     */
    this.cycleCount = 0;

    /**
     * Segment register to use for addressing. Typically it is assumed to be
     * DS, unless the base register is SP or BP; in which case the address is
     * assumed to be relative to SS
     */
    this.addrSeg = regDS;

    /**
     *
     */
    this.repType = null;

    /**
     * Instruction Pointer increment counter. This tracks the amount to
     * increment the instruction pointer during the instruction execution.
     */
    this.cycleIP = 0;

    // Memory
    this.mem8 = new Uint8Array(config.memorySize);
    this.mem16 = new Uint16Array(this.mem8.buffer);

    // Registers
    this.reg8 = new Uint8Array(14 * 2);
    this.reg16 = new Uint16Array(this.reg8.buffer);
    this.reg16[regAX] = 0x0000;
    this.reg16[regBX] = 0x0000;
    this.reg16[regCX] = 0x0000;
    this.reg16[regDX] = 0x0000;
    this.reg16[regSI] = 0x0000;
    this.reg16[regDI] = 0x0000;
    this.reg16[regBP] = 0x0000;
    this.reg16[regSP] = 0x0000;
    this.reg16[regIP] = 0x0000;
    this.reg16[regCS] = 0x0000;
    this.reg16[regDS] = 0x0000;
    this.reg16[regES] = 0x0000;
    this.reg16[regSS] = 0x0000;

    // Flags
    this.reg16[regFlags] = 0x0000;

    // Opcode
    this.opcode = {};

    // bios_rom_address: 0xF0100,
    // video_rom_address: 0xC0000,

    // Supporting modules
    let addr = new Addressing(this);
    let oper = new Operations(this);

    winston.log("debug", "8086.constructor()       : Creating instruction table");

    /**
     * Wrapper class for instructions. I don't think I can move this to a
     * module because I need to close over oper and addr for binding and I
     * don't want to make the signature messy by passing them in.
     *
     *  TODO:
     *    - Add a cycle param
     */
    class inst {
      constructor(op, baseSize, dst, src) {
        this.op = op ? op.bind(oper) : undefined;
        this.baseSize = baseSize;
        this.dst = dst ? dst.bind(addr) : undefined;
        this.src = src ? src.bind(addr) : undefined;
      }
      run() {
        return this.op(this.dst, this.src);
      }
      toString() {
        return this.opName() + " " + this.dstName() + ", " + this.srcName();
      }
      opName () {
        return typeof this.op === 'function' ? this.op.name.replace("bound ", "") : "[Unknown Op]";
      }
      dstName () {
        return typeof this.dst === 'function' ? this.dst.name.replace("bound ", "") : "";
      }
      srcName () {
        return typeof this.src === 'function' ? this.src.name.replace("bound ", "") : "";
      }
    }

    /**
     * Instruction lookup table. This array serves as a lookup table for the
     * CPU instructions.
     */
    this.inst = [];
    this.inst[0x00]    = new inst(oper.add,    2, addr.Eb, addr.Gb);
    this.inst[0x01]    = new inst(oper.add,    2, addr.Ev, addr.Gv);
    this.inst[0x02]    = new inst(oper.add,    2, addr.Gb, addr.Eb);
    this.inst[0x03]    = new inst(oper.add,    2, addr.Gv, addr.Ev);
    this.inst[0x04]    = new inst(oper.add,    1, addr.AL, addr.Ib);
    this.inst[0x05]    = new inst(oper.add,    1, addr.AX, addr.Iv);
    this.inst[0x06]    = new inst(oper.push,   1, addr.ES         );
    this.inst[0x07]    = new inst(oper.pop,    1, addr.ES         );
    this.inst[0x08]    = new inst(oper.or,     2, addr.Eb, addr.Gb);
    this.inst[0x09]    = new inst(oper.or,     2, addr.Ev, addr.Gv);
    this.inst[0x0A]    = new inst(oper.or,     2, addr.Gb, addr.Eb);
    this.inst[0x0B]    = new inst(oper.or,     2, addr.Gv, addr.Ev);
    this.inst[0x0C]    = new inst(oper.or,     1, addr.AL, addr.Ib);
    this.inst[0x0D]    = new inst(oper.or,     1, addr.AX, addr.Iv);
    this.inst[0x0E]    = new inst(oper.push,   1, addr.CS         );
    this.inst[0x0F]    = new inst(oper.notimp, 0                  );
    this.inst[0x10]    = new inst(oper.adc,    2, addr.Eb, addr.Gb);
    this.inst[0x11]    = new inst(oper.adc,    2, addr.Ev, addr.Gv);
    this.inst[0x12]    = new inst(oper.adc,    2, addr.Gb, addr.Eb);
    this.inst[0x13]    = new inst(oper.adc,    2, addr.Gv, addr.Ev);
    this.inst[0x14]    = new inst(oper.adc,    1, addr.AL, addr.Ib);
    this.inst[0x15]    = new inst(oper.adc,    1, addr.AX, addr.Iv);
    this.inst[0x16]    = new inst(oper.push,   1, addr.SS         );
    this.inst[0x17]    = new inst(oper.pop,    1, addr.SS         );
    this.inst[0x18]    = new inst(oper.sbb,    2, addr.Eb, addr.Gb);
    this.inst[0x19]    = new inst(oper.sbb,    2, addr.Ev, addr.Gv);
    this.inst[0x1A]    = new inst(oper.sbb,    2, addr.Gb, addr.Eb);
    this.inst[0x1B]    = new inst(oper.sbb,    2, addr.Gv, addr.Ev);
    this.inst[0x1C]    = new inst(oper.sbb,    1, addr.AL, addr.Ib);
    this.inst[0x1D]    = new inst(oper.sbb,    1, addr.AX, addr.Iv);
    this.inst[0x1E]    = new inst(oper.push,   1, addr.DS         );
    this.inst[0x1F]    = new inst(oper.pop,    1, addr.DS         );
    this.inst[0x20]    = new inst(oper.and,    2, addr.Eb, addr.Gb);
    this.inst[0x21]    = new inst(oper.and,    2, addr.Ev, addr.Gv);
    this.inst[0x22]    = new inst(oper.and,    2, addr.Gb, addr.Eb);
    this.inst[0x23]    = new inst(oper.and,    2, addr.Gv, addr.Ev);
    this.inst[0x24]    = new inst(oper.and,    2, addr.AL, addr.Ib);
    this.inst[0x25]    = new inst(oper.and,    2, addr.AX, addr.Iv);
    this.inst[0x26]    = new inst(oper.es,     1,                 );
    this.inst[0x27]    = new inst(oper.daa,    1                  );
    this.inst[0x28]    = new inst(oper.sub,    2, addr.Eb, addr.Gb);
    this.inst[0x29]    = new inst(oper.sub,    2, addr.Ev, addr.Gv);
    this.inst[0x2A]    = new inst(oper.sub,    2, addr.Gb, addr.Eb);
    this.inst[0x2B]    = new inst(oper.sub,    2, addr.Gv, addr.Ev);
    this.inst[0x2C]    = new inst(oper.sub,    1, addr.AL, addr.Ib);
    this.inst[0x2D]    = new inst(oper.sub,    1, addr.AX, addr.Iv);
    this.inst[0x2E]    = new inst(oper.cs,     1,                 );
    this.inst[0x2F]    = new inst(oper.das,    1,                 );
    this.inst[0x30]    = new inst(oper.xor,    2, addr.Eb, addr.Gb);
    this.inst[0x31]    = new inst(oper.xor,    2, addr.Ev, addr.Gv);
    this.inst[0x32]    = new inst(oper.xor,    2, addr.Gb, addr.Eb);
    this.inst[0x33]    = new inst(oper.xor,    2, addr.Gv, addr.Ev);
    this.inst[0x34]    = new inst(oper.xor,    1, addr.AL, addr.Ib);
    this.inst[0x35]    = new inst(oper.xor,    1, addr.AX, addr.Iv);
    this.inst[0x36]    = new inst(oper.ss,     1,                 );
    this.inst[0x37]    = new inst(oper.aaa,    1                  );
    this.inst[0x38]    = new inst(oper.cmp,    1, addr.Eb, addr.Gb);
    this.inst[0x39]    = new inst(oper.cmp,    2, addr.Ev, addr.Gv);
    this.inst[0x3A]    = new inst(oper.cmp,    2, addr.Gb, addr.Eb);
    this.inst[0x3B]    = new inst(oper.cmp,    2, addr.Gv, addr.Ev);
    this.inst[0x3C]    = new inst(oper.cmp,    1, addr.AL, addr.Ib);
    this.inst[0x3D]    = new inst(oper.cmp,    1, addr.AX, addr.Iv);
    this.inst[0x3E]    = new inst(oper.ds,     1,                 );
    this.inst[0x3F]    = new inst(oper.aas,    1,                 );
    this.inst[0x40]    = new inst(oper.inc,    1, addr.AX         );
    this.inst[0x41]    = new inst(oper.inc,    1, addr.CX         );
    this.inst[0x42]    = new inst(oper.inc,    1, addr.DX         );
    this.inst[0x43]    = new inst(oper.inc,    1, addr.BX         );
    this.inst[0x44]    = new inst(oper.inc,    1, addr.SP         );
    this.inst[0x45]    = new inst(oper.inc,    1, addr.BP         );
    this.inst[0x46]    = new inst(oper.inc,    1, addr.SI         );
    this.inst[0x47]    = new inst(oper.inc,    1, addr.DI         );
    this.inst[0x48]    = new inst(oper.dec,    1, addr.AX         );
    this.inst[0x49]    = new inst(oper.dec,    1, addr.CX         );
    this.inst[0x4A]    = new inst(oper.dec,    1, addr.DX         );
    this.inst[0x4B]    = new inst(oper.dec,    1, addr.BX         );
    this.inst[0x4C]    = new inst(oper.dec,    1, addr.SP         );
    this.inst[0x4D]    = new inst(oper.dec,    1, addr.BP         );
    this.inst[0x4E]    = new inst(oper.dec,    1, addr.SI         );
    this.inst[0x4F]    = new inst(oper.dec,    1, addr.DI         );
    this.inst[0x50]    = new inst(oper.push,   1, addr.AX         );
    this.inst[0x51]    = new inst(oper.push,   1, addr.CX         );
    this.inst[0x52]    = new inst(oper.push,   1, addr.DX         );
    this.inst[0x53]    = new inst(oper.push,   1, addr.BX         );
    this.inst[0x54]    = new inst(oper.push,   1, addr.SP         );
    this.inst[0x55]    = new inst(oper.push,   1, addr.BP         );
    this.inst[0x56]    = new inst(oper.push,   1, addr.SI         );
    this.inst[0x57]    = new inst(oper.push,   1, addr.DI         );
    this.inst[0x58]    = new inst(oper.pop,    1, addr.AX         );
    this.inst[0x59]    = new inst(oper.pop,    1, addr.CX         );
    this.inst[0x5A]    = new inst(oper.pop,    1, addr.DX         );
    this.inst[0x5B]    = new inst(oper.pop,    1, addr.BX         );
    this.inst[0x5C]    = new inst(oper.pop,    1, addr.SP         );
    this.inst[0x5D]    = new inst(oper.pop,    1, addr.BP         );
    this.inst[0x5E]    = new inst(oper.pop,    1, addr.SI         );
    this.inst[0x5F]    = new inst(oper.pop,    1, addr.DI         );
    this.inst[0x60]    = new inst(oper.notimp, 0                  );
    this.inst[0x61]    = new inst(oper.notimp, 0                  );
    this.inst[0x62]    = new inst(oper.notimp, 0                  );
    this.inst[0x63]    = new inst(oper.notimp, 0                  );
    this.inst[0x64]    = new inst(oper.notimp, 0                  );
    this.inst[0x65]    = new inst(oper.notimp, 0                  );
    this.inst[0x66]    = new inst(oper.notimp, 0                  );
    this.inst[0x67]    = new inst(oper.notimp, 0                  );
    this.inst[0x68]    = new inst(oper.notimp, 0                  );
    this.inst[0x69]    = new inst(oper.notimp, 0                  );
    this.inst[0x6A]    = new inst(oper.notimp, 0                  );
    this.inst[0x6B]    = new inst(oper.notimp, 0                  );
    this.inst[0x6C]    = new inst(oper.notimp, 0                  );
    this.inst[0x6D]    = new inst(oper.notimp, 0                  );
    this.inst[0x6E]    = new inst(oper.notimp, 0                  );
    this.inst[0x6F]    = new inst(oper.notimp, 0                  );
    this.inst[0x70]    = new inst(oper.jo,     1, addr.Jb         );
    this.inst[0x71]    = new inst(oper.jno,    1, addr.Jb         );
    this.inst[0x72]    = new inst(oper.jb,     1, addr.Jb         );
    this.inst[0x73]    = new inst(oper.jnb,    1, addr.Jb         );
    this.inst[0x74]    = new inst(oper.jz,     1, addr.Jb         );
    this.inst[0x75]    = new inst(oper.jnz,    1, addr.Jb         );
    this.inst[0x76]    = new inst(oper.jbe,    1, addr.Jb         );
    this.inst[0x77]    = new inst(oper.ja,     1, addr.Jb         );
    this.inst[0x78]    = new inst(oper.js,     1, addr.Jb         );
    this.inst[0x79]    = new inst(oper.jns,    1, addr.Jb         );
    this.inst[0x7A]    = new inst(oper.jpe,    1, addr.Jb         );
    this.inst[0x7B]    = new inst(oper.jpo,    1, addr.Jb         );
    this.inst[0x7C]    = new inst(oper.jl,     1, addr.Jb         );
    this.inst[0x7D]    = new inst(oper.jge,    1, addr.Jb         );
    this.inst[0x7E]    = new inst(oper.jle,    1, addr.Jb         );
    this.inst[0x7F]    = new inst(oper.jg,     1, addr.Jb         );

    // Group 1 instructions
    this.inst[0x80] = [];
    this.inst[0x80][0] = new inst(oper.add,    2, addr.Eb, addr.Ib);
    this.inst[0x80][1] = new inst(oper.or,     2, addr.Eb, addr.Ib);
    this.inst[0x80][2] = new inst(oper.adc,    2, addr.Eb, addr.Ib);
    this.inst[0x80][3] = new inst(oper.sbb,    2, addr.Eb, addr.Ib);
    this.inst[0x80][4] = new inst(oper.and,    2, addr.Eb, addr.Ib);
    this.inst[0x80][5] = new inst(oper.sub,    2, addr.Eb, addr.Ib);
    this.inst[0x80][6] = new inst(oper.xor,    2, addr.Eb, addr.Ib);
    this.inst[0x80][7] = new inst(oper.cmp,    2, addr.Eb, addr.Ib);
    this.inst[0x81] = [];
    this.inst[0x81][0] = new inst(oper.add,    2, addr.Ev, addr.Iv);
    this.inst[0x81][1] = new inst(oper.or,     2, addr.Ev, addr.Iv);
    this.inst[0x81][2] = new inst(oper.adc,    2, addr.Ev, addr.Iv);
    this.inst[0x81][3] = new inst(oper.sbb,    2, addr.Ev, addr.Iv);
    this.inst[0x81][4] = new inst(oper.and,    2, addr.Ev, addr.Iv);
    this.inst[0x81][5] = new inst(oper.sub,    2, addr.Ev, addr.Iv);
    this.inst[0x81][6] = new inst(oper.xor,    2, addr.Ev, addr.Iv);
    this.inst[0x81][7] = new inst(oper.cmp,    2, addr.Ev, addr.Iv);
    this.inst[0x82] = [];
    this.inst[0x82][0] = new inst(oper.add,    2, addr.Eb, addr.Ib);
    this.inst[0x82][1] = new inst(oper.or,     2, addr.Eb, addr.Ib);
    this.inst[0x82][2] = new inst(oper.adc,    2, addr.Eb, addr.Ib);
    this.inst[0x82][3] = new inst(oper.sbb,    2, addr.Eb, addr.Ib);
    this.inst[0x82][4] = new inst(oper.and,    2, addr.Eb, addr.Ib);
    this.inst[0x82][5] = new inst(oper.sub,    2, addr.Eb, addr.Ib);
    this.inst[0x82][6] = new inst(oper.xor,    2, addr.Eb, addr.Ib);
    this.inst[0x82][7] = new inst(oper.cmp,    2, addr.Eb, addr.Ib);
    this.inst[0x83] = [];
    this.inst[0x83][0] = new inst(oper.add,    2, addr.Ev, addr.Ib);
    this.inst[0x83][1] = new inst(oper.or,     2, addr.Ev, addr.Ib);
    this.inst[0x83][2] = new inst(oper.adc,    2, addr.Ev, addr.Ib);
    this.inst[0x83][3] = new inst(oper.sbb,    2, addr.Ev, addr.Ib);
    this.inst[0x83][4] = new inst(oper.and,    2, addr.Ev, addr.Ib);
    this.inst[0x83][5] = new inst(oper.sub,    2, addr.Ev, addr.Ib);
    this.inst[0x83][6] = new inst(oper.xor,    2, addr.Ev, addr.Ib);
    this.inst[0x83][7] = new inst(oper.cmp,    2, addr.Ev, addr.Ib);

    this.inst[0x84]    = new inst(oper.test,   2, addr.Gb, addr.Eb);
    this.inst[0x85]    = new inst(oper.test,   2, addr.Gv, addr.Ev);
    this.inst[0x86]    = new inst(oper.xchg,   2, addr.Gb, addr.Eb);
    this.inst[0x87]    = new inst(oper.xchg,   2, addr.Gv, addr.Ev);
    this.inst[0x88]    = new inst(oper.mov,    2, addr.Eb, addr.Gb);
    this.inst[0x89]    = new inst(oper.mov,    2, addr.Ev, addr.Gv);
    this.inst[0x8A]    = new inst(oper.mov,    2, addr.Gb, addr.Eb);
    this.inst[0x8B]    = new inst(oper.mov,    2, addr.Gv, addr.Ev);
    this.inst[0x8C]    = new inst(oper.mov,    2, addr.Ew, addr.Sw);
    this.inst[0x8D]    = new inst(oper.lea,    2, addr.Gv, addr.M );
    this.inst[0x8E]    = new inst(oper.mov,    2, addr.Sw, addr.Ew);
    this.inst[0x8F]    = new inst(oper.pop,    2, addr.Ev         );
    this.inst[0x90]    = new inst(oper.nop,    1                  );
    this.inst[0x91]    = new inst(oper.xchg,   1, addr.CX, addr.AX);
    this.inst[0x92]    = new inst(oper.xchg,   1, addr.DX, addr.AX);
    this.inst[0x93]    = new inst(oper.xchg,   1, addr.BX, addr.AX);
    this.inst[0x94]    = new inst(oper.xchg,   1, addr.SP, addr.AX);
    this.inst[0x95]    = new inst(oper.xchg,   1, addr.BP, addr.AX);
    this.inst[0x96]    = new inst(oper.xchg,   1, addr.SI, addr.AX);
    this.inst[0x97]    = new inst(oper.xchg,   1, addr.DI, addr.AX);
    this.inst[0x98]    = new inst(oper.cbw,    1                  );
    this.inst[0x99]    = new inst(oper.cwd,    1                  );
    this.inst[0x9A]    = new inst(oper.call,   1, addr.Ap         );
    this.inst[0x9B]    = new inst(oper.wait,   1                  );
    this.inst[0x9C]    = new inst(oper.pushf,  1                  );
    this.inst[0x9D]    = new inst(oper.popf,   1                  );
    this.inst[0x9E]    = new inst(oper.sahf,   1                  );
    this.inst[0x9F]    = new inst(oper.lahf,   1                  );
    this.inst[0xA0]    = new inst(oper.mov,    1, addr.AL, addr.Ob);
    this.inst[0xA1]    = new inst(oper.mov,    1, addr.AX, addr.Ov);
    this.inst[0xA2]    = new inst(oper.mov,    1, addr.Ob, addr.AL);
    this.inst[0xA3]    = new inst(oper.mov,    1, addr.Ov, addr.AX);
    this.inst[0xA4]    = new inst(oper.movsb,  1                  );
    this.inst[0xA5]    = new inst(oper.movsw,  1                  );
    this.inst[0xA6]    = new inst(oper.cmpsb,  1                  );
    this.inst[0xA7]    = new inst(oper.cmpsw,  1                  );
    this.inst[0xA8]    = new inst(oper.test,   1, addr.AL, addr.Ib);
    this.inst[0xA9]    = new inst(oper.test,   1, addr.AX, addr.Iv);
    this.inst[0xAA]    = new inst(oper.stosb,  1                  );
    this.inst[0xAB]    = new inst(oper.stosw,  1                  );
    this.inst[0xAC]    = new inst(oper.lodsb,  1                  );
    this.inst[0xAD]    = new inst(oper.lodsw,  1                  );
    this.inst[0xAE]    = new inst(oper.scasb,  1                  );
    this.inst[0xAF]    = new inst(oper.scasw,  1                  );
    this.inst[0xB0]    = new inst(oper.mov,    1, addr.AL, addr.Ib);
    this.inst[0xB1]    = new inst(oper.mov,    1, addr.CL, addr.Ib);
    this.inst[0xB2]    = new inst(oper.mov,    1, addr.DL, addr.Ib);
    this.inst[0xB3]    = new inst(oper.mov,    1, addr.BL, addr.Ib);
    this.inst[0xB4]    = new inst(oper.mov,    1, addr.AH, addr.Ib);
    this.inst[0xB5]    = new inst(oper.mov,    1, addr.CH, addr.Ib);
    this.inst[0xB6]    = new inst(oper.mov,    1, addr.DH, addr.Ib);
    this.inst[0xB7]    = new inst(oper.mov,    1, addr.BH, addr.Ib);
    this.inst[0xB8]    = new inst(oper.mov,    1, addr.AX, addr.Iv);
    this.inst[0xB9]    = new inst(oper.mov,    1, addr.CX, addr.Iv);
    this.inst[0xBA]    = new inst(oper.mov,    1, addr.DX, addr.Iv);
    this.inst[0xBB]    = new inst(oper.mov,    1, addr.BX, addr.Iv);
    this.inst[0xBC]    = new inst(oper.mov,    1, addr.SP, addr.Iv);
    this.inst[0xBD]    = new inst(oper.mov,    1, addr.BP, addr.Iv);
    this.inst[0xBE]    = new inst(oper.mov,    1, addr.SI, addr.Iv);
    this.inst[0xBF]    = new inst(oper.mov,    1, addr.DI, addr.Iv);
    this.inst[0xC0]    = new inst(oper.notimp, 0                  );
    this.inst[0xC1]    = new inst(oper.notimp, 0                  );
    this.inst[0xC2]    = new inst(oper.ret,    1, addr.Iw         );
    this.inst[0xC3]    = new inst(oper.ret,    1                  );
    this.inst[0xC4]    = new inst(oper.les,    2, addr.Gv, addr.Mp);
    this.inst[0xC5]    = new inst(oper.lds,    2, addr.Gv, addr.Mp);
    this.inst[0xC6]    = new inst(oper.mov,    2, addr.Eb, addr.Ib);
    this.inst[0xC7]    = new inst(oper.mov,    2, addr.Ev, addr.Iv);
    this.inst[0xC8]    = new inst(oper.notimp, 1                  );
    this.inst[0xC9]    = new inst(oper.notimp, 0                  );
    this.inst[0xCA]    = new inst(oper.retf,   1, addr.Iw         );
    this.inst[0xCB]    = new inst(oper.retf,   1                  );
    this.inst[0xCC]    = new inst(oper.int,    1, addr._3         );
    this.inst[0xCD]    = new inst(oper.int,    1, addr.Ib         );
    this.inst[0xCE]    = new inst(oper.into,   1                  );
    this.inst[0xCF]    = new inst(oper.iret,   1                  );

    // Group 2 instructions
    this.inst[0xD0] = [];
    this.inst[0xD0][0] = new inst(oper.rol,    2, addr.Eb, addr._1);
    this.inst[0xD0][1] = new inst(oper.ror,    2, addr.Eb, addr._1);
    this.inst[0xD0][2] = new inst(oper.rcl,    2, addr.Eb, addr._1);
    this.inst[0xD0][3] = new inst(oper.rcr,    2, addr.Eb, addr._1);
    this.inst[0xD0][4] = new inst(oper.shl,    2, addr.Eb, addr._1);
    this.inst[0xD0][5] = new inst(oper.shr,    2, addr.Eb, addr._1);
    this.inst[0xD0][6] = new inst(oper.notimp, 0                  );
    this.inst[0xD0][7] = new inst(oper.sar,    2, addr.Eb, addr._1);
    this.inst[0xD1] = [];
    this.inst[0xD1][0] = new inst(oper.rol,    2, addr.Ev, addr._1);
    this.inst[0xD1][1] = new inst(oper.ror,    2, addr.Ev, addr._1);
    this.inst[0xD1][2] = new inst(oper.rcl,    2, addr.Ev, addr._1);
    this.inst[0xD1][3] = new inst(oper.rcr,    2, addr.Ev, addr._1);
    this.inst[0xD1][4] = new inst(oper.shl,    2, addr.Ev, addr._1);
    this.inst[0xD1][5] = new inst(oper.shr,    2, addr.Ev, addr._1);
    this.inst[0xD1][6] = new inst(oper.notimp, 0                  );
    this.inst[0xD1][7] = new inst(oper.sar,    2, addr.Ev, addr._1);
    this.inst[0xD2] = [];
    this.inst[0xD2][0] = new inst(oper.rol,    2, addr.Eb, addr.CL);
    this.inst[0xD2][1] = new inst(oper.ror,    2, addr.Eb, addr.CL);
    this.inst[0xD2][2] = new inst(oper.rcl,    2, addr.Eb, addr.CL);
    this.inst[0xD2][3] = new inst(oper.rcr,    2, addr.Eb, addr.CL);
    this.inst[0xD2][4] = new inst(oper.shl,    2, addr.Eb, addr.CL);
    this.inst[0xD2][5] = new inst(oper.shr,    2, addr.Eb, addr.CL);
    this.inst[0xD2][6] = new inst(oper.notimp, 0                  );
    this.inst[0xD2][7] = new inst(oper.sar,    2, addr.Eb, addr.CL);
    this.inst[0xD3] = [];
    this.inst[0xD3][0] = new inst(oper.rol,    2, addr.Ev, addr.CL);
    this.inst[0xD3][1] = new inst(oper.ror,    2, addr.Ev, addr.CL);
    this.inst[0xD3][2] = new inst(oper.rcl,    2, addr.Ev, addr.CL);
    this.inst[0xD3][3] = new inst(oper.rcr,    2, addr.Ev, addr.CL);
    this.inst[0xD3][4] = new inst(oper.shl,    2, addr.Ev, addr.CL);
    this.inst[0xD3][5] = new inst(oper.shr,    2, addr.Ev, addr.CL);
    this.inst[0xD3][6] = new inst(oper.notimp, 0                  );
    this.inst[0xD3][7] = new inst(oper.sar,    2, addr.Ev, addr.CL);

    this.inst[0xD4]    = new inst(oper.aam,    1, addr.Ib         );
    this.inst[0xD5]    = new inst(oper.aad,    1, addr.Ib         );
    this.inst[0xD6]    = new inst(oper.notimp, 0                  );
    this.inst[0xD7]    = new inst(oper.xlat,   1                  );
    this.inst[0xD8]    = new inst(oper.notimp, 0                  );
    this.inst[0xD9]    = new inst(oper.notimp, 0                  );
    this.inst[0xDA]    = new inst(oper.notimp, 0                  );
    this.inst[0xDB]    = new inst(oper.notimp, 0                  );
    this.inst[0xDC]    = new inst(oper.notimp, 0                  );
    this.inst[0xDD]    = new inst(oper.notimp, 0                  );
    this.inst[0xDE]    = new inst(oper.notimp, 0                  );
    this.inst[0xDF]    = new inst(oper.notimp, 0                  );
    this.inst[0xE0]    = new inst(oper.loopnz, 1, addr.Jb         );
    this.inst[0xE1]    = new inst(oper.loopz,  1, addr.Jb         );
    this.inst[0xE2]    = new inst(oper.loop,   1, addr.Jb         );
    this.inst[0xE3]    = new inst(oper.jcxz,   1, addr.Jb         );
    this.inst[0xE4]    = new inst(oper.iin,    1, addr.AL, addr.Ib);
    this.inst[0xE5]    = new inst(oper.iin,    1, addr.AX, addr.Ib);
    this.inst[0xE6]    = new inst(oper.out,    1, addr.Ib, addr.AL);
    this.inst[0xE7]    = new inst(oper.out,    1, addr.Ib, addr.AX);
    this.inst[0xE8]    = new inst(oper.call,   1, addr.Jv         );
    this.inst[0xE9]    = new inst(oper.jmp,    1, addr.Jv         );
    this.inst[0xEA]    = new inst(oper.jmp,    1, addr.Ap         );
    this.inst[0xEB]    = new inst(oper.jmp,    1, addr.Jb         );
    this.inst[0xEC]    = new inst(oper.iin,    1, addr.AL, addr.DX);
    this.inst[0xED]    = new inst(oper.iin,    1, addr.AX, addr.DX);
    this.inst[0xEE]    = new inst(oper.out,    1, addr.DX, addr.AL);
    this.inst[0xEF]    = new inst(oper.out,    1, addr.DX, addr.AX);
    this.inst[0xF0]    = new inst(oper.lock,   1                  );
    this.inst[0xF1]    = new inst(oper.notimp, 0                  );
    this.inst[0xF2]    = new inst(oper.repnz,  1                  );
    this.inst[0xF3]    = new inst(oper.repz,   1                  );
    this.inst[0xF4]    = new inst(oper.hlt,    1                  );
    this.inst[0xF5]    = new inst(oper.cmc,    1                  );

    // Group 3a instructions
    this.inst[0xF6] = [];
    this.inst[0xF6][0] = new inst(oper.test,   2, addr.Eb, addr.Ib);
    this.inst[0xF6][1] = new inst(oper.notimp, 0,                 );
    this.inst[0xF6][2] = new inst(oper.not,    2, addr.Eb,        );
    this.inst[0xF6][3] = new inst(oper.neg,    2, addr.Eb,        );
    this.inst[0xF6][4] = new inst(oper.mul,    2, addr.Eb,        );
    this.inst[0xF6][5] = new inst(oper.imul,   2, addr.Eb,        );
    this.inst[0xF6][6] = new inst(oper.div,    2, addr.Eb,        );
    this.inst[0xF6][7] = new inst(oper.idiv,   2, addr.Eb,        );

    // Group 3b instructions
    this.inst[0xF7] = [];
    this.inst[0xF7][0] = new inst(oper.test,   2, addr.Ev, addr.Iv);
    this.inst[0xF7][1] = new inst(oper.notimp, 0,                 );
    this.inst[0xF7][2] = new inst(oper.not,    2, addr.Ev,        );
    this.inst[0xF7][3] = new inst(oper.neg,    2, addr.Ev,        );
    this.inst[0xF7][4] = new inst(oper.mul,    2, addr.Ev,        );
    this.inst[0xF7][5] = new inst(oper.imul,   0, addr.Ev,        );
    this.inst[0xF7][6] = new inst(oper.div,    0, addr.Ev,        );
    this.inst[0xF7][7] = new inst(oper.idiv,   0, addr.Ev,        );

    this.inst[0xF8]    = new inst(oper.clc,    1                  );
    this.inst[0xF9]    = new inst(oper.stc,    1                  );
    this.inst[0xFA]    = new inst(oper.cli,    1                  );
    this.inst[0xFB]    = new inst(oper.sti,    1                  );
    this.inst[0xFC]    = new inst(oper.cld,    1                  );
    this.inst[0xFD]    = new inst(oper.std,    1                  );

    // Group 4 instructions
    this.inst[0xFE] = [];
    this.inst[0xFE][0] = new inst(oper.inc,    2, addr.Eb,        );
    this.inst[0xFE][1] = new inst(oper.dec,    2, addr.Eb,        );
    this.inst[0xFE][2] = new inst(oper.notimp, 0                  );
    this.inst[0xFE][3] = new inst(oper.notimp, 0                  );
    this.inst[0xFE][4] = new inst(oper.notimp, 0                  );
    this.inst[0xFE][5] = new inst(oper.notimp, 0                  );
    this.inst[0xFE][6] = new inst(oper.notimp, 0                  );
    this.inst[0xFE][7] = new inst(oper.notimp, 0                  );

    // Group 5 instructions
    this.inst[0xFF] = [];
    this.inst[0xFF][0] = new inst(oper.inc,    2, addr.Ev,        );
    this.inst[0xFF][1] = new inst(oper.dec,    2, addr.Ev,        );
    this.inst[0xFF][2] = new inst(oper.call,   2, addr.Ev,        );
    this.inst[0xFF][3] = new inst(oper.call,   2, addr.Ep         );
    this.inst[0xFF][4] = new inst(oper.jmp,    2, addr.Ev,        );
    this.inst[0xFF][5] = new inst(oper.jmp,    2, addr.Ep         );
    this.inst[0xFF][6] = new inst(oper.push,   2, addr.Ev,        );
    this.inst[0xFF][7] = new inst(oper.notimp, 0                  );
  }

  /**
   * Decode the current instruction pointed to by the IP register.
   */
  decode () {
    let opcode_byte = this.mem8[segIP(this)];
    // TODO: only get addressing_byte if baseSize >1 else null
    let addressing_byte = this.mem8[segIP(this) + 1];
    this.opcode = {
      opcode_byte     : opcode_byte,
      addressing_byte : addressing_byte,
      prefix          : 0x00,  // Not supporting prefix opcodes yet
      opcode          : (opcode_byte & 0xFC) >>> 2,
      d               : (opcode_byte & 0x02) >>> 1,
      w               : (opcode_byte & 0x01),
      mod             : (addressing_byte & 0xC0) >>> 6,
      reg             : (addressing_byte & 0x38) >>> 3,
      rm              : (addressing_byte & 0x07),
      inst            : null,
      string          : "",
      addrSize        : null,
    };

    // Retrieve the operation from the opcode table
    this.opcode.inst = this.inst[this.opcode.opcode_byte];
    if (this.opcode.inst instanceof Array) {
      // If the instruction is an array it's a group instruction and we need
      // to extract further based on the register component of the addressing
      // byte
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }

    // Store the string representation of the operation
    this.opcode.string = this.opcode.inst.toString();

    // Get the size and type of the opcode based on the addressing
    // TODO: Find a better way to do this.
    //       I've thought about adding a size parameter to the inst class
    //       but that'll require some reworking. Maybe do it if/when I add a
    //       cycle param.
    let sizeChar = this.opcode.inst.dstName()[1];
    if (['b', 'L', 'h'].indexOf(sizeChar) >= 0) this.opcode.addrSize = b;
    else if (['w', 'p', 'X', 'P', 'B', 'I', 'S'].indexOf(sizeChar) >= 0) this.opcode.addrSize = w;
    else if (sizeChar === 'v') this.opcode.addrSize = v;
    else this.opcode.addrSize = u;
  }

  // TODO: I don't like this. Move this back into operations if possible
  // http://www.c-jump.com/CIS77/CPU/x86/X77_0240_prefix.htm
  prefix () {
    let inst = this.opcode.opcode_byte;
    // Instruction prefix check
    switch (this.opcode.opcode_byte) {
      case 0x2E: // CS segment prefix
        this.addrSeg = regCS;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      case 0x3E: // DS segment prefix
        this.addrSeg = regDS;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      case 0x26: // ES segment prefix
        this.addrSeg = regES;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      case 0x36: // SS segment prefix
        this.addrSeg = regSS;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      case 0xF3: // REP/REPE/REPZ
        this.repType = 1;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      case 0xF2: // REPNE/REPNZ
        this.repType = 2;
        this.reg16[regIP] += 1;
        this.decode();
        this.opcode.prefix = inst;
        break;
      default:
        this.addrSeg = regDS;
        this.repType = 0;
        break;
    }
  }

  /**
   * Run a single CPU cycle
   */
  cycle () {
    winston.log("debug", "8086.cycle()             : Running instruction cycle [" + this.cycleCount + "]");

    // Reset per-cycle values
    this.cycleIP = 0;
    this.addrSeg = regDS;

    // Decode the instruction
    this.decode();

    // If this is a prefix instruction, run it and move to the next instruction
    this.prefix();

    winston.log("debug", "  INSTRUCTION: " +  this.opcode.string);
    winston.log("debug", "  CS:IP:       " + hexString16(this.reg16[regCS]) + ":" + hexString16(this.reg16[regIP]));
    winston.log("debug", "  OPCODE:      " + "\n" + formatOpcode(this.opcode, 11));
    winston.log("debug", "  MEMORY INST: " + "\n" + formatMemory(this.mem8, segIP(this), segIP(this) + 6, 11));
    // winston.log("debug", "  MEMORY STACK:" + "\n" + formatStack(this.mem8, seg2abs(this.reg16[regSS], this.reg16[regSP], this), 11));
    winston.log("debug", "  MEMORY STACK:" + "\n" + formatStack(this.mem8, this.reg16[regSP], 0x1000, 11));
    winston.log("debug", "  REGISTERS    " + "\n" + formatRegisters(this, 11));
    winston.log("debug", "  FLAGS:       " + "\n" + formatFlags(this.reg16[regFlags], 11));

    // Increase the cycleIp by the instruction base size
    this.cycleIP += this.opcode.inst.baseSize;

    // Run the instruction
    this.opcode.inst.run();

    // Move the IP
    this.reg16[regIP] += this.cycleIP;

    this.cycleCount += 1;
  }

  /**
   * Assemble the current CPU state in an object and return it.
   *
   * @return {Object} State encoded in an object
   */
  getState () {
    let tmpOpcode = this.opcode;
    delete tmpOpcode.inst;

    return {
      "cycleCount": this.cycleCount,
      "addrSeg":    this.addrSeg,
      "repType":    this.repType,
      "cycleIP":    this.cycleIP,
      "mem16":       this.mem16,//.buffer,
      "reg16":       this.reg16,//.buffer,
      "opcode":     tmpOpcode,
    };
  }

  /**
   * Restore the CPU state from the given object
   *
   * @param state
   */
  setState (state) {
    // load all stateful attributes from bjson
    // this could/should go in a parent class
    this.cycleCount = state["cycleCount"];
    this.addrSeg    = state["addrSeg"];
    this.repType    = state["repType"];
    this.cycleIP    = state["cycleIP"];
    this.mem16      = new Uint16Array(state["mem16"]);
    this.reg16      = new Uint16Array(state["reg16"]);
    this.opcode     = state["opcode"];

    // TODO: Refactor this so it's not copy/pasted
    // The instruction function is not saved/restored correctly from bjson so
    // we need to reset it.
    this.opcode.inst = this.inst[this.opcode.opcode_byte];
    if (this.opcode.inst instanceof Array) {
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }
  }
}
