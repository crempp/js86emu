import winston from 'winston';

import { seg2abs } from "./Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';
import {binString16, formatFlags, hexString16} from "./Debug";

export default class Operations {
  constructor(cpu) {
    this.cpu = cpu;
  }

  aaa (dst, src) {
    winston.log("debug", "Operations.aaa           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  aad (dst, src) {
    winston.log("debug", "Operations.aad           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  aam (dst, src) {
    winston.log("debug", "Operations.aam           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  aas (dst, src) {
    winston.log("debug", "Operations.aas           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  adc (dst, src) {
    winston.log("debug", "Operations.adc           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  add (dst, src) {
    winston.log("debug", "Operations.add           : (dst=" + dst.name + ", src=" + src.name + ")");
    let segment = this.cpu.reg16[regCS];
    this.cpu.cycleIP += 1;
    let val = dst(segment, null) + src(segment, null);
    dst(val);
  };
  and (dst, src) {
    winston.log("debug", "Operations.and           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  call (dst, src) {
    winston.log("debug", "Operations.call          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cbw (dst, src) {
    winston.log("debug", "Operations.cbw           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  clc (dst, src) {
    winston.log("debug", "Operations.clc           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cld (dst, src) {
    winston.log("debug", "Operations.cld           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cli (dst, src) {
    winston.log("debug", "Operations.cli           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cmc (dst, src) {
    winston.log("debug", "Operations.cmc           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }

  /**
   * CMP (Compare) subtracts the source from the destination, which may be bytes
   * or words, but does not return the result. The operands are unchanged but
   * the flags are updated and can be tested by a subsequent conditional jump
   * instruction. CMP updates AF, CF, OF, PF, SF, and ZF. The comparison
   * reflected in the flags is that of the destination to the source. If a CMP
   * instruction is followed by a JG (jump if greater) instruction, for
   * example, the jump is taken if the destination operand is greater than the
   * source operand.
   *   - [1] p.2-36
   *
   * Modifies flags: AF CF OF PF SF ZF
   *
   * @param dst
   * @param src
   */
  cmp (dst, src) {
    this.cpu.cycleIP += 1;
    let size = this.cpu.opcode.w;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let s = src(segment, null);
    let result = d - s;

    if (result & (size ? 0xFFFF0000 : 0xFF00)) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    if ( (result ^ d) & (d ^ s) & 0x8000) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }

    if ( (d ^ s ^ result) & 0x10) {
      this.cpu.reg16[regFlags] |= FLAG_AF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_AF_MASK;
    }
    this.cpu.setPF_FLAG(result);
    this.cpu.setSF_FLAG(result);
    this.cpu.setZF_FLAG(result);

    return result;
  }
  cmpsb (dst, src) {
    winston.log("debug", "Operations.cmpsb         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cmpsw (dst, src) {
    winston.log("debug", "Operations.cmpsw         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cs (dst, src) {
    winston.log("debug", "Operations.cs            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  cwd (dst, src) {
    winston.log("debug", "Operations.cwd           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  daa (dst, src) {
    winston.log("debug", "Operations.daa           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  das (dst, src) {
    winston.log("debug", "Operations.das           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  dec (dst, src) {
    winston.log("debug", "Operations.dec           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  div (dst, src) {
    winston.log("debug", "Operations.div           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  ds (dst, src) {
    winston.log("debug", "Operations.ds            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  es (dst, src) {
    winston.log("debug", "Operations.es            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  hlt (dst, src) {
    winston.log("debug", "Operations.hlt           : (dst=, src=)");
    this.cpu.cycleIP += 1;
  }
  idiv (dst, src) {
    winston.log("debug", "Operations.idiv          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  imul (dst, src) {
    winston.log("debug", "Operations.imul          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  in (dst, src) {
    winston.log("debug", "Operations.in            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  iin (dst, src) {
    winston.log("debug", "Operations.iin           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  inc (dst, src) {
    winston.log("debug", "Operations.inc           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  int (dst, src) {
    winston.log("debug", "Operations.int           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  into (dst, src) {
    winston.log("debug", "Operations.into          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  iret (dst, src) {
    winston.log("debug", "Operations.iret          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  ja (dst, src) {
    winston.log("debug", "Operations.ja            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jb (dst, src) {
    winston.log("debug", "Operations.jb            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jbe (dst, src) {
    winston.log("debug", "Operations.jbe           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jcxz (dst, src) {
    winston.log("debug", "Operations.jcxz          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jg (dst, src) {
    winston.log("debug", "Operations.jg            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jge (dst, src) {
    winston.log("debug", "Operations.jge           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jl (dst, src) {
    winston.log("debug", "Operations.jl            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jle (dst, src) {
    winston.log("debug", "Operations.jle           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jmp (dst, src) {
    winston.log("debug", "Operations.jmp           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jnb (dst, src) {
    winston.log("debug", "Operations.jnb           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jno (dst, src) {
    winston.log("debug", "Operations.jno           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jns (dst, src) {
    winston.log("debug", "Operations.jns           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jnz (dst, src) {
    winston.log("debug", "Operations.jnz           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jo (dst, src) {
    winston.log("debug", "Operations.jo            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jpe (dst, src) {
    winston.log("debug", "Operations.jpe           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jpo (dst, src) {
    winston.log("debug", "Operations.jpo           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  js (dst, src) {
    winston.log("debug", "Operations.js            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  jz (dst, src) {
    winston.log("debug", "Operations.jz            : (dst=" + dst.name + ")");
    this.cpu.cycleIP += 2;

    if ((this.cpu.reg16[regFlags] & FLAG_ZF_MASK) > 0) {
      // The jump address is a signed (twos complement) offset from the
      // current location.
      let offset = this.cpu.mem8[this.cpu.reg16[regIP] + 1];

      this.shortJump(offset);
      return true;
    }
    else {
      return false;
    }
  }
  lahf (dst, src) {
    winston.log("debug", "Operations.lahf          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  lds (dst, src) {
    winston.log("debug", "Operations.lds           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  lea (dst, src) {
    winston.log("debug", "Operations.lea           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  les (dst, src) {
    winston.log("debug", "Operations.les           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  lock (dst, src) {
    winston.log("debug", "Operations.lock          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  lodsb (dst, src) {
    winston.log("debug", "Operations.lodsb         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  lodsw (dst, src) {
    winston.log("debug", "Operations.lodsw         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  loopnz (dst, src) {
    winston.log("debug", "Operations.loopnz        : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  loopz (dst, src) {
    winston.log("debug", "Operations.loopz         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  loop (dst, src) {
    winston.log("debug", "Operations.loop          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  mov (dst, src) {
    winston.log("debug", "Operations.mov           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  movb (dst, src) {
    winston.log("debug", "Operations.movb          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  movsb (dst, src) {
    winston.log("debug", "Operations.movsb         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  movsw (dst, src) {
    winston.log("debug", "Operations.movsw         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  mul (dst, src) {
    winston.log("debug", "Operations.mul           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  neg (dst, src) {
    winston.log("debug", "Operations.neg           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  nop (dst, src) {
    winston.log("debug", "Operations.nop           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  not (dst, src) {
    winston.log("debug", "Operations.not           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  or (dst, src) {
    winston.log("debug", "Operations.or            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  out (dst, src) {
    winston.log("debug", "Operations.out           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  pop (dst, src) {
    winston.log("debug", "Operations.pop           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  popf (dst, src) {
    winston.log("debug", "Operations.popf          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  push (dst, src) {
    winston.log("debug", "Operations.push          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  pushf (dst, src) {
    winston.log("debug", "Operations.pushf         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  rcl (dst, src) {
    winston.log("debug", "Operations.rcl           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  rcr (dst, src) {
    winston.log("debug", "Operations.rcr           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  repnz (dst, src) {
    winston.log("debug", "Operations.repnz         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  repz (dst, src) {
    winston.log("debug", "Operations.repz          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  ret (dst, src) {
    winston.log("debug", "Operations.ret           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  retf (dst, src) {
    winston.log("debug", "Operations.retf          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  rol (dst, src) {
    winston.log("debug", "Operations.rol           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  ror (dst, src) {
    winston.log("debug", "Operations.ror           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  sahf (dst, src) {
    winston.log("debug", "Operations.sahf          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  sar (dst, src) {
    winston.log("debug", "Operations.sar           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  sbb (dst, src) {
    winston.log("debug", "Operations.sbb           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  scasb (dst, src) {
    winston.log("debug", "Operations.scasb         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  scasw (dst, src) {
    winston.log("debug", "Operations.scasw         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  shl (dst, src) {
    winston.log("debug", "Operations.shl           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  shr (dst, src) {
    winston.log("debug", "Operations.shr           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  ss (dst, src) {
    winston.log("debug", "Operations.ss            : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  stc (dst, src) {
    winston.log("debug", "Operations.stc           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  std (dst, src) {
    winston.log("debug", "Operations.std           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  sti (dst, src) {
    winston.log("debug", "Operations.sti           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  stosb (dst, src) {
    winston.log("debug", "Operations.stosb         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  stosw (dst, src) {
    winston.log("debug", "Operations.stosw         : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  sub (dst, src) {
    winston.log("debug", "Operations.sub           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  test (dst, src) {
    winston.log("debug", "Operations.test          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  wait (dst, src) {
    winston.log("debug", "Operations.wait          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  xchg (dst, src) {
    winston.log("debug", "Operations.xchg          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  xlat (dst, src) {
    winston.log("debug", "Operations.xlat          : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }
  xor (dst, src) {
    winston.log("debug", "Operations.xor           : (dst=" + dst.name + ", src=" + src.name + ")");
    this.cpu.cycleIP += 1;
  }

  notimp () {
    winston.log("info", "Operations - Instruction not implemented");
  };

  /**
   * Perform a short jump to another code location. This jump will not leave
   * the current segment.
   *
   * @param {number} offset The offset for the jump (twos complement)
   */
  shortJump (offset) {
    // One-byte twos-complement conversion
    // It seems Javascript does not do ~ (bitwise not) correctly
    let negative = ((offset >> 7) === 1);
    offset = negative ? (-1 * (offset >> 7)) * ((offset ^ 0xFF) + 1) : offset;

    // The short jump must be adjusted by the length of the
    // this._regIP += (offset + 2);
    this.cpu.reg16[regIP] += offset;
  }
}


