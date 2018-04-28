import Operations from './Operations.js'
import Addressing from './Addressing.js'
import CPU from './CPU';
import { segIP } from "../utils/Utils";
import {
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  b, w, v, d, u, STATE_HALT,
} from '../Constants';
import {
  hexString16, formatOpcode, formatMemory, formatFlags, formatRegisters,
  formatStack
} from '../utils/Debug'

export default class CPU8086 extends CPU {
  constructor(config) {
    super();

    this.config = config;

    /**
     * CPU frequency in hertz (cyles per second).
     */
    this.frequency = config.cpu.frequency;

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
    this.instIPInc = 0;

    this.addrIPInc = 0;

    /**
     * The CPU state.
     */
    this.state = STATE_HALT;

    // Memory
    this.mem8 = new Uint8Array(config.memorySize);
    this.mem16 = new Uint16Array(this.mem8.buffer);

    // Registers
    this.reg8 = new Uint8Array(14 * 2);
    this.reg16 = new Uint16Array(this.reg8.buffer);
    if (config.cpu.registers16) {
      for (let r = 0; r < config.cpu.registers16.length; r++) {
        this.reg16[r] = config.cpu.registers16[r];
      }
    }
    else {
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
    }

    // Flags
    this.reg16[regFlags] = config.cpu.flags;

    // Opcode
    this.opcode = {};

    // Supporting modules
    let addr = new Addressing(this);
    let oper = new Operations(this);

    /**
     * Wrapper class for instructions. I don't think I can move this to a
     * module because I need to close over oper and addr for binding and I
     * don't want to make the signature messy by passing them in.
     */
    class inst {
      constructor(op, baseSize, addrSize, dst, src) {
        this.op = op ? op.bind(oper) : undefined;
        this.baseSize = baseSize;
        this.addrSize = addrSize;
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
    this.inst[0x00]    = new inst(oper.add,    2, b, addr.Eb, addr.Gb);
    this.inst[0x01]    = new inst(oper.add,    2, v, addr.Ev, addr.Gv);
    this.inst[0x02]    = new inst(oper.add,    2, b, addr.Gb, addr.Eb);
    this.inst[0x03]    = new inst(oper.add,    2, v, addr.Gv, addr.Ev);
    this.inst[0x04]    = new inst(oper.add,    1, b, addr.AL, addr.Ib);
    this.inst[0x05]    = new inst(oper.add,    1, w, addr.AX, addr.Iv);
    this.inst[0x06]    = new inst(oper.push,   1, w, addr.ES         );
    this.inst[0x07]    = new inst(oper.pop,    1, w, addr.ES         );
    this.inst[0x08]    = new inst(oper.or,     2, b, addr.Eb, addr.Gb);
    this.inst[0x09]    = new inst(oper.or,     2, v, addr.Ev, addr.Gv);
    this.inst[0x0A]    = new inst(oper.or,     2, b, addr.Gb, addr.Eb);
    this.inst[0x0B]    = new inst(oper.or,     2, v, addr.Gv, addr.Ev);
    this.inst[0x0C]    = new inst(oper.or,     1, b, addr.AL, addr.Ib);
    this.inst[0x0D]    = new inst(oper.or,     1, w, addr.AX, addr.Iv);
    this.inst[0x0E]    = new inst(oper.push,   1, w, addr.CS         );
    this.inst[0x0F]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x10]    = new inst(oper.adc,    2, b, addr.Eb, addr.Gb);
    this.inst[0x11]    = new inst(oper.adc,    2, v, addr.Ev, addr.Gv);
    this.inst[0x12]    = new inst(oper.adc,    2, b, addr.Gb, addr.Eb);
    this.inst[0x13]    = new inst(oper.adc,    2, v, addr.Gv, addr.Ev);
    this.inst[0x14]    = new inst(oper.adc,    1, b, addr.AL, addr.Ib);
    this.inst[0x15]    = new inst(oper.adc,    1, w, addr.AX, addr.Iv);
    this.inst[0x16]    = new inst(oper.push,   1, w, addr.SS         );
    this.inst[0x17]    = new inst(oper.pop,    1, w, addr.SS         );
    this.inst[0x18]    = new inst(oper.sbb,    2, b, addr.Eb, addr.Gb);
    this.inst[0x19]    = new inst(oper.sbb,    2, v, addr.Ev, addr.Gv);
    this.inst[0x1A]    = new inst(oper.sbb,    2, b, addr.Gb, addr.Eb);
    this.inst[0x1B]    = new inst(oper.sbb,    2, v, addr.Gv, addr.Ev);
    this.inst[0x1C]    = new inst(oper.sbb,    1, b, addr.AL, addr.Ib);
    this.inst[0x1D]    = new inst(oper.sbb,    1, w, addr.AX, addr.Iv);
    this.inst[0x1E]    = new inst(oper.push,   1, w, addr.DS         );
    this.inst[0x1F]    = new inst(oper.pop,    1, w, addr.DS         );
    this.inst[0x20]    = new inst(oper.and,    2, b, addr.Eb, addr.Gb);
    this.inst[0x21]    = new inst(oper.and,    2, v, addr.Ev, addr.Gv);
    this.inst[0x22]    = new inst(oper.and,    2, b, addr.Gb, addr.Eb);
    this.inst[0x23]    = new inst(oper.and,    2, v, addr.Gv, addr.Ev);
    this.inst[0x24]    = new inst(oper.and,    2, b, addr.AL, addr.Ib);
    this.inst[0x25]    = new inst(oper.and,    2, w, addr.AX, addr.Iv);
    this.inst[0x26]    = new inst(oper.es,     1, u,                 );
    this.inst[0x27]    = new inst(oper.daa,    1, u,                 );
    this.inst[0x28]    = new inst(oper.sub,    2, b, addr.Eb, addr.Gb);
    this.inst[0x29]    = new inst(oper.sub,    2, v, addr.Ev, addr.Gv);
    this.inst[0x2A]    = new inst(oper.sub,    2, b, addr.Gb, addr.Eb);
    this.inst[0x2B]    = new inst(oper.sub,    2, v, addr.Gv, addr.Ev);
    this.inst[0x2C]    = new inst(oper.sub,    1, b, addr.AL, addr.Ib);
    this.inst[0x2D]    = new inst(oper.sub,    1, w, addr.AX, addr.Iv);
    this.inst[0x2E]    = new inst(oper.cs,     1, u,                 );
    this.inst[0x2F]    = new inst(oper.das,    1, u,                 );
    this.inst[0x30]    = new inst(oper.xor,    2, b, addr.Eb, addr.Gb);
    this.inst[0x31]    = new inst(oper.xor,    2, v, addr.Ev, addr.Gv);
    this.inst[0x32]    = new inst(oper.xor,    2, b, addr.Gb, addr.Eb);
    this.inst[0x33]    = new inst(oper.xor,    2, v, addr.Gv, addr.Ev);
    this.inst[0x34]    = new inst(oper.xor,    1, b, addr.AL, addr.Ib);
    this.inst[0x35]    = new inst(oper.xor,    1, w, addr.AX, addr.Iv);
    this.inst[0x36]    = new inst(oper.ss,     1, u,                 );
    this.inst[0x37]    = new inst(oper.aaa,    1, u,                 );
    this.inst[0x38]    = new inst(oper.cmp,    1, b, addr.Eb, addr.Gb);
    this.inst[0x39]    = new inst(oper.cmp,    2, v, addr.Ev, addr.Gv);
    this.inst[0x3A]    = new inst(oper.cmp,    2, b, addr.Gb, addr.Eb);
    this.inst[0x3B]    = new inst(oper.cmp,    2, v, addr.Gv, addr.Ev);
    this.inst[0x3C]    = new inst(oper.cmp,    1, b, addr.AL, addr.Ib);
    this.inst[0x3D]    = new inst(oper.cmp,    1, w, addr.AX, addr.Iv);
    this.inst[0x3E]    = new inst(oper.ds,     1, u,                 );
    this.inst[0x3F]    = new inst(oper.aas,    1, u,                 );
    this.inst[0x40]    = new inst(oper.inc,    1, w, addr.AX         );
    this.inst[0x41]    = new inst(oper.inc,    1, w, addr.CX         );
    this.inst[0x42]    = new inst(oper.inc,    1, w, addr.DX         );
    this.inst[0x43]    = new inst(oper.inc,    1, w, addr.BX         );
    this.inst[0x44]    = new inst(oper.inc,    1, w, addr.SP         );
    this.inst[0x45]    = new inst(oper.inc,    1, w, addr.BP         );
    this.inst[0x46]    = new inst(oper.inc,    1, w, addr.SI         );
    this.inst[0x47]    = new inst(oper.inc,    1, w, addr.DI         );
    this.inst[0x48]    = new inst(oper.dec,    1, w, addr.AX         );
    this.inst[0x49]    = new inst(oper.dec,    1, w, addr.CX         );
    this.inst[0x4A]    = new inst(oper.dec,    1, w, addr.DX         );
    this.inst[0x4B]    = new inst(oper.dec,    1, w, addr.BX         );
    this.inst[0x4C]    = new inst(oper.dec,    1, w, addr.SP         );
    this.inst[0x4D]    = new inst(oper.dec,    1, w, addr.BP         );
    this.inst[0x4E]    = new inst(oper.dec,    1, w, addr.SI         );
    this.inst[0x4F]    = new inst(oper.dec,    1, w, addr.DI         );
    this.inst[0x50]    = new inst(oper.push,   1, w, addr.AX         );
    this.inst[0x51]    = new inst(oper.push,   1, w, addr.CX         );
    this.inst[0x52]    = new inst(oper.push,   1, w, addr.DX         );
    this.inst[0x53]    = new inst(oper.push,   1, w, addr.BX         );
    this.inst[0x54]    = new inst(oper.push,   1, w, addr.SP         );
    this.inst[0x55]    = new inst(oper.push,   1, w, addr.BP         );
    this.inst[0x56]    = new inst(oper.push,   1, w, addr.SI         );
    this.inst[0x57]    = new inst(oper.push,   1, w, addr.DI         );
    this.inst[0x58]    = new inst(oper.pop,    1, w, addr.AX         );
    this.inst[0x59]    = new inst(oper.pop,    1, w, addr.CX         );
    this.inst[0x5A]    = new inst(oper.pop,    1, w, addr.DX         );
    this.inst[0x5B]    = new inst(oper.pop,    1, w, addr.BX         );
    this.inst[0x5C]    = new inst(oper.pop,    1, w, addr.SP         );
    this.inst[0x5D]    = new inst(oper.pop,    1, w, addr.BP         );
    this.inst[0x5E]    = new inst(oper.pop,    1, w, addr.SI         );
    this.inst[0x5F]    = new inst(oper.pop,    1, w, addr.DI         );
    this.inst[0x60]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x61]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x62]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x63]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x64]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x65]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x66]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x67]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x68]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x69]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6A]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6B]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6C]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6D]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6E]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x6F]    = new inst(oper.notimp, 0, u                  );
    this.inst[0x70]    = new inst(oper.jo,     1, b, addr.Jb         );
    this.inst[0x71]    = new inst(oper.jno,    1, b, addr.Jb         );
    this.inst[0x72]    = new inst(oper.jb,     1, b, addr.Jb         );
    this.inst[0x73]    = new inst(oper.jnb,    1, b, addr.Jb         );
    this.inst[0x74]    = new inst(oper.jz,     1, b, addr.Jb         );
    this.inst[0x75]    = new inst(oper.jnz,    1, b, addr.Jb         );
    this.inst[0x76]    = new inst(oper.jbe,    1, b, addr.Jb         );
    this.inst[0x77]    = new inst(oper.ja,     1, b, addr.Jb         );
    this.inst[0x78]    = new inst(oper.js,     1, b, addr.Jb         );
    this.inst[0x79]    = new inst(oper.jns,    1, b, addr.Jb         );
    this.inst[0x7A]    = new inst(oper.jpe,    1, b, addr.Jb         );
    this.inst[0x7B]    = new inst(oper.jpo,    1, b, addr.Jb         );
    this.inst[0x7C]    = new inst(oper.jl,     1, b, addr.Jb         );
    this.inst[0x7D]    = new inst(oper.jge,    1, b, addr.Jb         );
    this.inst[0x7E]    = new inst(oper.jle,    1, b, addr.Jb         );
    this.inst[0x7F]    = new inst(oper.jg,     1, b, addr.Jb         );

    // Group 1 instructions
    this.inst[0x80] = [];
    this.inst[0x80][0] = new inst(oper.add,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][1] = new inst(oper.or,     2, b, addr.Eb, addr.Ib);
    this.inst[0x80][2] = new inst(oper.adc,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][3] = new inst(oper.sbb,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][4] = new inst(oper.and,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][5] = new inst(oper.sub,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][6] = new inst(oper.xor,    2, b, addr.Eb, addr.Ib);
    this.inst[0x80][7] = new inst(oper.cmp,    2, b, addr.Eb, addr.Ib);
    this.inst[0x81] = [];
    this.inst[0x81][0] = new inst(oper.add,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][1] = new inst(oper.or,     2, v, addr.Ev, addr.Iv);
    this.inst[0x81][2] = new inst(oper.adc,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][3] = new inst(oper.sbb,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][4] = new inst(oper.and,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][5] = new inst(oper.sub,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][6] = new inst(oper.xor,    2, v, addr.Ev, addr.Iv);
    this.inst[0x81][7] = new inst(oper.cmp,    2, v, addr.Ev, addr.Iv);
    this.inst[0x82] = [];
    this.inst[0x82][0] = new inst(oper.add,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][1] = new inst(oper.or,     2, b, addr.Eb, addr.Ib);
    this.inst[0x82][2] = new inst(oper.adc,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][3] = new inst(oper.sbb,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][4] = new inst(oper.and,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][5] = new inst(oper.sub,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][6] = new inst(oper.xor,    2, b, addr.Eb, addr.Ib);
    this.inst[0x82][7] = new inst(oper.cmp,    2, b, addr.Eb, addr.Ib);
    this.inst[0x83] = [];
    this.inst[0x83][0] = new inst(oper.add,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][1] = new inst(oper.or,     2, v, addr.Ev, addr.Ib);
    this.inst[0x83][2] = new inst(oper.adc,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][3] = new inst(oper.sbb,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][4] = new inst(oper.and,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][5] = new inst(oper.sub,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][6] = new inst(oper.xor,    2, v, addr.Ev, addr.Ib);
    this.inst[0x83][7] = new inst(oper.cmp,    2, v, addr.Ev, addr.Ib);

    this.inst[0x84]    = new inst(oper.test,   2, b, addr.Gb, addr.Eb);
    this.inst[0x85]    = new inst(oper.test,   2, v, addr.Gv, addr.Ev);
    this.inst[0x86]    = new inst(oper.xchg,   2, b, addr.Gb, addr.Eb);
    this.inst[0x87]    = new inst(oper.xchg,   2, v, addr.Gv, addr.Ev);
    this.inst[0x88]    = new inst(oper.mov,    2, b, addr.Eb, addr.Gb);
    this.inst[0x89]    = new inst(oper.mov,    2, v, addr.Ev, addr.Gv);
    this.inst[0x8A]    = new inst(oper.mov,    2, b, addr.Gb, addr.Eb);
    this.inst[0x8B]    = new inst(oper.mov,    2, v, addr.Gv, addr.Ev);
    this.inst[0x8C]    = new inst(oper.mov,    2, w, addr.Ew, addr.Sw);
    this.inst[0x8D]    = new inst(oper.lea,    2, v, addr.Gv, addr.M );
    this.inst[0x8E]    = new inst(oper.mov,    2, w, addr.Sw, addr.Ew);
    this.inst[0x8F]    = new inst(oper.pop,    2, v, addr.Ev         );
    this.inst[0x90]    = new inst(oper.nop,    1, u                  );
    this.inst[0x91]    = new inst(oper.xchg,   1, w, addr.CX, addr.AX);
    this.inst[0x92]    = new inst(oper.xchg,   1, w, addr.DX, addr.AX);
    this.inst[0x93]    = new inst(oper.xchg,   1, w, addr.BX, addr.AX);
    this.inst[0x94]    = new inst(oper.xchg,   1, w, addr.SP, addr.AX);
    this.inst[0x95]    = new inst(oper.xchg,   1, w, addr.BP, addr.AX);
    this.inst[0x96]    = new inst(oper.xchg,   1, w, addr.SI, addr.AX);
    this.inst[0x97]    = new inst(oper.xchg,   1, w, addr.DI, addr.AX);
    this.inst[0x98]    = new inst(oper.cbw,    1, u                  );
    this.inst[0x99]    = new inst(oper.cwd,    1, u                  );
    this.inst[0x9A]    = new inst(oper.call,   1, d, addr.Ap         );
    this.inst[0x9B]    = new inst(oper.wait,   1, u                  );
    this.inst[0x9C]    = new inst(oper.pushf,  1, u                  );
    this.inst[0x9D]    = new inst(oper.popf,   1, u                  );
    this.inst[0x9E]    = new inst(oper.sahf,   1, u                  );
    this.inst[0x9F]    = new inst(oper.lahf,   1, u                  );
    this.inst[0xA0]    = new inst(oper.mov,    1, b, addr.AL, addr.Ob);
    this.inst[0xA1]    = new inst(oper.mov,    1, w, addr.AX, addr.Ov);
    this.inst[0xA2]    = new inst(oper.mov,    1, b, addr.Ob, addr.AL);
    this.inst[0xA3]    = new inst(oper.mov,    1, v, addr.Ov, addr.AX);
    this.inst[0xA4]    = new inst(oper.movsb,  1, b                  );
    this.inst[0xA5]    = new inst(oper.movsw,  1, w                  );
    this.inst[0xA6]    = new inst(oper.cmpsb,  1, b                  );
    this.inst[0xA7]    = new inst(oper.cmpsw,  1, w                  );
    this.inst[0xA8]    = new inst(oper.test,   1, b, addr.AL, addr.Ib);
    this.inst[0xA9]    = new inst(oper.test,   1, w, addr.AX, addr.Iv);
    this.inst[0xAA]    = new inst(oper.stosb,  1, b                  );
    this.inst[0xAB]    = new inst(oper.stosw,  1, w                  );
    this.inst[0xAC]    = new inst(oper.lodsb,  1, b                  );
    this.inst[0xAD]    = new inst(oper.lodsw,  1, w                  );
    this.inst[0xAE]    = new inst(oper.scasb,  1, b                  );
    this.inst[0xAF]    = new inst(oper.scasw,  1, w                  );
    this.inst[0xB0]    = new inst(oper.mov,    1, b, addr.AL, addr.Ib);
    this.inst[0xB1]    = new inst(oper.mov,    1, b, addr.CL, addr.Ib);
    this.inst[0xB2]    = new inst(oper.mov,    1, b, addr.DL, addr.Ib);
    this.inst[0xB3]    = new inst(oper.mov,    1, b, addr.BL, addr.Ib);
    this.inst[0xB4]    = new inst(oper.mov,    1, b, addr.AH, addr.Ib);
    this.inst[0xB5]    = new inst(oper.mov,    1, b, addr.CH, addr.Ib);
    this.inst[0xB6]    = new inst(oper.mov,    1, b, addr.DH, addr.Ib);
    this.inst[0xB7]    = new inst(oper.mov,    1, b, addr.BH, addr.Ib);
    this.inst[0xB8]    = new inst(oper.mov,    1, w, addr.AX, addr.Iv);
    this.inst[0xB9]    = new inst(oper.mov,    1, w, addr.CX, addr.Iv);
    this.inst[0xBA]    = new inst(oper.mov,    1, w, addr.DX, addr.Iv);
    this.inst[0xBB]    = new inst(oper.mov,    1, w, addr.BX, addr.Iv);
    this.inst[0xBC]    = new inst(oper.mov,    1, w, addr.SP, addr.Iv);
    this.inst[0xBD]    = new inst(oper.mov,    1, w, addr.BP, addr.Iv);
    this.inst[0xBE]    = new inst(oper.mov,    1, w, addr.SI, addr.Iv);
    this.inst[0xBF]    = new inst(oper.mov,    1, w, addr.DI, addr.Iv);
    this.inst[0xC0]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xC1]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xC2]    = new inst(oper.ret,    1, w, addr.Iw         );
    this.inst[0xC3]    = new inst(oper.ret,    1, u                  );
    this.inst[0xC4]    = new inst(oper.les,    2, v, addr.Gv, addr.Mp);
    this.inst[0xC5]    = new inst(oper.lds,    2, v, addr.Gv, addr.Mp);
    this.inst[0xC6]    = new inst(oper.mov,    2, b, addr.Eb, addr.Ib);
    this.inst[0xC7]    = new inst(oper.mov,    2, v, addr.Ev, addr.Iv);
    this.inst[0xC8]    = new inst(oper.notimp, 1, u                  );
    this.inst[0xC9]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xCA]    = new inst(oper.retf,   1, w, addr.Iw         );
    this.inst[0xCB]    = new inst(oper.retf,   1, u                  );
    this.inst[0xCC]    = new inst(oper.int,    1, u, addr._3         );
    this.inst[0xCD]    = new inst(oper.int,    1, b, addr.Ib         );
    this.inst[0xCE]    = new inst(oper.into,   1, u                  );
    this.inst[0xCF]    = new inst(oper.iret,   1, u                  );

    // Group 2 instructions
    this.inst[0xD0] = [];
    this.inst[0xD0][0] = new inst(oper.rol,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][1] = new inst(oper.ror,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][2] = new inst(oper.rcl,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][3] = new inst(oper.rcr,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][4] = new inst(oper.shl,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][5] = new inst(oper.shr,    2, b, addr.Eb, addr._1);
    this.inst[0xD0][6] = new inst(oper.notimp, 0, u                  );
    this.inst[0xD0][7] = new inst(oper.sar,    2, b, addr.Eb, addr._1);
    this.inst[0xD1] = [];
    this.inst[0xD1][0] = new inst(oper.rol,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][1] = new inst(oper.ror,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][2] = new inst(oper.rcl,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][3] = new inst(oper.rcr,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][4] = new inst(oper.shl,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][5] = new inst(oper.shr,    2, v, addr.Ev, addr._1);
    this.inst[0xD1][6] = new inst(oper.notimp, 0, u                  );
    this.inst[0xD1][7] = new inst(oper.sar,    2, v, addr.Ev, addr._1);
    this.inst[0xD2] = [];
    this.inst[0xD2][0] = new inst(oper.rol,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][1] = new inst(oper.ror,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][2] = new inst(oper.rcl,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][3] = new inst(oper.rcr,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][4] = new inst(oper.shl,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][5] = new inst(oper.shr,    2, b, addr.Eb, addr.CL);
    this.inst[0xD2][6] = new inst(oper.notimp, 0, u                  );
    this.inst[0xD2][7] = new inst(oper.sar,    2, b, addr.Eb, addr.CL);
    this.inst[0xD3] = [];
    this.inst[0xD3][0] = new inst(oper.rol,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][1] = new inst(oper.ror,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][2] = new inst(oper.rcl,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][3] = new inst(oper.rcr,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][4] = new inst(oper.shl,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][5] = new inst(oper.shr,    2, v, addr.Ev, addr.CL);
    this.inst[0xD3][6] = new inst(oper.notimp, 0, u                  );
    this.inst[0xD3][7] = new inst(oper.sar,    2, v, addr.Ev, addr.CL);

    this.inst[0xD4]    = new inst(oper.aam,    1, b, addr.Ib         );
    this.inst[0xD5]    = new inst(oper.aad,    1, b, addr.Ib         );
    this.inst[0xD6]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xD7]    = new inst(oper.xlat,   1, u                  );
    this.inst[0xD8]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xD9]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDA]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDB]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDC]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDD]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDE]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xDF]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xE0]    = new inst(oper.loopnz, 1, b, addr.Jb         );
    this.inst[0xE1]    = new inst(oper.loopz,  1, b, addr.Jb         );
    this.inst[0xE2]    = new inst(oper.loop,   1, b, addr.Jb         );
    this.inst[0xE3]    = new inst(oper.jcxz,   1, b, addr.Jb         );
    this.inst[0xE4]    = new inst(oper.iin,    1, b, addr.AL, addr.Ib);
    this.inst[0xE5]    = new inst(oper.iin,    1, w, addr.AX, addr.Ib);
    this.inst[0xE6]    = new inst(oper.out,    1, b, addr.Ib, addr.AL);
    this.inst[0xE7]    = new inst(oper.out,    1, b, addr.Ib, addr.AX);
    this.inst[0xE8]    = new inst(oper.call,   1, v, addr.Jv         );
    this.inst[0xE9]    = new inst(oper.jmp,    1, v, addr.Jv         );
    this.inst[0xEA]    = new inst(oper.jmp,    1, d, addr.Ap         );
    this.inst[0xEB]    = new inst(oper.jmp,    1, b, addr.Jb         );
    this.inst[0xEC]    = new inst(oper.iin,    1, b, addr.AL, addr.DX);
    this.inst[0xED]    = new inst(oper.iin,    1, w, addr.AX, addr.DX);
    this.inst[0xEE]    = new inst(oper.out,    1, w, addr.DX, addr.AL);
    this.inst[0xEF]    = new inst(oper.out,    1, w, addr.DX, addr.AX);
    this.inst[0xF0]    = new inst(oper.lock,   1, u                  );
    this.inst[0xF1]    = new inst(oper.notimp, 0, u                  );
    this.inst[0xF2]    = new inst(oper.repnz,  1, u                  );
    this.inst[0xF3]    = new inst(oper.repz,   1, u                  );
    this.inst[0xF4]    = new inst(oper.hlt,    1, u                  );
    this.inst[0xF5]    = new inst(oper.cmc,    1, u                  );

    // Group 3a instructions
    this.inst[0xF6] = [];
    this.inst[0xF6][0] = new inst(oper.test,   2, b, addr.Eb, addr.Ib);
    this.inst[0xF6][1] = new inst(oper.notimp, 0, u                  );
    this.inst[0xF6][2] = new inst(oper.not,    2, b, addr.Eb,        );
    this.inst[0xF6][3] = new inst(oper.neg,    2, b, addr.Eb,        );
    this.inst[0xF6][4] = new inst(oper.mul,    2, b, addr.Eb,        );
    this.inst[0xF6][5] = new inst(oper.imul,   2, b, addr.Eb,        );
    this.inst[0xF6][6] = new inst(oper.div,    2, b, addr.Eb,        );
    this.inst[0xF6][7] = new inst(oper.idiv,   2, b, addr.Eb,        );

    // Group 3b instructions
    this.inst[0xF7] = [];
    this.inst[0xF7][0] = new inst(oper.test,   2, v, addr.Ev, addr.Iv);
    this.inst[0xF7][1] = new inst(oper.notimp, 0, u                 );
    this.inst[0xF7][2] = new inst(oper.not,    2, v, addr.Ev,        );
    this.inst[0xF7][3] = new inst(oper.neg,    2, v, addr.Ev,        );
    this.inst[0xF7][4] = new inst(oper.mul,    2, v, addr.Ev,        );
    this.inst[0xF7][5] = new inst(oper.imul,   0, v, addr.Ev,        );
    this.inst[0xF7][6] = new inst(oper.div,    0, v, addr.Ev,        );
    this.inst[0xF7][7] = new inst(oper.idiv,   0, v, addr.Ev,        );

    this.inst[0xF8]    = new inst(oper.clc,    1, u                  );
    this.inst[0xF9]    = new inst(oper.stc,    1, u                  );
    this.inst[0xFA]    = new inst(oper.cli,    1, u                  );
    this.inst[0xFB]    = new inst(oper.sti,    1, u                  );
    this.inst[0xFC]    = new inst(oper.cld,    1, u                  );
    this.inst[0xFD]    = new inst(oper.std,    1, u                  );

    // Group 4 instructions
    this.inst[0xFE] = [];
    this.inst[0xFE][0] = new inst(oper.inc,    2, b, addr.Eb,        );
    this.inst[0xFE][1] = new inst(oper.dec,    2, b, addr.Eb,        );
    this.inst[0xFE][2] = new inst(oper.notimp, 0, u                  );
    this.inst[0xFE][3] = new inst(oper.notimp, 0, u                  );
    this.inst[0xFE][4] = new inst(oper.notimp, 0, u                  );
    this.inst[0xFE][5] = new inst(oper.notimp, 0, u                  );
    this.inst[0xFE][6] = new inst(oper.notimp, 0, u                  );
    this.inst[0xFE][7] = new inst(oper.notimp, 0, u                  );

    // Group 5 instructions
    this.inst[0xFF] = [];
    this.inst[0xFF][0] = new inst(oper.inc,    2, v, addr.Ev,        );
    this.inst[0xFF][1] = new inst(oper.dec,    2, v, addr.Ev,        );
    this.inst[0xFF][2] = new inst(oper.call,   2, v, addr.Ev,        );
    this.inst[0xFF][3] = new inst(oper.call,   2, d, addr.Ep         );
    this.inst[0xFF][4] = new inst(oper.jmp,    2, v, addr.Ev,        );
    this.inst[0xFF][5] = new inst(oper.jmp,    2, d, addr.Ep         );
    this.inst[0xFF][6] = new inst(oper.push,   2, v, addr.Ev,        );
    this.inst[0xFF][7] = new inst(oper.notimp, 0, u                  );
  }

  /**
   * Decode the current instruction pointed to by the IP register.
   */
  decode () {
    let opcode_byte = this.mem8[segIP(this)];

    // Retrieve the operation from the opcode table
    let instruction = this.inst[opcode_byte];

    // this.opcode = {
    this.opcode["opcode_byte"]     = opcode_byte;
    this.opcode["addressing_byte"] = null;
    this.opcode["prefix"]          = 0x00;  // Not supporting prefix opcodes yet
    this.opcode["opcode"]          = (opcode_byte & 0xFC) >>> 2;
    this.opcode["d"]               = (opcode_byte & 0x02) >>> 1;
    this.opcode["w"]               = (opcode_byte & 0x01);
    this.opcode["mod"]             = null;
    this.opcode["reg"]             = null;
    this.opcode["rm"]              = null;
    this.opcode["inst"]            = instruction;
    this.opcode["string"]          = "";
    this.opcode["addrSize"]        = null;
    this.opcode["isGroup"]         = (instruction instanceof Array);

    // If this instruction has an addressing mode byte decode it
    if (this.opcode.isGroup || this.opcode.inst.baseSize > 1) {
      this.opcode.addressing_byte = this.mem8[segIP(this) + 1];
      this.opcode.mod = (this.opcode.addressing_byte & 0xC0) >>> 6;
      this.opcode.reg = (this.opcode.addressing_byte & 0x38) >>> 3;
      this.opcode.rm = (this.opcode.addressing_byte & 0x07);
    }

    // If the instruction is an array it's a group instruction and we need
    // to extract further based on the register component of the addressing
    // byte
    if (this.opcode.isGroup) {
      this.opcode.inst = this.opcode.inst[this.opcode.reg];
    }

    this.opcode.addrSize = this.opcode.inst.addrSize;

    if (this.config.debug) this.opcode.string = this.opcode.inst.toString();
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
    // Reset per-cycle values
    this.instIPInc = 0;
    this.addrIPInc = 0;
    this.addrSeg = regDS;

    // Decode the instruction
    this.decode();

    // If this is a prefix instruction, run it and move to the next instruction
    this.prefix();

    if (this.config.debug) {
      console.log(`  INSTRUCTION: ${this.opcode.string}`);
      console.log(`  CS:IP:       ${hexString16(this.reg16[regCS])}:${hexString16(this.reg16[regIP])}`);
      console.log(`  OPCODE:      \n${formatOpcode(this.opcode, 11)}`);
      console.log(`  MEMORY INST: \n${formatMemory(this.mem8, segIP(this), segIP(this) + 6, 11)}`);
      // console.log(`  MEMORY STACK:\n${formatStack(this.mem8, this.reg16[regSP], 0x1000, 11)}`);
      console.log(`  REGISTERS    \n${formatRegisters(this, 11)}`);
      console.log(`  FLAGS:       \n${formatFlags(this.reg16[regFlags], 11)}`);
    }

    // Increase the instIPInc by the instruction base size
    this.instIPInc += this.opcode.inst.baseSize;

    // Run the instruction
    this.opcode.inst.run();

    // Move the IP
    this.reg16[regIP] += this.instIPInc + this.addrIPInc;
  }
}
