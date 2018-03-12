import winston from 'winston';

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

    // Wrapper class for instructions. I don't think I can move this to a
    // module because I need to close over oper and addr for binding and I
    // don't want to make the signature messy by passing them in.
    class inst {
      constructor(op, dst, src) {
        this.op = op ? op.bind(oper) : undefined;
        this.dst = dst ? dst.bind(addr) : undefined;
        this.src = src ? src.bind(addr) : undefined;
      }
      run() {
        return this.op(this.dst, this.src);
      }
      toString() {
        let opName = typeof this.op === 'function' ? this.op.name.replace("bound ", "") : "[Unknown Op]";
        let dstName = typeof this.dst === 'function' ? this.dst.name.replace("bound ", "") : "";
        let srcName = typeof this.src === 'function' ? this.src.name.replace("bound ", "") : "";
        return opName + " " + dstName + ", " + srcName;
      }
    }

    this.inst = [];
    this.inst[0x00] = new inst(oper.add,     addr.Eb, addr.Gb);
    this.inst[0x01] = new inst(oper.add,     addr.Ev, addr.Gv);
    this.inst[0x02] = new inst(oper.add,     addr.Gb, addr.Eb);
    this.inst[0x03] = new inst(oper.add,     addr.Gv, addr.Ev);
    this.inst[0x04] = new inst(oper.add,     addr.AL, addr.Ib);
    this.inst[0x05] = new inst(oper.add,     addr.AX, addr.Iv);
    this.inst[0x06] = new inst(oper.push,    addr.ES         );
    this.inst[0x07] = new inst(oper.pop,     addr.ES         );
    this.inst[0x08] = new inst(oper.or,      addr.Eb, addr.Gb);
    this.inst[0x09] = new inst(oper.or,      addr.Ev, addr.Gv);
    this.inst[0x0A] = new inst(oper.or,      addr.Gb, addr.Eb);
    this.inst[0x0B] = new inst(oper.or,      addr.Gv, addr.Ev);
    this.inst[0x0C] = new inst(oper.or,      addr.AL, addr.Ib);
    this.inst[0x0D] = new inst(oper.or,      addr.AX, addr.Iv);
    this.inst[0x0E] = new inst(oper.push,    addr.CS         );
    this.inst[0x0F] = new inst(oper.notimp                   );
    this.inst[0x10] = new inst(oper.adc,     addr.Eb, addr.Gb);
    this.inst[0x11] = new inst(oper.adc,     addr.Ev, addr.Gv);
    this.inst[0x12] = new inst(oper.adc,     addr.Gb, addr.Eb);
    this.inst[0x13] = new inst(oper.adc,     addr.Gv, addr.Ev);
    this.inst[0x14] = new inst(oper.adc,     addr.AL, addr.Ib);
    this.inst[0x15] = new inst(oper.adc,     addr.AX, addr.Iv);
    this.inst[0x16] = new inst(oper.push,    addr.SS         );
    this.inst[0x17] = new inst(oper.pop,     addr.SS         );
    this.inst[0x18] = new inst(oper.sbb,     addr.Eb, addr.Gb);
    this.inst[0x19] = new inst(oper.sbb,     addr.Ev, addr.Gv);
    this.inst[0x1A] = new inst(oper.sbb,     addr.Gb, addr.Eb);
    this.inst[0x1B] = new inst(oper.sbb,     addr.Gv, addr.Ev);
    this.inst[0x1C] = new inst(oper.sbb,     addr.AL, addr.Ib);
    this.inst[0x1D] = new inst(oper.sbb,     addr.AX, addr.Iv);
    this.inst[0x1E] = new inst(oper.push,    addr.DS         );
    this.inst[0x1F] = new inst(oper.pop,     addr.DS         );
    this.inst[0x20] = new inst(oper.and,     addr.Eb, addr.Gb);
    this.inst[0x21] = new inst(oper.and,     addr.Ev, addr.Gv);
    this.inst[0x22] = new inst(oper.and,     addr.Gb, addr.Eb);
    this.inst[0x23] = new inst(oper.and,     addr.Gv, addr.Ev);
    this.inst[0x24] = new inst(oper.and,     addr.AL, addr.Ib);
    this.inst[0x25] = new inst(oper.and,     addr.AX, addr.Iv);
    this.inst[0x26] = new inst(oper.es                       );
    this.inst[0x27] = new inst(oper.daa                      );
    this.inst[0x28] = new inst(oper.sub,     addr.Eb, addr.Gb);
    this.inst[0x29] = new inst(oper.sub,     addr.Ev, addr.Gv);
    this.inst[0x2A] = new inst(oper.sub,     addr.Gb, addr.Eb);
    this.inst[0x2B] = new inst(oper.sub,     addr.Gv, addr.Ev);
    this.inst[0x2C] = new inst(oper.sub,     addr.AL, addr.Ib);
    this.inst[0x2D] = new inst(oper.sub,     addr.AX, addr.Iv);
    this.inst[0x2E] = new inst(oper.cs                       );
    this.inst[0x2F] = new inst(oper.das                      );
    this.inst[0x30] = new inst(oper.xor,     addr.Eb, addr.Gb);
    this.inst[0x31] = new inst(oper.xor,     addr.Ev, addr.Gv);
    this.inst[0x32] = new inst(oper.xor,     addr.Gb, addr.Eb);
    this.inst[0x33] = new inst(oper.xor,     addr.Gv, addr.Ev);
    this.inst[0x34] = new inst(oper.xor,     addr.AL, addr.Ib);
    this.inst[0x35] = new inst(oper.xor,     addr.AX, addr.Iv);
    this.inst[0x36] = new inst(oper.ss                       );
    this.inst[0x37] = new inst(oper.aaa                      );
    this.inst[0x38] = new inst(oper.cmp,     addr.Eb, addr.Gb);
    this.inst[0x39] = new inst(oper.cmp,     addr.Ev, addr.Gv);
    this.inst[0x3A] = new inst(oper.cmp,     addr.Gb, addr.Eb);
    this.inst[0x3B] = new inst(oper.cmp,     addr.Gv, addr.Ev);
    this.inst[0x3C] = new inst(oper.cmp,     addr.AL, addr.Ib);
    this.inst[0x3D] = new inst(oper.cmp,     addr.AX, addr.Iv);
    this.inst[0x3E] = new inst(oper.ds                       );
    this.inst[0x3F] = new inst(oper.aas                      );
    this.inst[0x40] = new inst(oper.inc,     addr.AX         );
    this.inst[0x41] = new inst(oper.inc,     addr.CX         );
    this.inst[0x42] = new inst(oper.inc,     addr.DX         );
    this.inst[0x43] = new inst(oper.inc,     addr.BX         );
    this.inst[0x44] = new inst(oper.inc,     addr.SP         );
    this.inst[0x45] = new inst(oper.inc,     addr.BP         );
    this.inst[0x46] = new inst(oper.inc,     addr.SI         );
    this.inst[0x47] = new inst(oper.inc,     addr.DI         );
    this.inst[0x48] = new inst(oper.dec,     addr.AX         );
    this.inst[0x49] = new inst(oper.dec,     addr.CX         );
    this.inst[0x4A] = new inst(oper.dec,     addr.DX         );
    this.inst[0x4B] = new inst(oper.dec,     addr.BX         );
    this.inst[0x4C] = new inst(oper.dec,     addr.SP         );
    this.inst[0x4D] = new inst(oper.dec,     addr.BP         );
    this.inst[0x4E] = new inst(oper.dec,     addr.SI         );
    this.inst[0x4F] = new inst(oper.dec,     addr.DI         );
    this.inst[0x50] = new inst(oper.push,    addr.AX         );
    this.inst[0x51] = new inst(oper.push,    addr.CX         );
    this.inst[0x52] = new inst(oper.push,    addr.DX         );
    this.inst[0x53] = new inst(oper.push,    addr.BX         );
    this.inst[0x54] = new inst(oper.push,    addr.SP         );
    this.inst[0x55] = new inst(oper.push,    addr.BP         );
    this.inst[0x56] = new inst(oper.push,    addr.SI         );
    this.inst[0x57] = new inst(oper.push,    addr.DI         );
    this.inst[0x58] = new inst(oper.pop,     addr.AX         );
    this.inst[0x59] = new inst(oper.pop,     addr.CX         );
    this.inst[0x5A] = new inst(oper.pop,     addr.DX         );
    this.inst[0x5B] = new inst(oper.pop,     addr.BX         );
    this.inst[0x5C] = new inst(oper.pop,     addr.SP         );
    this.inst[0x5D] = new inst(oper.pop,     addr.BP         );
    this.inst[0x5E] = new inst(oper.pop,     addr.SI         );
    this.inst[0x5F] = new inst(oper.pop,     addr.DI         );
    this.inst[0x60] = new inst(oper.notimp                   );
    this.inst[0x61] = new inst(oper.notimp                   );
    this.inst[0x62] = new inst(oper.notimp                   );
    this.inst[0x63] = new inst(oper.notimp                   );
    this.inst[0x64] = new inst(oper.notimp                   );
    this.inst[0x65] = new inst(oper.notimp                   );
    this.inst[0x66] = new inst(oper.notimp                   );
    this.inst[0x67] = new inst(oper.notimp                   );
    this.inst[0x68] = new inst(oper.notimp                   );
    this.inst[0x69] = new inst(oper.notimp                   );
    this.inst[0x6A] = new inst(oper.notimp                   );
    this.inst[0x6B] = new inst(oper.notimp                   );
    this.inst[0x6C] = new inst(oper.notimp                   );
    this.inst[0x6D] = new inst(oper.notimp                   );
    this.inst[0x6E] = new inst(oper.notimp                   );
    this.inst[0x6F] = new inst(oper.notimp                   );
    this.inst[0x70] = new inst(oper.jo,      addr.Jb         );
    this.inst[0x71] = new inst(oper.jno,     addr.Jb         );
    this.inst[0x72] = new inst(oper.jb,      addr.Jb         );
    this.inst[0x73] = new inst(oper.jnb,     addr.Jb         );
    this.inst[0x74] = new inst(oper.jz,      addr.Jb         );
    this.inst[0x75] = new inst(oper.jnz,     addr.Jb         );
    this.inst[0x76] = new inst(oper.jbe,     addr.Jb         );
    this.inst[0x77] = new inst(oper.ja,      addr.Jb         );
    this.inst[0x78] = new inst(oper.js,      addr.Jb         );
    this.inst[0x79] = new inst(oper.jns,     addr.Jb         );
    this.inst[0x7A] = new inst(oper.jpe,     addr.Jb         );
    this.inst[0x7B] = new inst(oper.jpo,     addr.Jb         );
    this.inst[0x7C] = new inst(oper.jl,      addr.Jb         );
    this.inst[0x7D] = new inst(oper.jge,     addr.Jb         );
    this.inst[0x7E] = new inst(oper.jle,     addr.Jb         );
    this.inst[0x7F] = new inst(oper.jg,      addr.Jb         );

    // Group 1 instructions
    this.inst[0x80] = [];
    this.inst[0x80][0] = new inst(oper.add, addr.Eb, addr.Ib);
    this.inst[0x80][1] = new inst(oper.or,  addr.Eb, addr.Ib);
    this.inst[0x80][2] = new inst(oper.adc, addr.Eb, addr.Ib);
    this.inst[0x80][3] = new inst(oper.sbb, addr.Eb, addr.Ib);
    this.inst[0x80][4] = new inst(oper.and, addr.Eb, addr.Ib);
    this.inst[0x80][5] = new inst(oper.sub, addr.Eb, addr.Ib);
    this.inst[0x80][6] = new inst(oper.xor, addr.Eb, addr.Ib);
    this.inst[0x80][7] = new inst(oper.cmp, addr.Eb, addr.Ib);
    this.inst[0x81] = [];
    this.inst[0x81][0] = new inst(oper.add, addr.Ev, addr.Iv);
    this.inst[0x81][1] = new inst(oper.or,  addr.Ev, addr.Iv);
    this.inst[0x81][2] = new inst(oper.adc, addr.Ev, addr.Iv);
    this.inst[0x81][3] = new inst(oper.sbb, addr.Ev, addr.Iv);
    this.inst[0x81][4] = new inst(oper.and, addr.Ev, addr.Iv);
    this.inst[0x81][5] = new inst(oper.sub, addr.Ev, addr.Iv);
    this.inst[0x81][6] = new inst(oper.xor, addr.Ev, addr.Iv);
    this.inst[0x81][7] = new inst(oper.cmp, addr.Ev, addr.Iv);
    this.inst[0x82] = [];
    this.inst[0x82][0] = new inst(oper.add, addr.Eb, addr.Ib);
    this.inst[0x82][1] = new inst(oper.or,  addr.Eb, addr.Ib);
    this.inst[0x82][2] = new inst(oper.adc, addr.Eb, addr.Ib);
    this.inst[0x82][3] = new inst(oper.sbb, addr.Eb, addr.Ib);
    this.inst[0x82][4] = new inst(oper.and, addr.Eb, addr.Ib);
    this.inst[0x82][5] = new inst(oper.sub, addr.Eb, addr.Ib);
    this.inst[0x82][6] = new inst(oper.xor, addr.Eb, addr.Ib);
    this.inst[0x82][7] = new inst(oper.cmp, addr.Eb, addr.Ib);
    this.inst[0x83] = [];
    this.inst[0x83][0] = new inst(oper.add, addr.Ev, addr.Ib);
    this.inst[0x83][1] = new inst(oper.or,  addr.Ev, addr.Ib);
    this.inst[0x83][2] = new inst(oper.adc, addr.Ev, addr.Ib);
    this.inst[0x83][3] = new inst(oper.sbb, addr.Ev, addr.Ib);
    this.inst[0x83][4] = new inst(oper.and, addr.Ev, addr.Ib);
    this.inst[0x83][5] = new inst(oper.sub, addr.Ev, addr.Ib);
    this.inst[0x83][6] = new inst(oper.xor, addr.Ev, addr.Ib);
    this.inst[0x83][7] = new inst(oper.cmp, addr.Ev, addr.Ib);

    this.inst[0x84] = new inst(oper.test,    addr.Gb, addr.Eb);
    this.inst[0x85] = new inst(oper.test,    addr.Gv, addr.Ev);
    this.inst[0x86] = new inst(oper.xchg,    addr.Gb, addr.Eb);
    this.inst[0x87] = new inst(oper.xchg,    addr.Gv, addr.Ev);
    this.inst[0x88] = new inst(oper.mov,     addr.Eb, addr.Gb);
    this.inst[0x89] = new inst(oper.mov,     addr.Ev, addr.Gv);
    this.inst[0x8A] = new inst(oper.mov,     addr.Gb, addr.Eb);
    this.inst[0x8B] = new inst(oper.mov,     addr.Gv, addr.Ev);
    this.inst[0x8C] = new inst(oper.mov,     addr.Ew, addr.Sw);
    this.inst[0x8D] = new inst(oper.lea,     addr.Gv, addr.M );
    this.inst[0x8E] = new inst(oper.mov,     addr.Sw, addr.Ew);
    this.inst[0x8F] = new inst(oper.pop,     addr.Ev         );
    this.inst[0x90] = new inst(oper.nop                      );
    this.inst[0x91] = new inst(oper.xchg,    addr.CX, addr.AX);
    this.inst[0x92] = new inst(oper.xchg,    addr.DX, addr.AX);
    this.inst[0x93] = new inst(oper.xchg,    addr.BX, addr.AX);
    this.inst[0x94] = new inst(oper.xchg,    addr.SP, addr.AX);
    this.inst[0x95] = new inst(oper.xchg,    addr.BP, addr.AX);
    this.inst[0x96] = new inst(oper.xchg,    addr.SI, addr.AX);
    this.inst[0x97] = new inst(oper.xchg,    addr.DI, addr.AX);
    this.inst[0x98] = new inst(oper.cbw                      );
    this.inst[0x99] = new inst(oper.cwd                      );
    this.inst[0x9A] = new inst(oper.call,    addr.Ap         );
    this.inst[0x9B] = new inst(oper.wait                     );
    this.inst[0x9C] = new inst(oper.pushf                    );
    this.inst[0x9D] = new inst(oper.popf                     );
    this.inst[0x9E] = new inst(oper.sahf                     );
    this.inst[0x9F] = new inst(oper.lahf                     );
    this.inst[0xA0] = new inst(oper.mov,     addr.AL, addr.Ob);
    this.inst[0xA1] = new inst(oper.mov,     addr.AX, addr.Ov);
    this.inst[0xA2] = new inst(oper.mov,     addr.Ob, addr.AL);
    this.inst[0xA3] = new inst(oper.mov,     addr.Ov, addr.AX);
    this.inst[0xA4] = new inst(oper.movsb                    );
    this.inst[0xA5] = new inst(oper.movsw                    );
    this.inst[0xA6] = new inst(oper.cmpsb                    );
    this.inst[0xA7] = new inst(oper.cmpsw                    );
    this.inst[0xA8] = new inst(oper.test,    addr.AL, addr.Ib);
    this.inst[0xA9] = new inst(oper.test,    addr.AX, addr.Iv);
    this.inst[0xAA] = new inst(oper.stosb                    );
    this.inst[0xAB] = new inst(oper.stosw                    );
    this.inst[0xAC] = new inst(oper.lodsb                    );
    this.inst[0xAD] = new inst(oper.lodsw                    );
    this.inst[0xAE] = new inst(oper.scasb                    );
    this.inst[0xAF] = new inst(oper.scasw                    );
    this.inst[0xB0] = new inst(oper.mov,     addr.AL, addr.Ib);
    this.inst[0xB1] = new inst(oper.mov,     addr.CL, addr.Ib);
    this.inst[0xB2] = new inst(oper.mov,     addr.DL, addr.Ib);
    this.inst[0xB3] = new inst(oper.mov,     addr.BL, addr.Ib);
    this.inst[0xB4] = new inst(oper.mov,     addr.AH, addr.Ib);
    this.inst[0xB5] = new inst(oper.mov,     addr.CH, addr.Ib);
    this.inst[0xB6] = new inst(oper.mov,     addr.DH, addr.Ib);
    this.inst[0xB7] = new inst(oper.mov,     addr.BH, addr.Ib);
    this.inst[0xB8] = new inst(oper.mov,     addr.AX, addr.Iv);
    this.inst[0xB9] = new inst(oper.mov,     addr.CX, addr.Iv);
    this.inst[0xBA] = new inst(oper.mov,     addr.DX, addr.Iv);
    this.inst[0xBB] = new inst(oper.mov,     addr.BX, addr.Iv);
    this.inst[0xBC] = new inst(oper.mov,     addr.SP, addr.Iv);
    this.inst[0xBD] = new inst(oper.mov,     addr.BP, addr.Iv);
    this.inst[0xBE] = new inst(oper.mov,     addr.SI, addr.Iv);
    this.inst[0xBF] = new inst(oper.mov,     addr.DI, addr.Iv);
    this.inst[0xC0] = new inst(oper.notimp                   );
    this.inst[0xC1] = new inst(oper.notimp                   );
    this.inst[0xC2] = new inst(oper.ret,     addr.Iw         );
    this.inst[0xC3] = new inst(oper.ret                      );
    this.inst[0xC4] = new inst(oper.les,     addr.Gv, addr.Mp);
    this.inst[0xC5] = new inst(oper.lds,     addr.Gv, addr.Mp);
    this.inst[0xC6] = new inst(oper.mov,     addr.Eb, addr.Ib);
    this.inst[0xC7] = new inst(oper.mov,     addr.Ev, addr.Iv);
    this.inst[0xC8] = new inst(oper.notimp                   );
    this.inst[0xC9] = new inst(oper.notimp                   );
    this.inst[0xCA] = new inst(oper.retf,    addr.Iw         );
    this.inst[0xCB] = new inst(oper.retf                     );
    this.inst[0xCC] = new inst(oper.int,     addr._3         );
    this.inst[0xCD] = new inst(oper.int,     addr.Ib         );
    this.inst[0xCE] = new inst(oper.into                     );
    this.inst[0xCF] = new inst(oper.iret                     );

    // Group 2 instructions
    this.inst[0xD0] = [];
    this.inst[0xD0][0] = new inst(oper.rol,    addr.Eb, addr._1);
    this.inst[0xD0][1] = new inst(oper.ror,    addr.Eb, addr._1);
    this.inst[0xD0][2] = new inst(oper.rcl,    addr.Eb, addr._1);
    this.inst[0xD0][3] = new inst(oper.rcr,    addr.Eb, addr._1);
    this.inst[0xD0][4] = new inst(oper.shl,    addr.Eb, addr._1);
    this.inst[0xD0][5] = new inst(oper.shr,    addr.Eb, addr._1);
    this.inst[0xD0][6] = new inst(oper.notimp,                 );
    this.inst[0xD0][7] = new inst(oper.sar,    addr.Eb, addr._1);
    this.inst[0xD1] = [];
    this.inst[0xD1][0] = new inst(oper.rol,    addr.Ev, addr._1);
    this.inst[0xD1][1] = new inst(oper.ror,    addr.Ev, addr._1);
    this.inst[0xD1][2] = new inst(oper.rcl,    addr.Ev, addr._1);
    this.inst[0xD1][3] = new inst(oper.rcr,    addr.Ev, addr._1);
    this.inst[0xD1][4] = new inst(oper.shl,    addr.Ev, addr._1);
    this.inst[0xD1][5] = new inst(oper.shr,    addr.Ev, addr._1);
    this.inst[0xD1][6] = new inst(oper.notimp,                 );
    this.inst[0xD1][7] = new inst(oper.sar,    addr.Ev, addr._1);
    this.inst[0xD2] = [];
    this.inst[0xD2][0] = new inst(oper.rol,    addr.Eb, addr.CL);
    this.inst[0xD2][1] = new inst(oper.ror,    addr.Eb, addr.CL);
    this.inst[0xD2][2] = new inst(oper.rcl,    addr.Eb, addr.CL);
    this.inst[0xD2][3] = new inst(oper.rcr,    addr.Eb, addr.CL);
    this.inst[0xD2][4] = new inst(oper.shl,    addr.Eb, addr.CL);
    this.inst[0xD2][5] = new inst(oper.shr,    addr.Eb, addr.CL);
    this.inst[0xD2][6] = new inst(oper.notimp,                 );
    this.inst[0xD2][7] = new inst(oper.sar,    addr.Eb, addr.CL);
    this.inst[0xD3] = [];
    this.inst[0xD3][0] = new inst(oper.rol,    addr.Ev, addr.CL);
    this.inst[0xD3][1] = new inst(oper.ror,    addr.Ev, addr.CL);
    this.inst[0xD3][2] = new inst(oper.rcl,    addr.Ev, addr.CL);
    this.inst[0xD3][3] = new inst(oper.rcr,    addr.Ev, addr.CL);
    this.inst[0xD3][4] = new inst(oper.shl,    addr.Ev, addr.CL);
    this.inst[0xD3][5] = new inst(oper.shr,    addr.Ev, addr.CL);
    this.inst[0xD3][6] = new inst(oper.notimp,                 );
    this.inst[0xD3][7] = new inst(oper.sar,    addr.Ev, addr.CL);

    this.inst[0xD4] = new inst(oper.aam,     addr.Ib         );
    this.inst[0xD5] = new inst(oper.aad,     addr.Ib         );
    this.inst[0xD6] = new inst(oper.notimp                   );
    this.inst[0xD7] = new inst(oper.xlat                     );
    this.inst[0xD8] = new inst(oper.notimp                   );
    this.inst[0xD9] = new inst(oper.notimp                   );
    this.inst[0xDA] = new inst(oper.notimp                   );
    this.inst[0xDB] = new inst(oper.notimp                   );
    this.inst[0xDC] = new inst(oper.notimp                   );
    this.inst[0xDD] = new inst(oper.notimp                   );
    this.inst[0xDE] = new inst(oper.notimp                   );
    this.inst[0xDF] = new inst(oper.notimp                   );
    this.inst[0xE0] = new inst(oper.loopnz,  addr.Jb         );
    this.inst[0xE1] = new inst(oper.loopz,   addr.Jb         );
    this.inst[0xE2] = new inst(oper.loop,    addr.Jb         );
    this.inst[0xE3] = new inst(oper.jcxz,    addr.Jb         );
    this.inst[0xE4] = new inst(oper.iin,     addr.AL, addr.Ib);
    this.inst[0xE5] = new inst(oper.iin,     addr.AX, addr.Ib);
    this.inst[0xE6] = new inst(oper.out,     addr.Ib, addr.AL);
    this.inst[0xE7] = new inst(oper.out,     addr.Ib, addr.AX);
    this.inst[0xE8] = new inst(oper.call,    addr.Jv         );
    this.inst[0xE9] = new inst(oper.jmp,     addr.Jv         );
    this.inst[0xEA] = new inst(oper.jmp,     addr.Ap         );
    this.inst[0xEB] = new inst(oper.jmp,     addr.Jb         );
    this.inst[0xEC] = new inst(oper.iin,     addr.AL, addr.DX);
    this.inst[0xED] = new inst(oper.iin,     addr.AX, addr.DX);
    this.inst[0xEE] = new inst(oper.out,     addr.DX, addr.AL);
    this.inst[0xEF] = new inst(oper.out,     addr.DX, addr.AX);
    this.inst[0xF0] = new inst(oper.lock                     );
    this.inst[0xF1] = new inst(oper.notimp                   );
    this.inst[0xF2] = new inst(oper.repnz                    );
    this.inst[0xF3] = new inst(oper.repz                     );
    this.inst[0xF4] = new inst(oper.hlt                      );
    this.inst[0xF5] = new inst(oper.cmc                      );

    // Group 3a instructions
    this.inst[0xF6] = [];
    this.inst[0xF6][0] = new inst(oper.test,   addr.Eb, addr.Ib);
    this.inst[0xF6][1] = new inst(oper.notimp,                 );
    this.inst[0xF6][2] = new inst(oper.not,    addr.Eb,        );
    this.inst[0xF6][3] = new inst(oper.neg,    addr.Eb,        );
    this.inst[0xF6][4] = new inst(oper.mul,    addr.Eb,        );
    this.inst[0xF6][5] = new inst(oper.imul,   addr.Eb,        );
    this.inst[0xF6][6] = new inst(oper.div,    addr.Eb,        );
    this.inst[0xF6][7] = new inst(oper.idiv,   addr.Eb,        );

    // Group 3b instructions
    this.inst[0xF7] = [];
    this.inst[0xF7][0] = new inst(oper.test,   addr.Ev, addr.Iv);
    this.inst[0xF7][1] = new inst(oper.notimp, addr.Ev,        );
    this.inst[0xF7][2] = new inst(oper.not,    addr.Ev,        );
    this.inst[0xF7][3] = new inst(oper.neg,    addr.Ev,        );
    this.inst[0xF7][4] = new inst(oper.mul,    addr.Ev,        );
    this.inst[0xF7][5] = new inst(oper.imul,   addr.Ev,        );
    this.inst[0xF7][6] = new inst(oper.div,    addr.Ev,        );
    this.inst[0xF7][7] = new inst(oper.idiv,   addr.Ev,        );

    this.inst[0xF8] = new inst(oper.clc                      );
    this.inst[0xF9] = new inst(oper.stc                      );
    this.inst[0xFA] = new inst(oper.cli                      );
    this.inst[0xFB] = new inst(oper.sti                      );
    this.inst[0xFC] = new inst(oper.cld                      );
    this.inst[0xFD] = new inst(oper.std                      );

    // Group 4 instructions
    this.inst[0xFE] = [];
    this.inst[0xFE][0] = new inst(oper.inc,    addr.Eb,        );
    this.inst[0xFE][1] = new inst(oper.dec,    addr.Eb,        );
    this.inst[0xFE][2] = new inst(oper.notimp                  );
    this.inst[0xFE][3] = new inst(oper.notimp                  );
    this.inst[0xFE][4] = new inst(oper.notimp                  );
    this.inst[0xFE][5] = new inst(oper.notimp                  );
    this.inst[0xFE][6] = new inst(oper.notimp                  );
    this.inst[0xFE][7] = new inst(oper.notimp                  );

    // Group 5 instructions
    this.inst[0xFF] = [];
    this.inst[0xFF][0] = new inst(oper.inc,  addr.Ev,          );
    this.inst[0xFF][1] = new inst(oper.dec,  addr.Ev,          );
    this.inst[0xFF][2] = new inst(oper.call, addr.Ev,          );
    this.inst[0xFF][3] = new inst(oper.call, addr.Mp           );
    this.inst[0xFF][4] = new inst(oper.jmp,  addr.Ev,          );
    this.inst[0xFF][5] = new inst(oper.jmp,  addr.Mp           );
    this.inst[0xFF][6] = new inst(oper.push, addr.Ev,          );
    this.inst[0xFF][7] = new inst(oper.notimp                  );
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
    // If the instruction is an array it's a group instruction and we need
    // to extract further based on the register component of the addressing
    // byte
    if (this.opcode.inst instanceof Array) {
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }
    this.opcode.string = this.opcode.inst.toString();
  }

  cycle () {
    winston.log("debug", "8086.cycle()             : Running instruction cycle [" + this.reg16[regIP] + "]");
    // Reset the instruction cycle counter
    this.cycleIP = 0;
    this.decode();

    winston.log("debug", "  INSTRUCTION: " +  this.opcode.string);
    winston.log("debug", "  CS:IP:       " + hexString16(this.reg16[regCS]) + ":" + hexString16(this.reg16[regIP]));
    winston.log("debug", "  MEMORY:      " + formatMemory(this.mem8, segIP(this), segIP(this) + 13, 11));
    winston.log("debug", "  OPCODE:      " + formatOpcode(this.opcode, 17));
    winston.log("debug", "  FLAGS:       " + formatFlags(this.reg16[regFlags], 17));

    // let result = this.opcode.inst();
    let result = this.opcode.inst.run();

    winston.log("debug", "  result: " + hexString16(result));

    this.reg16[regIP] += this.cycleIP;
  }

  // TODO: Move these to Operations.js
  // setAF_FLAG_sub (operand1, operand2) {
  //   if ((operand1 & 0x0F) < (operand2 & 0x0F)) this.reg16[regFlags] |= FLAG_AF_MASK;
  //   else this.reg16[regFlags] &= ~FLAG_AF_MASK;
  // }
  //
  // setCF_FLAG_sub (operand1, operand2) {
  //   if (operand1 < operand2) this.reg16[regFlags] |= FLAG_CF_MASK;
  //   else this.reg16[regFlags] &= ~FLAG_CF_MASK;
  // }
  //
  // setOF_FLAG (operand1, operand2, result) {
  //   let shift;
  //   let size = this.opcode.w;
  //   if (1 === size) shift = 15; else shift = 7;
  //
  //   if ( 1 === (operand1 >> shift) && 1 === (operand2 >> shift) && 0 === (result >> shift) ||
  //        0 === (operand1 >> shift) && 0 === (operand2 >> shift) && 1 === (result >> shift))
  //     this.reg16[regFlags] = this.reg16[regFlags] | FLAG_OF_MASK;
  //   else this.reg16[regFlags] &= ~FLAG_OF_MASK;
  // }

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
