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
  b, w, v, u,
} from './Constants';
import {binString16, formatFlags, hexString16} from "./Debug";

const PARITY = [
/*         0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F
/* 0x00 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0x10 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0x20 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0x30 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0x40 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0x50 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0x60 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0x70 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0x80 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0x90 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0xA0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0xB0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0xC0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
/* 0xD0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0xE0 */ 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
/* 0xF0 */ 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1
];

export default class Operations {
  constructor(cpu) {
    this.cpu = cpu;
  }

  aaa (dst, src) {

  }
  aad (dst, src) {

  }
  aam (dst, src) {

  }

  /**
   * AAS (ASCII Adjust for Subtraction) corrects the result of a previous
   * subtraction of two valid unpacked decimal operands (the destination
   * operand must have been specified as register AL). AAS changes the content
   * of AL to a valid unpacked decimal number; the high-order halfbyte is
   * zeroed. AAS updates AF and CF; the content of OF, PF, SF and ZF is
   * undefined following execution of AAS.
   *   - [1] p.2-36
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  aas (dst, src) {

  }

  adc (dst, src) {

  }

  add (dst, src) {
    let segment = this.cpu.reg16[regCS];
    this.cpu.cycleIP += 1;
    let val = dst(segment, null) + src(segment, null);
    dst(val);
  };
  and (dst, src) {

  }
  call (dst, src) {

  }
  cbw (dst, src) {

  }
  clc (dst, src) {

  }
  cld (dst, src) {

  }
  cli (dst, src) {

  }
  cmc (dst, src) {

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
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  cmp (dst, src) {
    this.cpu.cycleIP += 1;
    let size = this.cpu.opcode.w;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let s = src(segment, null);
    let result = d - s;

    // Handle underflow correctly
    if (result < 0) {
      if (this.cpu.opcode.addrSize === b)
        result = 0xFF + 1 + result;
      else if (this.cpu.opcode.addrSize === w)
        result = 0xFFFF + 1 + result;
      else if (this.cpu.opcode.addrSize === v)
        result = 0xFFFF + 1 + result;
    }

    this.flagSub(d, s, result);

    return result;
  }
  cmpsb (dst, src) {

  }
  cmpsw (dst, src) {

  }
  cs (dst, src) {

  }
  cwd (dst, src) {

  }
  daa (dst, src) {

  }

  /**
   * DAS (Decimal Adjust for Subtraction) corrects the result of a previous
   * subtraction of two valid packed decimal operands (the destination operand
   * must have been specified as register AL). DAS changes the content of AL
   * to a pair of valid packed decimal digits. DAS updates AF, CF, PF, SF and
   * ZF; the content of OF is undefined following execution of DAS.
   *  - [1] p.2-36
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  das (dst, src) {

  }

  /**
   * DEC (Decrement) subtracts one from the destination, which may be a byte or
   * a word.
   *   - [1] p.2-36
   *
   * Modifies flags: AF, OF, PF, SF, and ZF
   *
   * NOTE: DEC does not affect CF.
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  dec (dst, src) {
    this.cpu.cycleIP += 1;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let s = 1;
    let result = d - s;

    // Handle underflow correctly
    if (result < 0) {
      if (this.cpu.opcode.addrSize === b)
        result = 0xFF + 1 + result;
      else if (this.cpu.opcode.addrSize === w)
        result = 0xFFFF + 1 + result;
      else if (this.cpu.opcode.addrSize === v)
        result = 0xFFFF + 1 + result;
    }

    this.flagSub(d, s, result);

    dst(segment, result);
    return result;
  }
  div (dst, src) {

  }
  ds (dst, src) {

  }
  es (dst, src) {

  }
  hlt (dst, src) {

  }
  idiv (dst, src) {

  }
  imul (dst, src) {

  }
  in (dst, src) {

  }
  iin (dst, src) {

  }
  inc (dst, src) {

  }
  int (dst, src) {

  }
  into (dst, src) {

  }
  iret (dst, src) {

  }
  ja (dst, src) {

  }
  jb (dst, src) {

  }
  jbe (dst, src) {

  }
  jcxz (dst, src) {

  }
  jg (dst, src) {

  }
  jge (dst, src) {

  }
  jl (dst, src) {

  }
  jle (dst, src) {

  }
  jmp (dst, src) {

  }
  jnb (dst, src) {

  }
  jno (dst, src) {

  }
  jns (dst, src) {

  }
  jnz (dst, src) {

  }
  jo (dst, src) {

  }
  jpe (dst, src) {

  }
  jpo (dst, src) {

  }
  js (dst, src) {

  }

  jz (dst, src) {
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

  }
  lds (dst, src) {

  }
  lea (dst, src) {

  }
  les (dst, src) {

  }
  lock (dst, src) {

  }
  lodsb (dst, src) {

  }
  lodsw (dst, src) {

  }
  loopnz (dst, src) {

  }
  loopz (dst, src) {

  }
  loop (dst, src) {

  }
  mov (dst, src) {

  }
  movb (dst, src) {

  }
  movsb (dst, src) {

  }
  movsw (dst, src) {

  }
  mul (dst, src) {

  }

  /**
   * NEG (Negate) subtracts the destination operand, which may be a byte or a
   * word, from 0 and returns the result to the destination. This forms the
   * two's complement of the number, effectively reversing the sign of an
   * integer. If the operand is zero, its sign is not changed. Attempting to
   * negate a byte containing -128 or a word containing -32,768 causes no
   * change to the operand and sets OF.
   *  - [1] p.2-36
   *
   * Modifies flags: AF, CF, OF, PF, SF and ZF. CF is always set except when
   * the operand is zero, in which case it is cleared.
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  neg (dst, src) {
    this.cpu.cycleIP += 1;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let result = 0 - d;

    // Handle underflow correctly
    if (result < 0) {
      if (this.cpu.opcode.addrSize === b)
        result = 0xFF + 1 + result;
      else if (this.cpu.opcode.addrSize === w)
        result = 0xFFFF + 1 + result;
      else if (this.cpu.opcode.addrSize === v)
        result = 0xFFFF + 1 + result;
    }

    this.flagSub(0, d, result);

    if (this.cpu.opcode.addrSize === b && d === 0x80) {
      result = 0x80;
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else if (d === 0x8000) {
      result = 0x8000;
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }

    dst(segment, result);
    return result;
  }
  nop (dst, src) {

  }
  not (dst, src) {

  }
  or (dst, src) {

  }
  out (dst, src) {

  }
  pop (dst, src) {

  }
  popf (dst, src) {

  }
  push (dst, src) {

  }
  pushf (dst, src) {

  }
  rcl (dst, src) {

  }
  rcr (dst, src) {

  }
  repnz (dst, src) {

  }
  repz (dst, src) {

  }
  ret (dst, src) {

  }
  retf (dst, src) {

  }
  rol (dst, src) {

  }
  ror (dst, src) {

  }
  sahf (dst, src) {

  }
  sar (dst, src) {

  }

  /**
   * SBB (Subtract with Borrow) subtracts the source from the destination,
   * subtracts one if CF is set, and returns the result to the destination
   * operand. Both operands may be bytes or words. Both operands may be signed
   * or unsigned binary numbers (see AAS and DAS). Since it incorporates a
   * borrow from a previous operation, SBB may be used to write routines that
   * subtract numbers longer than 16 bits.
   *   - [1] p.2-36
   *
   * Modifies flags: AF CF OF PF SF ZF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  sbb (dst, src) {
    this.cpu.cycleIP += 1;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let s = src(segment, null);
    let result = d - s - (this.cpu.reg16[regFlags] & FLAG_CF_MASK);

    // Handle underflow correctly
    if (result < 0) {
      if (this.cpu.opcode.addrSize === b)
        result = 0xFF + 1 + result;
      else if (this.cpu.opcode.addrSize === w)
        result = 0xFFFF + 1 + result;
      else if (this.cpu.opcode.addrSize === v)
        result = 0xFFFF + 1 + result;
    }

    this.flagSub(d, s, result);

    dst(segment, result);
    return result;
  }

  scasb (dst, src) {

  }
  scasw (dst, src) {

  }
  shl (dst, src) {

  }
  shr (dst, src) {

  }
  ss (dst, src) {

  }
  stc (dst, src) {

  }
  std (dst, src) {

  }
  sti (dst, src) {

  }
  stosb (dst, src) {

  }
  stosw (dst, src) {

  }

  /**
   * SUB The source operand is ~ubtracted from the destination operand, and
   * the result replaces the destination operand. The operands may be bytes or
   * words. Both operands may be signed or unsigned binary numbers (see AAS
   * and DAS).
   *   - [1] p.2-36
   *
   * Modifies flags: AF CF OF PF SF ZF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   * @return {number} Result of the operation
   */
  sub (dst, src) {
    this.cpu.cycleIP += 1;
    let segment = this.cpu.reg16[regCS];
    let d = dst(segment, null);
    let s = src(segment, null);
    let result = d - s;

    // Handle underflow correctly
    if (result < 0) {
      if (this.cpu.opcode.addrSize === b)
        result = 0xFF + 1 + result;
      else if (this.cpu.opcode.addrSize === w)
        result = 0xFFFF + 1 + result;
      else if (this.cpu.opcode.addrSize === v)
        result = 0xFFFF + 1 + result;
    }

    this.flagSub(d, s, result);

    dst(segment, result);
    return result;
  }

  test (dst, src) {

  }
  wait (dst, src) {

  }
  xchg (dst, src) {

  }
  xlat (dst, src) {

  }
  xor (dst, src) {

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

  /**
   * PF (parity flag): If the low-order eight bits of an arithmetic or logical
   * result contain an even number of I-bits, then the parity flag is set;
   * otherwise it is cleared. PF is provided for 8080/8085 compatibility; it
   * also can be used to check ASCII characters for correct parity.
   *   - [1] p.2-35
   *
   * @param {number} result Result of the operation to set the flag for
   */
  setPF_FLAG (result) {
    if (PARITY[(result & 0x00FF)]) this.cpu.reg16[regFlags] |= FLAG_PF_MASK;
    else this.cpu.reg16[regFlags] &= ~FLAG_PF_MASK;

    // let bitRep = (result & 0x00FF).toString(2);
    // let bitCnt = 0;
    // for (let b in bitRep) { if ("1" === bitRep[b]) bitCnt++; }
    //
    // if (0 === (bitCnt % 2)) this.cpu.reg16[regFlags] |= FLAG_PF_MASK;
    // else this.cpu.reg16[regFlags] &= ~FLAG_PF_MASK;
  }

  /**
   * SF (sign flag): Arithmetic and logical instructions set the sign flag
   * equal to the high-order bit (bit 7 or 15) of the result. For signed binary
   * numbers, the sign flag will be a for positive results and 1 for negative
   * results (so long as overflow does not occur). A conditional jump
   * instruction can be used following addition or subtraction to alter the
   * flow of the program depending on the sign of the result. Programs
   * performing unsigned operations typically ignore SF since the high-order
   * bit of the result is interpreted as a digit rather than a sign.
   *   - [1] p.2-35
   *
   * @param {number} result Result of the operation to set the flag for
   * @param {boolean} twosComplement Is the result a twos complement value?
   */
  setSF_FLAG (result, twosComplement=true) {
    if (twosComplement) {
      let size = this.cpu.opcode.addrSize;
      if (b === size && (result & 0xFF) >> 7) this.cpu.reg16[regFlags] |= FLAG_SF_MASK;
      else if ((result & 0xFFFF) >> 15) this.cpu.reg16[regFlags] |= FLAG_SF_MASK;
      else this.cpu.reg16[regFlags] &= ~FLAG_SF_MASK;
    }
    else {
      if (result < 0) this.cpu.reg16[regFlags] |= FLAG_SF_MASK;
      else this.cpu.reg16[regFlags] &= ~FLAG_SF_MASK;
    }
  }

  /**
   * ZF (zero flag): If the result of an arithmetic or logical operation is
   * zero, then ZF is set; otherwise ZF is cleared. A conditional jump
   * instruction can be used to alter the flow of the program if the result is
   * or is not zero.
   *   - [1] p.2-35
   *
   * @param {number} result Result of the operation to set the flag for
   */
  setZF_FLAG (result) {
    if (0 === result) this.cpu.reg16[regFlags] |= FLAG_ZF_MASK;
    else this.cpu.reg16[regFlags] &= ~FLAG_ZF_MASK;
  }

  /**
   *
   * @param v1
   * @param v2
   * @param result
   */
  flagSub (v1, v2, result) {
    let size = this.cpu.opcode.addrSize;
    // let result = v1 - v2;

    // CF (carry flag): If an addition results in a carry out of the high-order
    // bit of the result, then CF is set; otherwise CF is cleared. If a
    // subtraction results in a borrow into the highorder bit of the result,
    // then CF is set; otherwise CF is cleared. Note that a signed carry is
    // indicated by CF ≠ OF. CF can be used to detect an unsigned overflow.
    // Two instructions, ADC (add with carry) and SBB (subtract with borrow),
    // incorporate the carry flag  in their operations and can be used to
    // perform multibyte (e.g., 32-bit, 64-bit) addition and subtraction.
    //   - [1] p.2-35
    if ((v1 - v2) & (size === b ? 0xFF00 : 0xFFFF0000)) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    // OF (overflow flag): If the result of an operation is too large a
    // positive number, or too small a negative number to fit in the
    // destination operand (excluding the sign bit), then OF is set; otherwise
    // OF is cleared. OF thus indicates signed arithmetic overflow; it can be
    // tested with a conditional jump or the INTO (interrupt on overflow)
    // instruction. OF may be ignored when performing unsigned arithmetic.
    //   - [1] p.2-35
    if ( (result ^ v1) & (v1 ^ v2) & (size === b ? 0x80 : 0x8000)) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }
    // For addition
    // if ( (result ^ v1) & (result ^ v2) & (size === b ? 0x80 : 0x8000)) {
    //   this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    // } else {
    //   this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    // }

    // AF (auxiliary carry flag): If an addition results in a carry out of the
    // low-order halfbyte of the result, then AF is set; otherwise AF is
    // cleared. If a subtraction results in a borrow into the low-order
    // half-byte of the result, then AF is set; otherwise AF is cleared. The
    // auxiliary carry flag is provided for the decimal adjust instructions and
    // ordinarily is not used for any other purpose.
    //   - [1] p.2-35
    if ( (v1 ^ v2 ^ result) & 0x10) {
      this.cpu.reg16[regFlags] |= FLAG_AF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_AF_MASK;
    }

    this.setPF_FLAG(result);
    this.setSF_FLAG(result);
    this.setZF_FLAG(result);
  }
}


