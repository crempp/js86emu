import winston from 'winston';

import { inst } from './Instructions.js'
import Operations from './operations.js'
import Addressing from './addressing.js'
import { CPUConfigException } from './Exceptions';
import CPUConfig from './CPUConfig';
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';
import { binString8, binString16, hexString8, hexString16,
  formatOpcode, formatMemory
} from './Debug'

export default class CPU8086 {
  constructor(config) {
    winston.log("debug", "8086: constructor()");

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
    this.reg16[regAX] = 0x0;
    this.reg16[regBX] = 0x0;
    this.reg16[regCX] = 0x0;
    this.reg16[regDX] = 0x0;
    this.reg16[regSI] = 0x0;
    this.reg16[regDI] = 0x0;
    this.reg16[regBP] = 0x0;
    this.reg16[regSP] = 0x0;
    this.reg16[regIP] = 0x0;
    this.reg16[regCS] = 0x0;
    this.reg16[regDS] = 0x0;
    this.reg16[regES] = 0x0;
    this.reg16[regSS] = 0x0;

    // Flags
    this.reg16[regFlags] = 0x0;

    // Opcode
    this.opcode = 0x00;

    // Supporting modules
    let addr = new Addressing(this);
    let oper = new Operations(this);

    winston.log("debug", "8086: Creating instruction table");
    let grp1 = (dst, src) => {
      console.log("grp1");

      let instr = [];
      instr[0] = inst(oper.add, dst, src);
      instr[1] = inst(oper.or,  dst, src);
      instr[2] = inst(oper.adc, dst, src);
      instr[3] = inst(oper.sbb, dst, src);
      instr[4] = inst(oper.and, dst, src);
      instr[5] = inst(oper.sub, dst, src);
      instr[6] = inst(oper.xor, dst, src);
      instr[7] = inst(oper.cmp, dst.bind(addr), src.bind(addr));

      // Need to return a function. The function runs the correct op with dst, src
      // In this case we don't know the correct op until we decode the reg component
      // at runtime
      return () => {
        console.log("  in anon inst executor - reg:", this.opcode.reg);
        return instr[this.opcode.reg](dst, src);
      };
    };
    let grp2 = () => {
      // GRP2/0 ROL
      // GRP2/1 ROR
      // GRP2/2 RCL
      // GRP2/3 RCR
      // GRP2/4 SHL
      // GRP2/5 SHR
      // GRP2/6 --
      // GRP2/7 SAR
    };
    let grp3a = () => {
      // GRP3a/0 T"ES"T "Eb, Ib);
      // GRP3a/1 --
      // GRP3a/2 NOT
      // GRP3a/3 NEG
      // GRP3a/4 MUL
      // GRP3a/5 IMUL
      // GRP3a/6 D"Iv);
      // GRP3a/7 ID"Iv);
      // GRP3b/0 T"ES"T "Ev, Iv);
    };
    let grp3b = () => {
      // GRP3b/1 --
      // GRP3b/2 NOT
      // GRP3b/3 NEG
      // GRP3b/4 MUL
      // GRP3b/5 IMUL
      // GRP3b/6 D"Iv);
      // GRP3b/7 ID"Iv);
    };
    let grp4 = () => {
      // GRP4/0 INC
      // GRP4/1 DEC
      // GRP4/2 --
      // GRP4/3 --
      // GRP4/4 --
      // GRP4/5 --
      // GRP4/6 --
      // GRP4/7 --
    };
    let grp5 = () => {
      let instr = [];
      instr[0] = inst(oper.inc);
      instr[1] = inst(oper.dec);
      instr[2] = inst(oper.call);
      instr[3] = inst(oper.call, addr.Mp);
      instr[4] = inst(oper.jmp);
      instr[5] = inst(oper.jmp, addr.Mp);
      instr[6] = inst(oper.push);
      instr[7] = inst(oper.notimp);
      return () => op(dst, src);
    };

    this.inst = [];
    this.inst[0x00] = inst(oper.add,     addr.Eb, addr.Gb);
    this.inst[0x01] = inst(oper.add,     addr.Ev, addr.Gv);
    this.inst[0x02] = inst(oper.add,     addr.Gb, addr.Eb);
    this.inst[0x03] = inst(oper.add,     addr.Gv, addr.Ev);
    this.inst[0x04] = inst(oper.add,     addr.AL, addr.Ib);
    this.inst[0x05] = inst(oper.add,     addr.AX, addr.Iv);
    this.inst[0x06] = inst(oper.push,    addr.ES);
    this.inst[0x07] = inst(oper.pop,     addr.ES);
    this.inst[0x08] = inst(oper.or,      addr.Eb, addr.Gb);
    this.inst[0x09] = inst(oper.or,      addr.Ev, addr.Gv);
    this.inst[0x0A] = inst(oper.or,      addr.Gb, addr.Eb);
    this.inst[0x0B] = inst(oper.or,      addr.Gv, addr.Ev);
    this.inst[0x0C] = inst(oper.or,      addr.AL, addr.Ib);
    this.inst[0x0D] = inst(oper.or,      addr.AX, addr.Iv);
    this.inst[0x0E] = inst(oper.push,    addr.CS);
    this.inst[0x0F] = inst(oper.notimp); // No Instruction
    this.inst[0x10] = inst(oper.adc,     addr.Eb, addr.Gb);
    this.inst[0x11] = inst(oper.adc,     addr.Ev, addr.Gv);
    this.inst[0x12] = inst(oper.adc,     addr.Gb, addr.Eb);
    this.inst[0x13] = inst(oper.adc,     addr.Gv, addr.Ev);
    this.inst[0x14] = inst(oper.adc,     addr.AL, addr.Ib);
    this.inst[0x15] = inst(oper.adc,     addr.AX, addr.Iv);
    this.inst[0x16] = inst(oper.push,    addr.SS);
    this.inst[0x17] = inst(oper.pop,     addr.SS);
    this.inst[0x18] = inst(oper.sbb,     addr.Eb, addr.Gb);
    this.inst[0x19] = inst(oper.sbb,     addr.Ev, addr.Gv);
    this.inst[0x1A] = inst(oper.sbb,     addr.Gb, addr.Eb);
    this.inst[0x1B] = inst(oper.sbb,     addr.Gv, addr.Ev);
    this.inst[0x1C] = inst(oper.sbb,     addr.AL, addr.Ib);
    this.inst[0x1D] = inst(oper.sbb,     addr.AX, addr.Iv);
    this.inst[0x1E] = inst(oper.push,    addr.DS);
    this.inst[0x1F] = inst(oper.pop,     addr.DS);
    this.inst[0x20] = inst(oper.and,     addr.Eb, addr.Gb);
    this.inst[0x21] = inst(oper.and,     addr.Ev, addr.Gv);
    this.inst[0x22] = inst(oper.and,     addr.Gb, addr.Eb);
    this.inst[0x23] = inst(oper.and,     addr.Gv, addr.Ev);
    this.inst[0x24] = inst(oper.and,     addr.AL, addr.Ib);
    this.inst[0x25] = inst(oper.and,     addr.AX, addr.Iv);
    this.inst[0x26] = inst(oper.es);
    this.inst[0x27] = inst(oper.daa);
    this.inst[0x28] = inst(oper.sub,     addr.Eb, addr.Gb);
    this.inst[0x29] = inst(oper.sub,     addr.Ev, addr.Gv);
    this.inst[0x2A] = inst(oper.sub,     addr.Gb, addr.Eb);
    this.inst[0x2B] = inst(oper.sub,     addr.Gv, addr.Ev);
    this.inst[0x2C] = inst(oper.sub,     addr.AL, addr.Ib);
    this.inst[0x2D] = inst(oper.sub,     addr.AX, addr.Iv);
    this.inst[0x2E] = inst(oper.cs);
    this.inst[0x2F] = inst(oper.das);
    this.inst[0x30] = inst(oper.xor,     addr.Eb, addr.Gb);
    this.inst[0x31] = inst(oper.xor,     addr.Ev, addr.Gv);
    this.inst[0x32] = inst(oper.xor,     addr.Gb, addr.Eb);
    this.inst[0x33] = inst(oper.xor,     addr.Gv, addr.Ev);
    this.inst[0x34] = inst(oper.xor,     addr.AL, addr.Ib);
    this.inst[0x35] = inst(oper.xor,     addr.AX, addr.Iv);
    this.inst[0x36] = inst(oper.ss);
    this.inst[0x37] = inst(oper.aaa);
    this.inst[0x38] = inst(oper.cmp,     addr.Eb, addr.Gb);
    this.inst[0x39] = inst(oper.cmp,     addr.Ev, addr.Gv);
    this.inst[0x3A] = inst(oper.cmp,     addr.Gb, addr.Eb);
    this.inst[0x3B] = inst(oper.cmp,     addr.Gv, addr.Ev);
    this.inst[0x3C] = inst(oper.cmp,     addr.AL, addr.Ib);
    this.inst[0x3D] = inst(oper.cmp,     addr.AX, addr.Iv);
    this.inst[0x3E] = inst(oper.ds);
    this.inst[0x3F] = inst(oper.aas);
    this.inst[0x40] = inst(oper.inc,     addr.AX);
    this.inst[0x41] = inst(oper.inc,     addr.CX);
    this.inst[0x42] = inst(oper.inc,     addr.DX);
    this.inst[0x43] = inst(oper.inc,     addr.BX);
    this.inst[0x44] = inst(oper.inc,     addr.SP);
    this.inst[0x45] = inst(oper.inc,     addr.BP);
    this.inst[0x46] = inst(oper.inc,     addr.SI);
    this.inst[0x47] = inst(oper.inc,     addr.DI);
    this.inst[0x48] = inst(oper.dec,     addr.AX);
    this.inst[0x49] = inst(oper.dec,     addr.CX);
    this.inst[0x4A] = inst(oper.dec,     addr.DX);
    this.inst[0x4B] = inst(oper.dec,     addr.BX);
    this.inst[0x4C] = inst(oper.dec,     addr.SP);
    this.inst[0x4D] = inst(oper.dec,     addr.BP);
    this.inst[0x4E] = inst(oper.dec,     addr.SI);
    this.inst[0x4F] = inst(oper.dec,     addr.DI);
    this.inst[0x50] = inst(oper.push,    addr.AX);
    this.inst[0x51] = inst(oper.push,    addr.CX);
    this.inst[0x52] = inst(oper.push,    addr.DX);
    this.inst[0x53] = inst(oper.push,    addr.BX);
    this.inst[0x54] = inst(oper.push,    addr.SP);
    this.inst[0x55] = inst(oper.push,    addr.BP);
    this.inst[0x56] = inst(oper.push,    addr.SI);
    this.inst[0x57] = inst(oper.push,    addr.DI);
    this.inst[0x58] = inst(oper.pop,     addr.AX);
    this.inst[0x59] = inst(oper.pop,     addr.CX);
    this.inst[0x5A] = inst(oper.pop,     addr.DX);
    this.inst[0x5B] = inst(oper.pop,     addr.BX);
    this.inst[0x5C] = inst(oper.pop,     addr.SP);
    this.inst[0x5D] = inst(oper.pop,     addr.BP);
    this.inst[0x5E] = inst(oper.pop,     addr.SI);
    this.inst[0x5F] = inst(oper.pop,     addr.DI);
    this.inst[0x60] = inst(oper.notimp); // No Instruction
    this.inst[0x61] = inst(oper.notimp); // No Instruction
    this.inst[0x62] = inst(oper.notimp); // No Instruction
    this.inst[0x63] = inst(oper.notimp); // No Instruction
    this.inst[0x64] = inst(oper.notimp); // No Instruction
    this.inst[0x65] = inst(oper.notimp); // No Instruction
    this.inst[0x66] = inst(oper.notimp); // No Instruction
    this.inst[0x67] = inst(oper.notimp); // No Instruction
    this.inst[0x68] = inst(oper.notimp); // No Instruction
    this.inst[0x69] = inst(oper.notimp); // No Instruction
    this.inst[0x6A] = inst(oper.notimp); // No Instruction
    this.inst[0x6B] = inst(oper.notimp); // No Instruction
    this.inst[0x6C] = inst(oper.notimp); // No Instruction
    this.inst[0x6D] = inst(oper.notimp); // No Instruction
    this.inst[0x6E] = inst(oper.notimp); // No Instruction
    this.inst[0x6F] = inst(oper.notimp); // No Instruction
    this.inst[0x70] = inst(oper.jo,      addr.Jb);
    this.inst[0x71] = inst(oper.jno,     addr.Jb);
    this.inst[0x72] = inst(oper.jb,      addr.Jb);
    this.inst[0x73] = inst(oper.jnb,     addr.Jb);
    this.inst[0x74] = inst(oper.jz,      addr.Jb);
    this.inst[0x75] = inst(oper.jnz,     addr.Jb);
    this.inst[0x76] = inst(oper.jbe,     addr.Jb);
    this.inst[0x77] = inst(oper.ja,      addr.Jb);
    this.inst[0x78] = inst(oper.js,      addr.Jb);
    this.inst[0x79] = inst(oper.jns,     addr.Jb);
    this.inst[0x7A] = inst(oper.jpe,     addr.Jb);
    this.inst[0x7B] = inst(oper.jpo,     addr.Jb);
    this.inst[0x7C] = inst(oper.jl,      addr.Jb);
    this.inst[0x7D] = inst(oper.jge,     addr.Jb);
    this.inst[0x7E] = inst(oper.jle,     addr.Jb);
    this.inst[0x7F] = inst(oper.jg,      addr.Jb);
    this.inst[0x80] = grp1(              addr.Eb, addr.Ib);
    this.inst[0x81] = grp1(              addr.Ev, addr.Iv);
    this.inst[0x82] = inst(grp1(         addr.Eb, addr.Ib));
    this.inst[0x83] = inst(grp1(         addr.Ev, addr.Ib));
    this.inst[0x84] = inst(oper.test,    addr.Gb, addr.Eb);
    this.inst[0x85] = inst(oper.test,    addr.Gv, addr.Ev);
    this.inst[0x86] = inst(oper.xchg,    addr.Gb, addr.Eb);
    this.inst[0x87] = inst(oper.xchg,    addr.Gv, addr.Ev);
    this.inst[0x88] = inst(oper.mov,     addr.Eb, addr.Gb);
    this.inst[0x89] = inst(oper.mov,     addr.Ev, addr.Gv);
    this.inst[0x8A] = inst(oper.mov,     addr.Gb, addr.Eb);
    this.inst[0x8B] = inst(oper.mov,     addr.Gv, addr.Ev);
    this.inst[0x8C] = inst(oper.mov,     addr.Ew, addr.Sw);
    this.inst[0x8D] = inst(oper.lea,     addr.Gv, addr.M);
    this.inst[0x8E] = inst(oper.mov,     addr.Sw, addr.Ew);
    this.inst[0x8F] = inst(oper.pop,     addr.Ev);
    this.inst[0x90] = inst(oper.nop);
    this.inst[0x91] = inst(oper.xchg,    addr.CX, addr.AX);
    this.inst[0x92] = inst(oper.xchg,    addr.DX, addr.AX);
    this.inst[0x93] = inst(oper.xchg,    addr.BX, addr.AX);
    this.inst[0x94] = inst(oper.xchg,    addr.SP, addr.AX);
    this.inst[0x95] = inst(oper.xchg,    addr.BP, addr.AX);
    this.inst[0x96] = inst(oper.xchg,    addr.SI, addr.AX);
    this.inst[0x97] = inst(oper.xchg,    addr.DI, addr.AX);
    this.inst[0x98] = inst(oper.cbw);
    this.inst[0x99] = inst(oper.cwd);
    this.inst[0x9A] = inst(oper.call,    addr.Ap);
    this.inst[0x9B] = inst(oper.wait);
    this.inst[0x9C] = inst(oper.pushf);
    this.inst[0x9D] = inst(oper.popf);
    this.inst[0x9E] = inst(oper.sahf);
    this.inst[0x9F] = inst(oper.lahf);
    this.inst[0xA0] = inst(oper.mov,     addr.AL, addr.Ob);
    this.inst[0xA1] = inst(oper.mov,     addr.AX, addr.Ov);
    this.inst[0xA2] = inst(oper.mov,     addr.Ob, addr.AL);
    this.inst[0xA3] = inst(oper.mov,     addr.Ov, addr.AX);
    this.inst[0xA4] = inst(oper.movsb);
    this.inst[0xA5] = inst(oper.movsw);
    this.inst[0xA6] = inst(oper.cmpsb);
    this.inst[0xA7] = inst(oper.cmpsw);
    this.inst[0xA8] = inst(oper.test,    addr.AL, addr.Ib);
    this.inst[0xA9] = inst(oper.test,    addr.AX, addr.Iv);
    this.inst[0xAA] = inst(oper.stosb);
    this.inst[0xAB] = inst(oper.stosw);
    this.inst[0xAC] = inst(oper.lodsb);
    this.inst[0xAD] = inst(oper.lodsw);
    this.inst[0xAE] = inst(oper.scasb);
    this.inst[0xAF] = inst(oper.scasw);
    this.inst[0xB0] = inst(oper.mov,     addr.AL, addr.Ib);
    this.inst[0xB1] = inst(oper.mov,     addr.CL, addr.Ib);
    this.inst[0xB2] = inst(oper.mov,     addr.DL, addr.Ib);
    this.inst[0xB3] = inst(oper.mov,     addr.BL, addr.Ib);
    this.inst[0xB4] = inst(oper.mov,     addr.AH, addr.Ib);
    this.inst[0xB5] = inst(oper.mov,     addr.CH, addr.Ib);
    this.inst[0xB6] = inst(oper.mov,     addr.DH, addr.Ib);
    this.inst[0xB7] = inst(oper.mov,     addr.BH, addr.Ib);
    this.inst[0xB8] = inst(oper.mov,     addr.AX, addr.Iv);
    this.inst[0xB9] = inst(oper.mov,     addr.CX, addr.Iv);
    this.inst[0xBA] = inst(oper.mov,     addr.DX, addr.Iv);
    this.inst[0xBB] = inst(oper.mov,     addr.BX, addr.Iv);
    this.inst[0xBC] = inst(oper.mov,     addr.SP, addr.Iv);
    this.inst[0xBD] = inst(oper.mov,     addr.BP, addr.Iv);
    this.inst[0xBE] = inst(oper.mov,     addr.SI, addr.Iv);
    this.inst[0xBF] = inst(oper.mov,     addr.DI, addr.Iv);
    this.inst[0xC0] = inst(oper.notimp); // No Instruction
    this.inst[0xC1] = inst(oper.notimp); // No Instruction
    this.inst[0xC2] = inst(oper.ret,     addr.Iw);
    this.inst[0xC3] = inst(oper.ret);
    this.inst[0xC4] = inst(oper.les,     addr.Gv, addr.Mp);
    this.inst[0xC5] = inst(oper.lds,     addr.Gv, addr.Mp);
    this.inst[0xC6] = inst(oper.mov,     addr.Eb, addr.Ib);
    this.inst[0xC7] = inst(oper.mov,     addr.Ev, addr.Iv);
    this.inst[0xC8] = inst(oper.notimp); // No Instruction
    this.inst[0xC9] = inst(oper.notimp); // No Instruction
    this.inst[0xCA] = inst(oper.retf,    addr.Iw);
    this.inst[0xCB] = inst(oper.retf);
    this.inst[0xCC] = inst(oper.int,     3);
    this.inst[0xCD] = inst(oper.int,     addr.Ib);
    this.inst[0xCE] = inst(oper.into);
    this.inst[0xCF] = inst(oper.iret);
    this.inst[0xD0] = inst(grp2,         addr.Eb, 1);
    this.inst[0xD1] = inst(grp2,         addr.Ev, 1);
    this.inst[0xD2] = inst(grp2,         addr.Eb, addr.CL);
    this.inst[0xD3] = inst(grp2,         addr.Ev, addr.CL);
    this.inst[0xD4] = inst(oper.aam,     addr.I0);
    this.inst[0xD5] = inst(oper.aad,     addr.I0);
    this.inst[0xD6] = inst(oper.notimp); // No Instruction
    this.inst[0xD7] = inst(oper.xlat);
    this.inst[0xD8] = inst(oper.notimp); // No Instruction
    this.inst[0xD9] = inst(oper.notimp); // No Instruction
    this.inst[0xDA] = inst(oper.notimp); // No Instruction
    this.inst[0xDB] = inst(oper.notimp); // No Instruction
    this.inst[0xDC] = inst(oper.notimp); // No Instruction
    this.inst[0xDD] = inst(oper.notimp); // No Instruction
    this.inst[0xDE] = inst(oper.notimp); // No Instruction
    this.inst[0xDF] = inst(oper.notimp); // No Instruction
    this.inst[0xE0] = inst(oper.loopnz,  addr.Jb);
    this.inst[0xE1] = inst(oper.loopz,   addr.Jb);
    this.inst[0xE2] = inst(oper.loop,    addr.Jb);
    this.inst[0xE3] = inst(oper.jcxz,    addr.Jb);
    this.inst[0xE4] = inst(oper.iin,     addr.AL, addr.Ib);
    this.inst[0xE5] = inst(oper.iin,     addr.AX, addr.Ib);
    this.inst[0xE6] = inst(oper.out,     addr.Ib, addr.AL);
    this.inst[0xE7] = inst(oper.out,     addr.Ib, addr.AX);
    this.inst[0xE8] = inst(oper.call,    addr.Jv);
    this.inst[0xE9] = inst(oper.jmp,     addr.Jv);
    this.inst[0xEA] = inst(oper.jmp,     addr.Ap);
    this.inst[0xEB] = inst(oper.jmp,     addr.Jb);
    this.inst[0xEC] = inst(oper.iin,     addr.AL, addr.DX);
    this.inst[0xED] = inst(oper.iin,     addr.AX, addr.DX);
    this.inst[0xEE] = inst(oper.out,     addr.DX, addr.AL);
    this.inst[0xEF] = inst(oper.out,     addr.DX, addr.AX);
    this.inst[0xF0] = inst(oper.lock);
    this.inst[0xF1] = inst(oper.notimp); // No Instruction
    this.inst[0xF2] = inst(oper.repnz);
    this.inst[0xF3] = inst(oper.repz);
    this.inst[0xF4] = inst(oper.hlt);
    this.inst[0xF5] = inst(oper.cmc);
    this.inst[0xF6] = inst(grp3a,        addr.Eb);
    this.inst[0xF7] = inst(grp3b,        addr.Ev);
    this.inst[0xF8] = inst(oper.clc);
    this.inst[0xF9] = inst(oper.stc);
    this.inst[0xFA] = inst(oper.cli);
    this.inst[0xFB] = inst(oper.sti);
    this.inst[0xFC] = inst(oper.cld);
    this.inst[0xFD] = inst(oper.std);
    this.inst[0xFE] = inst(grp4,         addr.Eb);
    this.inst[0xFF] = inst(grp5,         addr.Ev);
  }

  decode () {
    let opcode_byte = this.mem8[this.reg16[regIP]];
    let addressing_byte = this.mem8[this.reg16[regIP] + 1];
    this.opcode = {
      opcode_byte     : opcode_byte,
      addressing_byte : addressing_byte,
      prefix          : 0x00, // Not supporting prefix opcodes yet
      opcode          : (opcode_byte & 0xFC) >>> 2,
      d               : (opcode_byte & 0x02) >>> 1,
      w               : (opcode_byte & 0x01),
      mod             : (addressing_byte & 0xC0) >>> 6,
      reg             : (addressing_byte & 0x38) >>> 3,
      rm              : (addressing_byte & 0x07),
      // cycle  : _Cpu._cycles
    };
  }

  cycle () {
    let ip = this.reg16[regIP];
    console.log("IP: " + hexString16(ip));
    console.log();
    console.log(formatMemory(this.mem8, ip, ip + 7));
    console.log();

    this.decode();
    console.log(formatOpcode(this.opcode));
    // console.log( this.inst[this.opcode.opcode_byte]);
    console.log("executing");
    this.inst[this.opcode.opcode_byte]();
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
