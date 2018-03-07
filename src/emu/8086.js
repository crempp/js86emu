import winston from 'winston';

import { inst } from './Instructions.js'
import Operations from './operations.js'
import Addressing from './addressing.js'
import CPU from './CPU';
import { CPUConfigException } from './Exceptions';
import CPUConfig from './CPUConfig';
import { seg2abs, segIP } from "./Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';
import {
  binString8, binString16, hexString8, hexString16, formatOpcode,
  formatMemory, formatFlags
} from './Debug'

export default class CPU8086 extends CPU {
  constructor(config) {
    super();
    winston.log("debug", "8086.constructor()       :");

    // Validate config
    if (!(config instanceof CPUConfig)) {
      throw new CPUConfigException("CPU Config Error - config is not a CPUConfig instance");
    }
    config.validate();

    // bios_rom_address: 0xF0100,
    // video_rom_address: 0xC0000,

    // Segment override flags
    this.CS_OVERRIDE = false;
    this.DS_OVERRIDE = false;
    this.ES_OVERRIDE = false;
    this.SS_OVERRIDE = false;

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
    this.opcode = 0x00;

    this.cycleIP = 0;

    // Supporting modules
    let addr = new Addressing(this);
    let oper = new Operations(this);

    winston.log("debug", "8086.constructor()       : Creating instruction table");

    let inst_ = inst.bind(oper);

    let grp1 = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g1 = [];
      inst_g1[0] = inst_(oper.add, dst, src);
      inst_g1[1] = inst_(oper.or,  dst, src);
      inst_g1[2] = inst_(oper.adc, dst, src);
      inst_g1[3] = inst_(oper.sbb, dst, src);
      inst_g1[4] = inst_(oper.and, dst, src);
      inst_g1[5] = inst_(oper.sub, dst, src);
      inst_g1[6] = inst_(oper.xor, dst, src);
      inst_g1[7] = inst_(oper.cmp, dst, src);
      return () => {
        return inst_g1[this.opcode.reg]();
      };
    };
    let grp2 = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g2 = [];
      inst_g2[0] = inst_(oper.rol,    dst, src);
      inst_g2[1] = inst_(oper.ror,    dst, src);
      inst_g2[2] = inst_(oper.rcl,    dst, src);
      inst_g2[3] = inst_(oper.rcr,    dst, src);
      inst_g2[4] = inst_(oper.shl,    dst, src);
      inst_g2[5] = inst_(oper.shr,    dst, src);
      inst_g2[6] = inst_(oper.notimp, dst, src);
      inst_g2[7] = inst_(oper.sar,    dst, src);
      return () => {
        return inst_g2[this.opcode.reg]();
      };
    };
    let grp3a = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g3a = [];
      inst_g3a[0] = inst_(oper.test,   addr.Eb, addr.Ib);
      inst_g3a[1] = inst_(oper.notimp, dst,     src    );
      inst_g3a[2] = inst_(oper.not,    dst,     src    );
      inst_g3a[3] = inst_(oper.neg,    dst,     src    );
      inst_g3a[4] = inst_(oper.mul,    dst,     src    );
      inst_g3a[5] = inst_(oper.imul,   dst,     src    );
      inst_g3a[6] = inst_(oper.div,    dst,     src    );
      inst_g3a[7] = inst_(oper.idiv,   dst,     src    );
      return () => {
        return inst_g3a[this.opcode.reg]();
      };
    };
    let grp3b = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g3b = [];
      inst_g3b[0] = inst_(oper.test,   addr.Ev, addr.Iv);
      inst_g3b[1] = inst_(oper.notimp, dst,     src    );
      inst_g3b[2] = inst_(oper.not,    dst,     src    );
      inst_g3b[3] = inst_(oper.neg,    dst,     src    );
      inst_g3b[4] = inst_(oper.mul,    dst,     src    );
      inst_g3b[5] = inst_(oper.imul,   dst,     src    );
      inst_g3b[6] = inst_(oper.div,    dst,     src    );
      inst_g3b[7] = inst_(oper.idiv,   dst,     src    );
      return () => {
        return inst_g3b[this.opcode.reg]();
      };
    };
    let grp4 = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g4 = [];
      inst_g4[0] = inst_(oper.inc,    dst, src);
      inst_g4[1] = inst_(oper.dec,    dst, src);
      inst_g4[2] = inst_(oper.notimp          );
      inst_g4[3] = inst_(oper.notimp          );
      inst_g4[4] = inst_(oper.notimp          );
      inst_g4[5] = inst_(oper.notimp          );
      inst_g4[6] = inst_(oper.notimp          );
      inst_g4[7] = inst_(oper.notimp          );
      return () => {
        return inst_g4[this.opcode.reg]();
      };
    };
    let grp5 = (dst, src) => {
      dst = dst ? dst.bind(addr) : undefined;
      src = src ? src.bind(addr) : undefined;
      let inst_g5 = [];
      inst_g5[0] = inst_(oper.inc,  dst,    src);
      inst_g5[1] = inst_(oper.dec,  dst,    src);
      inst_g5[2] = inst_(oper.call, dst,    src);
      inst_g5[3] = inst_(oper.call, addr.Mp    );
      inst_g5[4] = inst_(oper.jmp,  dst,    src);
      inst_g5[5] = inst_(oper.jmp,  addr.Mp    );
      inst_g5[6] = inst_(oper.push, dst,    src);
      inst_g5[7] = inst_(oper.notimp           );
      return () => {
        return inst_g5[this.opcode.reg]();
      };
    };

    this.inst = [];
    this.inst[0x00] = inst_(oper.add,     addr.Eb, addr.Gb);
    this.inst[0x01] = inst_(oper.add,     addr.Ev, addr.Gv);
    this.inst[0x02] = inst_(oper.add,     addr.Gb, addr.Eb);
    this.inst[0x03] = inst_(oper.add,     addr.Gv, addr.Ev);
    this.inst[0x04] = inst_(oper.add,     addr.AL, addr.Ib);
    this.inst[0x05] = inst_(oper.add,     addr.AX, addr.Iv);
    this.inst[0x06] = inst_(oper.push,    addr.ES         );
    this.inst[0x07] = inst_(oper.pop,     addr.ES         );
    this.inst[0x08] = inst_(oper.or,      addr.Eb, addr.Gb);
    this.inst[0x09] = inst_(oper.or,      addr.Ev, addr.Gv);
    this.inst[0x0A] = inst_(oper.or,      addr.Gb, addr.Eb);
    this.inst[0x0B] = inst_(oper.or,      addr.Gv, addr.Ev);
    this.inst[0x0C] = inst_(oper.or,      addr.AL, addr.Ib);
    this.inst[0x0D] = inst_(oper.or,      addr.AX, addr.Iv);
    this.inst[0x0E] = inst_(oper.push,    addr.CS         );
    this.inst[0x0F] = inst_(oper.notimp                   );
    this.inst[0x10] = inst_(oper.adc,     addr.Eb, addr.Gb);
    this.inst[0x11] = inst_(oper.adc,     addr.Ev, addr.Gv);
    this.inst[0x12] = inst_(oper.adc,     addr.Gb, addr.Eb);
    this.inst[0x13] = inst_(oper.adc,     addr.Gv, addr.Ev);
    this.inst[0x14] = inst_(oper.adc,     addr.AL, addr.Ib);
    this.inst[0x15] = inst_(oper.adc,     addr.AX, addr.Iv);
    this.inst[0x16] = inst_(oper.push,    addr.SS         );
    this.inst[0x17] = inst_(oper.pop,     addr.SS         );
    this.inst[0x18] = inst_(oper.sbb,     addr.Eb, addr.Gb);
    this.inst[0x19] = inst_(oper.sbb,     addr.Ev, addr.Gv);
    this.inst[0x1A] = inst_(oper.sbb,     addr.Gb, addr.Eb);
    this.inst[0x1B] = inst_(oper.sbb,     addr.Gv, addr.Ev);
    this.inst[0x1C] = inst_(oper.sbb,     addr.AL, addr.Ib);
    this.inst[0x1D] = inst_(oper.sbb,     addr.AX, addr.Iv);
    this.inst[0x1E] = inst_(oper.push,    addr.DS         );
    this.inst[0x1F] = inst_(oper.pop,     addr.DS         );
    this.inst[0x20] = inst_(oper.and,     addr.Eb, addr.Gb);
    this.inst[0x21] = inst_(oper.and,     addr.Ev, addr.Gv);
    this.inst[0x22] = inst_(oper.and,     addr.Gb, addr.Eb);
    this.inst[0x23] = inst_(oper.and,     addr.Gv, addr.Ev);
    this.inst[0x24] = inst_(oper.and,     addr.AL, addr.Ib);
    this.inst[0x25] = inst_(oper.and,     addr.AX, addr.Iv);
    this.inst[0x26] = inst_(oper.es                       );
    this.inst[0x27] = inst_(oper.daa                      );
    this.inst[0x28] = inst_(oper.sub,     addr.Eb, addr.Gb);
    this.inst[0x29] = inst_(oper.sub,     addr.Ev, addr.Gv);
    this.inst[0x2A] = inst_(oper.sub,     addr.Gb, addr.Eb);
    this.inst[0x2B] = inst_(oper.sub,     addr.Gv, addr.Ev);
    this.inst[0x2C] = inst_(oper.sub,     addr.AL, addr.Ib);
    this.inst[0x2D] = inst_(oper.sub,     addr.AX, addr.Iv);
    this.inst[0x2E] = inst_(oper.cs                       );
    this.inst[0x2F] = inst_(oper.das                      );
    this.inst[0x30] = inst_(oper.xor,     addr.Eb, addr.Gb);
    this.inst[0x31] = inst_(oper.xor,     addr.Ev, addr.Gv);
    this.inst[0x32] = inst_(oper.xor,     addr.Gb, addr.Eb);
    this.inst[0x33] = inst_(oper.xor,     addr.Gv, addr.Ev);
    this.inst[0x34] = inst_(oper.xor,     addr.AL, addr.Ib);
    this.inst[0x35] = inst_(oper.xor,     addr.AX, addr.Iv);
    this.inst[0x36] = inst_(oper.ss                       );
    this.inst[0x37] = inst_(oper.aaa                      );
    this.inst[0x38] = inst_(oper.cmp,     addr.Eb, addr.Gb);
    this.inst[0x39] = inst_(oper.cmp,     addr.Ev, addr.Gv);
    this.inst[0x3A] = inst_(oper.cmp,     addr.Gb, addr.Eb);
    this.inst[0x3B] = inst_(oper.cmp,     addr.Gv, addr.Ev);
    this.inst[0x3C] = inst_(oper.cmp,     addr.AL, addr.Ib);
    this.inst[0x3D] = inst_(oper.cmp,     addr.AX, addr.Iv);
    this.inst[0x3E] = inst_(oper.ds                       );
    this.inst[0x3F] = inst_(oper.aas                      );
    this.inst[0x40] = inst_(oper.inc,     addr.AX         );
    this.inst[0x41] = inst_(oper.inc,     addr.CX         );
    this.inst[0x42] = inst_(oper.inc,     addr.DX         );
    this.inst[0x43] = inst_(oper.inc,     addr.BX         );
    this.inst[0x44] = inst_(oper.inc,     addr.SP         );
    this.inst[0x45] = inst_(oper.inc,     addr.BP         );
    this.inst[0x46] = inst_(oper.inc,     addr.SI         );
    this.inst[0x47] = inst_(oper.inc,     addr.DI         );
    this.inst[0x48] = inst_(oper.dec,     addr.AX         );
    this.inst[0x49] = inst_(oper.dec,     addr.CX         );
    this.inst[0x4A] = inst_(oper.dec,     addr.DX         );
    this.inst[0x4B] = inst_(oper.dec,     addr.BX         );
    this.inst[0x4C] = inst_(oper.dec,     addr.SP         );
    this.inst[0x4D] = inst_(oper.dec,     addr.BP         );
    this.inst[0x4E] = inst_(oper.dec,     addr.SI         );
    this.inst[0x4F] = inst_(oper.dec,     addr.DI         );
    this.inst[0x50] = inst_(oper.push,    addr.AX         );
    this.inst[0x51] = inst_(oper.push,    addr.CX         );
    this.inst[0x52] = inst_(oper.push,    addr.DX         );
    this.inst[0x53] = inst_(oper.push,    addr.BX         );
    this.inst[0x54] = inst_(oper.push,    addr.SP         );
    this.inst[0x55] = inst_(oper.push,    addr.BP         );
    this.inst[0x56] = inst_(oper.push,    addr.SI         );
    this.inst[0x57] = inst_(oper.push,    addr.DI         );
    this.inst[0x58] = inst_(oper.pop,     addr.AX         );
    this.inst[0x59] = inst_(oper.pop,     addr.CX         );
    this.inst[0x5A] = inst_(oper.pop,     addr.DX         );
    this.inst[0x5B] = inst_(oper.pop,     addr.BX         );
    this.inst[0x5C] = inst_(oper.pop,     addr.SP         );
    this.inst[0x5D] = inst_(oper.pop,     addr.BP         );
    this.inst[0x5E] = inst_(oper.pop,     addr.SI         );
    this.inst[0x5F] = inst_(oper.pop,     addr.DI         );
    this.inst[0x60] = inst_(oper.notimp                   );
    this.inst[0x61] = inst_(oper.notimp                   );
    this.inst[0x62] = inst_(oper.notimp                   );
    this.inst[0x63] = inst_(oper.notimp                   );
    this.inst[0x64] = inst_(oper.notimp                   );
    this.inst[0x65] = inst_(oper.notimp                   );
    this.inst[0x66] = inst_(oper.notimp                   );
    this.inst[0x67] = inst_(oper.notimp                   );
    this.inst[0x68] = inst_(oper.notimp                   );
    this.inst[0x69] = inst_(oper.notimp                   );
    this.inst[0x6A] = inst_(oper.notimp                   );
    this.inst[0x6B] = inst_(oper.notimp                   );
    this.inst[0x6C] = inst_(oper.notimp                   );
    this.inst[0x6D] = inst_(oper.notimp                   );
    this.inst[0x6E] = inst_(oper.notimp                   );
    this.inst[0x6F] = inst_(oper.notimp                   );
    this.inst[0x70] = inst_(oper.jo,      addr.Jb         );
    this.inst[0x71] = inst_(oper.jno,     addr.Jb         );
    this.inst[0x72] = inst_(oper.jb,      addr.Jb         );
    this.inst[0x73] = inst_(oper.jnb,     addr.Jb         );
    this.inst[0x74] = inst_(oper.jz,      addr.Jb         );
    this.inst[0x75] = inst_(oper.jnz,     addr.Jb         );
    this.inst[0x76] = inst_(oper.jbe,     addr.Jb         );
    this.inst[0x77] = inst_(oper.ja,      addr.Jb         );
    this.inst[0x78] = inst_(oper.js,      addr.Jb         );
    this.inst[0x79] = inst_(oper.jns,     addr.Jb         );
    this.inst[0x7A] = inst_(oper.jpe,     addr.Jb         );
    this.inst[0x7B] = inst_(oper.jpo,     addr.Jb         );
    this.inst[0x7C] = inst_(oper.jl,      addr.Jb         );
    this.inst[0x7D] = inst_(oper.jge,     addr.Jb         );
    this.inst[0x7E] = inst_(oper.jle,     addr.Jb         );
    this.inst[0x7F] = inst_(oper.jg,      addr.Jb         );
    this.inst[0x80] = grp1(               addr.Eb, addr.Ib);
    this.inst[0x81] = grp1(               addr.Ev, addr.Iv);
    this.inst[0x82] = grp1(               addr.Eb, addr.Ib);
    this.inst[0x83] = grp1(               addr.Ev, addr.Ib);
    this.inst[0x84] = inst_(oper.test,    addr.Gb, addr.Eb);
    this.inst[0x85] = inst_(oper.test,    addr.Gv, addr.Ev);
    this.inst[0x86] = inst_(oper.xchg,    addr.Gb, addr.Eb);
    this.inst[0x87] = inst_(oper.xchg,    addr.Gv, addr.Ev);
    this.inst[0x88] = inst_(oper.mov,     addr.Eb, addr.Gb);
    this.inst[0x89] = inst_(oper.mov,     addr.Ev, addr.Gv);
    this.inst[0x8A] = inst_(oper.mov,     addr.Gb, addr.Eb);
    this.inst[0x8B] = inst_(oper.mov,     addr.Gv, addr.Ev);
    this.inst[0x8C] = inst_(oper.mov,     addr.Ew, addr.Sw);
    this.inst[0x8D] = inst_(oper.lea,     addr.Gv, addr.M );
    this.inst[0x8E] = inst_(oper.mov,     addr.Sw, addr.Ew);
    this.inst[0x8F] = inst_(oper.pop,     addr.Ev         );
    this.inst[0x90] = inst_(oper.nop                      );
    this.inst[0x91] = inst_(oper.xchg,    addr.CX, addr.AX);
    this.inst[0x92] = inst_(oper.xchg,    addr.DX, addr.AX);
    this.inst[0x93] = inst_(oper.xchg,    addr.BX, addr.AX);
    this.inst[0x94] = inst_(oper.xchg,    addr.SP, addr.AX);
    this.inst[0x95] = inst_(oper.xchg,    addr.BP, addr.AX);
    this.inst[0x96] = inst_(oper.xchg,    addr.SI, addr.AX);
    this.inst[0x97] = inst_(oper.xchg,    addr.DI, addr.AX);
    this.inst[0x98] = inst_(oper.cbw                      );
    this.inst[0x99] = inst_(oper.cwd                      );
    this.inst[0x9A] = inst_(oper.call,    addr.Ap         );
    this.inst[0x9B] = inst_(oper.wait                     );
    this.inst[0x9C] = inst_(oper.pushf                    );
    this.inst[0x9D] = inst_(oper.popf                     );
    this.inst[0x9E] = inst_(oper.sahf                     );
    this.inst[0x9F] = inst_(oper.lahf                     );
    this.inst[0xA0] = inst_(oper.mov,     addr.AL, addr.Ob);
    this.inst[0xA1] = inst_(oper.mov,     addr.AX, addr.Ov);
    this.inst[0xA2] = inst_(oper.mov,     addr.Ob, addr.AL);
    this.inst[0xA3] = inst_(oper.mov,     addr.Ov, addr.AX);
    this.inst[0xA4] = inst_(oper.movsb                    );
    this.inst[0xA5] = inst_(oper.movsw                    );
    this.inst[0xA6] = inst_(oper.cmpsb                    );
    this.inst[0xA7] = inst_(oper.cmpsw                    );
    this.inst[0xA8] = inst_(oper.test,    addr.AL, addr.Ib);
    this.inst[0xA9] = inst_(oper.test,    addr.AX, addr.Iv);
    this.inst[0xAA] = inst_(oper.stosb                    );
    this.inst[0xAB] = inst_(oper.stosw                    );
    this.inst[0xAC] = inst_(oper.lodsb                    );
    this.inst[0xAD] = inst_(oper.lodsw                    );
    this.inst[0xAE] = inst_(oper.scasb                    );
    this.inst[0xAF] = inst_(oper.scasw                    );
    this.inst[0xB0] = inst_(oper.mov,     addr.AL, addr.Ib);
    this.inst[0xB1] = inst_(oper.mov,     addr.CL, addr.Ib);
    this.inst[0xB2] = inst_(oper.mov,     addr.DL, addr.Ib);
    this.inst[0xB3] = inst_(oper.mov,     addr.BL, addr.Ib);
    this.inst[0xB4] = inst_(oper.mov,     addr.AH, addr.Ib);
    this.inst[0xB5] = inst_(oper.mov,     addr.CH, addr.Ib);
    this.inst[0xB6] = inst_(oper.mov,     addr.DH, addr.Ib);
    this.inst[0xB7] = inst_(oper.mov,     addr.BH, addr.Ib);
    this.inst[0xB8] = inst_(oper.mov,     addr.AX, addr.Iv);
    this.inst[0xB9] = inst_(oper.mov,     addr.CX, addr.Iv);
    this.inst[0xBA] = inst_(oper.mov,     addr.DX, addr.Iv);
    this.inst[0xBB] = inst_(oper.mov,     addr.BX, addr.Iv);
    this.inst[0xBC] = inst_(oper.mov,     addr.SP, addr.Iv);
    this.inst[0xBD] = inst_(oper.mov,     addr.BP, addr.Iv);
    this.inst[0xBE] = inst_(oper.mov,     addr.SI, addr.Iv);
    this.inst[0xBF] = inst_(oper.mov,     addr.DI, addr.Iv);
    this.inst[0xC0] = inst_(oper.notimp                   );
    this.inst[0xC1] = inst_(oper.notimp                   );
    this.inst[0xC2] = inst_(oper.ret,     addr.Iw         );
    this.inst[0xC3] = inst_(oper.ret                      );
    this.inst[0xC4] = inst_(oper.les,     addr.Gv, addr.Mp);
    this.inst[0xC5] = inst_(oper.lds,     addr.Gv, addr.Mp);
    this.inst[0xC6] = inst_(oper.mov,     addr.Eb, addr.Ib);
    this.inst[0xC7] = inst_(oper.mov,     addr.Ev, addr.Iv);
    this.inst[0xC8] = inst_(oper.notimp                   );
    this.inst[0xC9] = inst_(oper.notimp                   );
    this.inst[0xCA] = inst_(oper.retf,    addr.Iw         );
    this.inst[0xCB] = inst_(oper.retf                     );
    this.inst[0xCC] = inst_(oper.int,     addr._3         );
    this.inst[0xCD] = inst_(oper.int,     addr.Ib         );
    this.inst[0xCE] = inst_(oper.into                     );
    this.inst[0xCF] = inst_(oper.iret                     );
    this.inst[0xD0] = grp2(               addr.Eb, addr._1);
    this.inst[0xD1] = grp2(               addr.Ev, addr._1);
    this.inst[0xD2] = grp2(               addr.Eb, addr.CL);
    this.inst[0xD3] = grp2(               addr.Ev, addr.CL);
    this.inst[0xD4] = inst_(oper.aam,     addr.I0         );
    this.inst[0xD5] = inst_(oper.aad,     addr.I0         );
    this.inst[0xD6] = inst_(oper.notimp                   );
    this.inst[0xD7] = inst_(oper.xlat                     );
    this.inst[0xD8] = inst_(oper.notimp                   );
    this.inst[0xD9] = inst_(oper.notimp                   );
    this.inst[0xDA] = inst_(oper.notimp                   );
    this.inst[0xDB] = inst_(oper.notimp                   );
    this.inst[0xDC] = inst_(oper.notimp                   );
    this.inst[0xDD] = inst_(oper.notimp                   );
    this.inst[0xDE] = inst_(oper.notimp                   );
    this.inst[0xDF] = inst_(oper.notimp                   );
    this.inst[0xE0] = inst_(oper.loopnz,  addr.Jb         );
    this.inst[0xE1] = inst_(oper.loopz,   addr.Jb         );
    this.inst[0xE2] = inst_(oper.loop,    addr.Jb         );
    this.inst[0xE3] = inst_(oper.jcxz,    addr.Jb         );
    this.inst[0xE4] = inst_(oper.iin,     addr.AL, addr.Ib);
    this.inst[0xE5] = inst_(oper.iin,     addr.AX, addr.Ib);
    this.inst[0xE6] = inst_(oper.out,     addr.Ib, addr.AL);
    this.inst[0xE7] = inst_(oper.out,     addr.Ib, addr.AX);
    this.inst[0xE8] = inst_(oper.call,    addr.Jv         );
    this.inst[0xE9] = inst_(oper.jmp,     addr.Jv         );
    this.inst[0xEA] = inst_(oper.jmp,     addr.Ap         );
    this.inst[0xEB] = inst_(oper.jmp,     addr.Jb         );
    this.inst[0xEC] = inst_(oper.iin,     addr.AL, addr.DX);
    this.inst[0xED] = inst_(oper.iin,     addr.AX, addr.DX);
    this.inst[0xEE] = inst_(oper.out,     addr.DX, addr.AL);
    this.inst[0xEF] = inst_(oper.out,     addr.DX, addr.AX);
    this.inst[0xF0] = inst_(oper.lock                     );
    this.inst[0xF1] = inst_(oper.notimp                   );
    this.inst[0xF2] = inst_(oper.repnz                    );
    this.inst[0xF3] = inst_(oper.repz                     );
    this.inst[0xF4] = inst_(oper.hlt                      );
    this.inst[0xF5] = inst_(oper.cmc                      );
    this.inst[0xF6] = grp3a(              addr.Eb         );
    this.inst[0xF7] = grp3b(              addr.Ev         );
    this.inst[0xF8] = inst_(oper.clc                      );
    this.inst[0xF9] = inst_(oper.stc                      );
    this.inst[0xFA] = inst_(oper.cli                      );
    this.inst[0xFB] = inst_(oper.sti                      );
    this.inst[0xFC] = inst_(oper.cld                      );
    this.inst[0xFD] = inst_(oper.std                      );
    this.inst[0xFE] = grp4(               addr.Eb         );
    this.inst[0xFF] = grp5(               addr.Ev         );
  }

  decode () {
    let opcode_byte = this.mem8[segIP(this)];
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
    };

    this.opcode.inst = this.inst[this.opcode.opcode_byte];
    this.opcode.string = this.opcode.inst.name
  }

  cycle () {
    winston.log("debug", "8086.cycle()             : Running instruction cycle [" + this.reg16[regIP] + "]");
    // Reset the instruction cycle counter
    this.cycleIP = 0;
    this.decode();

    winston.log("debug", "  CS:IP: " + hexString16(this.reg16[regCS]) + ":" + hexString16(this.reg16[regIP]));
    winston.log("debug", "  MEMORY:\n" + formatMemory(this.mem8, segIP(this), segIP(this) + 7, 11));
    winston.log("debug", "  OPCODE:\n" + formatOpcode(this.opcode, 11));
    winston.log("debug", "  FLAGS:\n" + formatFlags(this.reg16[regFlags], 10));
    winston.log("debug", "  INSTRUCTION: " +  this.opcode.string);

    let result = this.opcode.inst();
    winston.log("debug", "  result: " + hexString16(result));

    this.reg16[regIP] += this.cycleIP;
  }

  setAF_FLAG_sub (operand1, operand2) {
    if ((operand1 & 0x0F) < (operand2 & 0x0F)) this.reg16[regFlags] |= FLAG_AF_MASK;
    else this.reg16[regFlags] &= ~FLAG_AF_MASK;
  }

  setCF_FLAG_sub (operand1, operand2) {
    if (operand1 < operand2) this.reg16[regFlags] |= FLAG_CF_MASK;
  }

  setOF_FLAG (operand1, operand2, result) {
    let shift;
    let size = this.opcode.w;
    if (1 === size) shift = 15; else shift = 7;

    if ( 1 === (operand1 >> shift) && 1 === (operand2 >> shift) && 0 === (result >> shift) ||
         0 === (operand1 >> shift) && 0 === (operand2 >> shift) && 1 === (result >> shift))
      this.reg16[regFlags] = this.reg16[regFlags] | FLAG_OF_MASK;
    else this.reg16[regFlags] &= ~FLAG_OF_MASK;
  }

  setPF_FLAG (result) {
    let bitRep = result.toString(2);
    let bitCnt = 0;
    for (let b in bitRep) { if ("1" === bitRep[b]) bitCnt++; }

    if (0 === (bitCnt % 2)) this.reg16[regFlags] |= FLAG_PF_MASK;
    else this.reg16[regFlags] &= ~FLAG_PF_MASK;
  }

  setSF_FLAG (result) {
    let size = this.opcode.w;
    if (0 === size && (result & 0xFF) >> 7) this.reg16[regFlags] |= FLAG_SF_MASK;
    else if (1 === size && (result & 0xFFFF) >> 15) this.reg16[regFlags] |= FLAG_SF_MASK;
    else this.reg16[regFlags] &= ~FLAG_SF_MASK;
  }

  setZF_FLAG (result) {
    if (0 === result) this.reg16[regFlags] |= FLAG_ZF_MASK;
    else this.reg16[regFlags] &= ~FLAG_ZF_MASK;
  }

  saveState () {
    // save all the stateful attributes to bjson
    // this could/should go in a parent class
  }

  loadState () {
    // load all stateful attributes from bjson
    // this could/should go in a parent class
  }
}
