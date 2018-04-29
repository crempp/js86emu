import {seg2abs, segIP, signExtend} from "../utils/Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
  b, w, v, u,
  PARITY, REP_INSTS,
  STATE_HALT, STATE_REP_Z, STATE_REP_NZ, STATE_REP_NONE, STATE_REP,
} from '../Constants';
import { FeatureNotImplementedException } from "../utils/Exceptions";

export default class Operations {
  constructor(cpu) {
    this.cpu = cpu;
  }

  /**
   * AAA (ASCII Adjust for Addition) changes the contents of register AL to a
   * valid unpacked decimal number; the high-order half-byte is zeroed. AAA
   * updates AF and CF; the content of OF, PF, SF and ZF is undefined following
   * execution of AAA.
   *   - [1] p.2-35
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  aaa (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * AAD (ASCII Adjust for Division) modifies the numerator in AL before
   * dividing two valid unpacked decimal operands so that the quotient
   * produced by the division will be a valid unpacked decimal number. AH must
   * be zero for the subsequent DIV to produce the correct result. The quotient
   * is returned in AL, and the remainder is returned in AH; both high-order
   * half-bytes are zeroed. AAD updates PF, SF and ZF; the content of AF, CF
   * and OF is undefined following execution of AAD.
   *   - [1] p.2-37
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  aad (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * AAM (ASCII Adjust for Multiply) corrects the result of a previous
   * multiplication of two valid unpacked decimal operands. A valid 2-digit
   * unpacked decimal number is derived from the content of AH and AL and is
   * returned to AH and AL. The high-order half-bytes of the multiplied
   * operands must have been OH for AAM to produce a correct result. AAM
   * updates PF, SF and ZF; the content of AF, CF and OF is undefined following
   * execution of AAM.
   *   - [1] p.2-37
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  aam (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
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
   * Modifies flags: ?
   *
   * http://service.scs.carleton.ca/sivarama/asm_book_web/Instructor_copies/ch11_bcd.pdf
   * https://stackoverflow.com/a/24093050/1436323
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  aas (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * ADC (Add with Carry) sums the operands, which may be bytes or words, adds
   * one if CF is set and replaces the destination operand with the result.
   * Both operands may be signed or unsigned binary numbers (see AAA and DAA).
   * ADC updates AF, CF, OF, PF, SF and ZF. Since ADC incorporates a carry from
   * a previous operation, it can be used to write routines to add numbers
   * longer than 16 bits.
   *   - [1] p.2-35
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  adc (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal + srcVal + (this.cpu.reg16[regFlags] & FLAG_CF_MASK);

    this.flagAdd(dstVal, srcVal, result);

    result = this.correctAddition(result);

    dst(segment, dstAddr, result);
  }

  /**
   * The sum of the two operands, which may be bytes or words, replaces the
   * destination operand. Both operands may be signed or unsigned binary
   * numbers (see AAA and DAA). ADD updates AF, CF, OF, PF, SF and ZF.
   *   - [1] p.2-35
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  add (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal + srcVal;

    this.flagAdd(dstVal, srcVal, result);

    result = this.correctAddition(result);

    dst(segment, dstAddr, result);
  };

  /**
   * AND performs the logical "and" of the two operands (byte or word) and
   * returns the result to the destination operand. A bit in the result is set
   * if both corresponding bits of the original operands are set; otherwise the
   * bit is cleared.
   *   - [1] p.2-35
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  and (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal & srcVal;
    this.setPF_FLAG(result);
    this.setSF_FLAG(result);
    this.setZF_FLAG(result);
    dst(segment, dstAddr, result);
  }

  /**
   * CALL activates an out-of-line procedure, saving information on the stack
   * to permit a RET (return) instruction in the procedure to transfer control
   * back to the instruction following the CALL. The assembler generates a
   * different type of CALL instruction depending on whether the programmer has
   * defined the procedure name as NEAR or FAR. For control to return properly,
   * the type of CALL instruction must match the type of RET instruction that
   * exits from the procedure. (The potential for a mismatch exists if the
   * procedure and the CALL are contained in separately assembled programs.)
   * Different forms of the CALL instruction allow the address of the target
   * procedure to be obtained from the instruction itself (direct CALL) or from
   * a memory location or register referenced by the instruction (indirect
   * CALL). In the following descriptions, bear in mind that the processor
   * automatically adjusts IP to point to the next instruction to be executed,
   * before saving it on the stack.
   *
   * For an intrasegment direct CALL, SP (the stack pointer) is decremented by
   * two and IP is pushed onto the stack. The relative displacement (up to
   * ±32k) of the target procedure from the CALL instruction is then added to
   * the instruction pointer. This form of the CALL instruction is
   * "self-relative" and is appropriate for position- independent (dynamically
   * relocatable) routines in which the CALL and its target are in the same
   * segment and are moved together.
   *
   * An intrasegment indirect CALL may be made through memory or through a
   * register. SP is decremented by two and IP is pushed onto the stack. The
   * offset of the target procedure is obtained from the memory word or 16-bit
   * general register referenced in the instruction and replaces IP.
   *
   * For an intersegment direct CALL, SP is decremented by two, and CS is
   * pushed onto the stack. CS is replaced by the segment word contained in the
   * instruction. SP again is decremented by two. IP is pushed onto the stack
   * and is replaced by the offset word contained in the instruction.
   *
   * For an intersegment indirect CALL (which only may be made through memory),
   * SP is decremented by two, and CS is pushed onto the stack. CS is then
   * replaced by the content of the second word oithe doubleword memory pointer
   * referenced by the instruction. SP again is decremented by two, and IP is
   * pushed onto the stack and is replaced by the content of the first word of
   * the doubleword pointer referenced by the instruction.
   *   - [1] p.2-43 to 2.44
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  call (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    switch (this.cpu.opcode.opcode_byte) {
      case 0x9A:
        // CALL Ap (far)
        this.push16(this.cpu.reg16[regCS]);
        this.push16(this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc);
        this.cpu.reg16[regCS] = dstVal[0];
        this.cpu.reg16[regIP] = dstVal[1];
        break;
      case 0xE8:
        // CALL Jv (near)
        this.push16(this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc);
        this.cpu.reg16[regIP] = dstVal;
        break;
      case 0xFF:
        if (this.cpu.opcode.reg === 2) {
          // 0xFF (2) CALL Ev (near)
          this.push16(this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc);
          this.cpu.reg16[regIP] = dstVal;
        }
        else if (this.cpu.opcode.reg === 3) {
          // 0xFF (3) CALL Ep (far)
          this.push16(this.cpu.reg16[regCS]);
          this.push16(this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc);
          this.cpu.reg16[regCS] = dstVal[0];
          this.cpu.reg16[regIP] = dstVal[1];
        }
        break;
    }
  }

  /**
   * CBW (Convert Byte to Word) extends the sign of the byte in register AL
   * throughout register AH. CBW does not affect any flags. CBW can be used to
   * produce a double-length (word) dividend from a byte prior to performing
   * byte division.
   *   - [1] p.2-38
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  cbw (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * CLC (Clear Carry flag) zeroes the carry flag (CF) and affects no other
   * flags. It (and CMC and STC) is useful in conjunction with the RCL and RCR
   * instructions.
   *   - [1] p.2-47
   *
   * Modifies flags: CF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  clc (dst, src) {
    this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK;
  }

  /**
   * CLD (Clear Direction flag) zeroes DF causing the string instructions to
   * auto-increment the SI and/or DI index registers. CLD does not affect any
   * other flags.
   *   - [1] p.2-47
   *
   * Modifies flags: DF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  cld (dst, src) {
    this.cpu.reg16[regFlags] &= ~FLAG_DF_MASK;
  }

  /**
   * CLI (Clear Interrupt-enable flag) zeroes IF. When the interrupt-enable
   * flag is cleared, the 8086 and 8088 do not recognize an external interrupt
   * request that appears on the INTR line; in other words maskable interrupts
   * are disabled. A non-maskable interrupt appearing on the NMI line, however,
   * is honored, as is a software interrupt. CLI does not affect any other
   * flags.
   *   - [1] p.2-48
   *
   * Modifies flags: IF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  cli (dst, src) {
    this.cpu.reg16[regFlags] &= ~FLAG_IF_MASK;
  }

  /**
   * CMC (Complement Carry flag) "toggles" CF to its opposite state and affects
   * no other flags.
   *   - [1] p.2-47
   *
   * Modifies flags: IF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  cmc (dst, src) {
    if ((this.cpu.reg16[regFlags] & FLAG_CF_MASK) === 0) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK;
    }
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
   */
  cmp (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    if (this.cpu.opcode.addrSize === w || this.cpu.opcode.addrSize === v) {
      srcVal = signExtend(srcVal);
    }
    let result = dstVal - srcVal;
    result = this.correctSubtraction(result);

    this.flagSub(dstVal, srcVal, result);
  }

  /**
   * CMPS(Compare String) subtracts the destination byte or word (addressed by
   * DI) from the source byte or word (addressed by SI). CMPS affects the
   * flags but does not alter either operand, updates SI and DI to point to the
   * next string element and updates AF, CF, OF, PF, SF and ZF to reflect the
   * relationship of the destination element to the source element. For
   * example, if a JG (Jump if Greater) instruction follows CMPS, the jump is
   * taken if the destination element is greater than the source element. If
   * CMPS is prefixed with REPE or REPZ, the operation is interpreted as
   * "compare while not end-of-string (CX not zero) and strings are equal
   * (ZF = 1)." If CMPS is preceded by REPNE or REPNZ, the operation is
   * interpreted as "compare while not end-of-string (CX not zero) and strings
   * are not equal (ZF = 0)." Thus, CMPS can be used to find matching or
   * differing string elements.
   *   - [1] p.2-42
   *
   * Compares byte at address DS:(E)SI with byte at address ES:(E)DI and sets
   * the status flags accordingly
   *   - [3] p.3-87
   *
   * Modifies flags: AF, CF, OF, PF, SF, ZF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  cmpsb (dst, src) {
    let dstAddr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let srcAddr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);
    let dstVal = this.cpu.mem8[dstAddr];
    let srcVal = this.cpu.mem8[srcAddr];
    let result = srcVal - dstVal;

    result = this.correctSubtraction(result);

    this.flagSub(srcVal, dstVal, result);

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 1;
      this.cpu.reg16[regSI] -= 1;
    }
    else {
      this.cpu.reg16[regDI] += 1;
      this.cpu.reg16[regSI] += 1;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * CMPS(Compare String) subtracts the destination byte or word (addressed by
   * DI) from the source byte or word (addressed by SI). CMPS affects the
   * flags but does not alter either operand, updates SI and DI to point to the
   * next string element and updates AF, CF, OF, PF, SF and ZF to reflect the
   * relationship of the destination element to the source element. For
   * example, if a JG (Jump if Greater) instruction follows CMPS, the jump is
   * taken if the destination element is greater than the source element. If
   * CMPS is prefixed with REPE or REPZ, the operation is interpreted as
   * "compare while not end-of-string (CX not zero) and strings are equal
   * (ZF = 1)." If CMPS is preceded by REPNE or REPNZ, the operation is
   * interpreted as "compare while not end-of-string (CX not zero) and strings
   * are not equal (ZF = 0)." Thus, CMPS can be used to find matching or
   * differing string elements.
   *   - [1] p.2-42
   *
   * Compares byte at address DS:(E)SI with byte at address ES:(E)DI and sets
   * the status flags accordingly
   *   - [3] p.3-87
   *
   * Modifies flags: AF, CF, OF, PF, SF, ZF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  cmpsw (dst, src) {
    let dstAddr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let srcAddr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);
    let dstVal = this.cpu.mem8[dstAddr + 1] << 8 | this.cpu.mem8[dstAddr];
    let srcVal = this.cpu.mem8[srcAddr + 1] << 8 | this.cpu.mem8[srcAddr];
    let result = srcVal - dstVal;

    result = this.correctSubtraction(result);

    this.flagSub(srcVal, dstVal, result);

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 2;
      this.cpu.reg16[regSI] -= 2;
    }
    else {
      this.cpu.reg16[regDI] += 2;
      this.cpu.reg16[regSI] += 2;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  cs (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * CWD (Convert Word to Doubleword) extends the sign of the word in register
   * AX throughout register DX. CWD does not affect any flags. CWD can be used
   * to produce a double-length (doubleword) dividend from a word prior to
   * performing word division.
   *  - [1] p.2-38
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  cwd (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * DAA (Decimal Adjust for Addition) corrects the result of previously adding
   * two valid packed decimal operands (the destination operand must have been
   * register AL). DAA changes the content of AL to a pair of valid packed
   * decimal digits. It updates AF, CF, PF, SF and ZF; the content of OF is
   * undefined following execution of DAA.
   *  - [1] p.2-36
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  daa (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * DAS (Decimal Adjust for Subtraction) corrects the result of a previous
   * subtraction of two valid packed decimal operands (the destination operand
   * must have been specified as register AL). DAS changes the content of AL
   * to a pair of valid packed decimal digits. DAS updates AF, CF, PF, SF and
   * ZF; the content of OF is undefined following execution of DAS.
   *  - [1] p.2-36
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  das (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * DEC (Decrement) subtracts one from the destination, which may be a byte or
   * a word.
   *   - [1] p.2-36
   *
   * Modifies flags: AF, OF, PF, SF, and ZF (DEC does not affect CF)
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  dec (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = 1;

    let result = dstVal - srcVal;
    result = this.correctSubtraction(result);

    this.flagSub(dstVal, srcVal, result);

    dst(segment, dstAddr, result);
  }

  /**
   * DIV (divide) performs an unsigned division of the accumulator (and its
   * extension) by the source operand. If the source operand is a byte, it is
   * divided into the double-length dividend assumed to be in registers AL and
   * AH. The single-length quotient is returned in AL, and the single-length
   * remainder is returned in AH. If the source operand is a word, it is
   * divided into the doublelength dividend in registers AX and DX. The
   * single-length quotient is returned in AX, and the single-length remainder
   * is returned in DX. If the quotient exceeds the capacity of its destination
   * register (FFH for byte source, FFFFFH for word source), as when division
   * by zero is attempted, a type 0 interrupt is generated, and the quotient
   * and remainder are undefined. Nonintegral quotients are truncated to
   * integers. The content of AF, CF, OF, PF, SF and ZF is undefined following
   * execution of DIV.
   *   - [1] p.2-37
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  div (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  ds (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  es (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * HLT (Halt) causes the 8086/8088 to enter the halt state. The processor
   * leaves the halt state upon activation of the RESET line, upon receipt of a
   * non-maskable interrupt request on NMI, or, if interrupts are enabled, upon
   * receipt of a maskable interrupt request on INTR. HLT does not affect any
   * flags. It may be used as an alternative to an endless software loop in
   * situations where a program must wait for an interrupt.
   *   - [1] p.2-37
   *
   * Modifies flags: None
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  hlt (dst, src) {
    this.cpu.state = STATE_HALT;
  }

  /**
   * IDIV (Integer Divide) performs a signed division of the accumulator (and
   * its extension) by the source operand. If the source operand is a byte, it
   * is divided into the double-length dividend assumed to be in registers AL
   * and AH; the singlelength quotient is returned in AL, and the singlelength
   * remainder is returned in AH. For byte integer division, the maximum
   * positive quotient is +127 (7FH) and the minimum negative quotient is -127
   * (SIH). If the source operand is a word, it is divided into the
   * double-length dividend in registers AX and DX; the single-length quotient
   * is returned in AX, and the single-length remainder is returned in DX. For
   * word integer division, the maximum positive quotient is +32,767 (7FFFH)
   * and the minimum negative quotient is -32,767 (SOOIH). If the quotient is
   * positive and exceeds the maximum, or is negative and is less than the
   * minimum, the quotient and remainder are undefined, and a type 0 interrupt
   * is generated. In particular, this occurs if division by 0 is attempted.
   * Nonintegral quotients are truncated (toward 0) to integers, and the
   * remainder has the same sign as the dividend. The content of AF, CF, OF,
   * PF, SF and ZF is undefined following IDIV.
   *   - [1] p.2-37
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  idiv (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * IMUL (Integer Multiply) performs a signed multiplication of the source
   * operand and the accumulator. If the source is a byte, then it is
   * multiplied by register AL, and the double-length result is returned in AH
   * and AL. If the source is a word, then it is multiplied by register AX, and
   * the double-length result is returned in registers DX and AX. If the upper
   * half of the result (AH for byte source, DX for word source) is not the
   * sign extension of the lower half of the result, CF and OF are set;
   * otherwise they are cleared. When CF and OF are set, they indicate that AH
   * or DX contains significant digits of the result. The content of AF, PF, SF
   * and ZF is undefined following execution of IMUL.
   *   - [1] p.2-37
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  imul (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * IN transfers a byte or a word from an input port to the AL register or the
   * AX register, respectively. The port number may be specified either with an
   * immediate byte constant, allowing access to ports numbered 0 through 255,
   * or with a number previously placed in the DX register, allowing variable
   * access (by changing the value in DX) to ports numbered from 0 through
   * 65,535.
   *   - [1] p.2-32
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  in (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  iin (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * INC (Increment) adds one to the destination operand. The operand may be a
   * byte or a word and is treated as an unsigned binary number (see AAA and
   * DAA). INC updates AF, OF, PF, SF and ZF; it does not affect CF.
   *   - [1] p.2-35
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  inc (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = 1;

    let result = dstVal + srcVal;

    this.flagAdd(dstVal, srcVal, result);

    result = this.correctAddition(result);

    dst(segment, dstAddr, result);
  }

  int (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  into (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  iret (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * JA / JNBE - Jump if above / not below nor equal
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: (CF AND ZF)=O
   *
   * NOTE: The 8086 Family Users Manual appears to be wrong on condition
   * tested. It states (CF OR ZF)=O but other resources
   * (https://en.wikibooks.org/wiki/X86_Assembly/Control_Flow) state
   * (CF AND ZF)=O. The former doesn't work, the latter does.
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  ja (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ( (this.cpu.reg16[regFlags] & FLAG_ZF_MASK) === 0 &&
         (this.cpu.reg16[regFlags] & FLAG_CF_MASK) === 0)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JB / JNAE - Jump if below / not above nor equal
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * CModifies flags: NONE
   * Condition Tested: CF=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jb (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_CF_MASK) > 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JBE / JNA - Jump if below or equal / not above
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: (CF OR ZF)=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jbe (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ( (this.cpu.reg16[regFlags] & FLAG_ZF_MASK) > 0 ||
         (this.cpu.reg16[regFlags] & FLAG_CF_MASK) > 0)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JCXZ (Jump If CX Zero) transfers control to the target operand if CX is O.
   * This instruction is useful at the beginning of a loop to bypass the loop
   * if ex has a zero value, i.e., to execute the loop zero times.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: (CF OR ZF)=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jcxz (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ( this.cpu.reg16[regCX] === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JG / JNLE - Jump if greater / not less nor equal
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: ((SF XOR OF) OR ZF)=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jg (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if (((this.cpu.reg16[regFlags] & FLAG_SF_MASK) >> 7) ^ ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) >> 11) === 0 ||
         (this.cpu.reg16[regFlags] & FLAG_ZF_MASK) === 0)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JGE / JNL - Jump if greater or equal / not less
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: (SF XOR OF)=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jge (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if (((this.cpu.reg16[regFlags] & FLAG_SF_MASK) >> 7) ^
        ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) >> 11) === 0)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JL / JNGE - Jump if less / not greater nor equal
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: (SF XOR OF)=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jl (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if (((this.cpu.reg16[regFlags] & FLAG_SF_MASK) >> 7) ^
        ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) >> 11) === 1)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JLE / JNG - Jump if less or equal / not greater
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: ((SF XOR OF) OR ZF)=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jle (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if (((this.cpu.reg16[regFlags] & FLAG_SF_MASK) >> 7) ^ ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) >> 11) > 0 ||
        (this.cpu.reg16[regFlags] & FLAG_ZF_MASK) > 0)
    {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JMP unconditionally transfers control to the target location. Unlike a CALL
   * instruction, JMP does not save any information on the stack, and no return to
   * the instruction following the JMP is expected. Like CALL, the address of the
   * target operand may be obtained from the instruction itself (direct JMP) or
   * from memory or a register referenced by the instruction (indirect JMP).
   *
   * An intrasegment direct JMP changes the instruction pointer by adding the
   * relative displacement of the target from the JMP instruction. If the assembler
   * can determine that the target is within 127 bytes of the JMP, it automatically
   * generates a two-byte form of this instruction called a SHORT JMP; otherwise,
   * it generates a NEAR JMP that can address a target within ±32k. Intrasegment
   * direct JMPS are self-relative and are appropriate in position-independent
   * (dynamically relocatable) routines in which the JMP and its target are in the
   * same segment and are moved together.
   *
   * An intrasegment indirect JMP may be made either through memory or through a
   * 16-bit general register. In the first case, the content of the word referenced
   * by the instruction replaces the instruction pointer. In the second case, the
   * new IP value is taken from the register named in the instruction.
   *
   * An intersegment direct JMP replaces IP and CS with values contained in the
   * instruction.
   *
   * An intersegment indirect JMP may be made only through memory. The first
   * word of the doubleword pointer referenced by the instruction replaces IP,
   * and the second word replaces CS.
   *   - [1] p.2-45
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jmp (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let oper = dst(segment, dstAddr);

    switch (this.cpu.opcode.opcode_byte) {
      case 0xE9:
        // JMP Jv (near)
        this.cpu.reg16[regIP] = oper;
        break;
      case 0xEA:
        // JMP Ap (far)
        this.cpu.reg16[regCS] = oper[0];
        this.cpu.reg16[regIP] = oper[1];
        break;
      case 0xEB:
        // JMP Jb (short)
        this.cpu.reg16[regIP] = oper;
        break;
      case 0xFF:
        if (this.cpu.opcode.reg === 4) {
          // JMP Ev (near)
          this.cpu.reg16[regIP] = oper;
        }
        else if (this.cpu.opcode.reg === 5) {
          // JMP Mp (far)
          this.cpu.reg16[regCS] = oper[0];
          this.cpu.reg16[regIP] = oper[1];
        }
        break;
    }
  }

  /**
   * JAE / JNB Jump if above or equal / not below
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: CF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jnb (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_CF_MASK) === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JNO Jump if not overflow
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: OF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jno (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JNS Jump if not sign
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: SF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jns (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_SF_MASK) === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JNE / JNZ Jump if not equal / not zero
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: ZF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jnz (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_ZF_MASK) === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JO Jump if overflow
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: OF=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jo (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_OF_MASK) > 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JP / JPE Jump if parity / parity even
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: PF=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jpe (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_PF_MASK) > 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JNP / JPO Jump if not parity / parity odd
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: PF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  jpo (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_PF_MASK) === 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JS Jump if sign
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: SF=1
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src NOT USED
   */
  js (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_SF_MASK) > 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * JZ / JE - Jump if equal/zero
   *
   * The conditional transfer instructions are jumps that may or may not
   * transfer control depending on the state of the CPU flags at the time the
   * instruction is executed. If the condition is "true," then control is
   * transferred to the target specified in the instruction. If the condition
   * is "false," then control passes to the instruction that follows the
   * conditional jump. All conditional jumps are SHORT, that is, the target
   * must be in the current code segment and within -128 to +127 bytes of the
   * first byte of the next instruction (JMP OOH jumps to the first byte of
   * the next instruction). Since the jump is made by adding the relative
   * displacement of the target to the instruction pointer, all conditional
   * jumps are self-relative and are appropriate for position-independent
   * routines.
   *   - [1] p.2-44 to 2.46
   *
   * Modifies flags: NONE
   * Condition Tested: ZF=O
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  jz (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    if ((this.cpu.reg16[regFlags] & FLAG_ZF_MASK) > 0) {
      this.cpu.reg16[regIP] = dst(segment, dstAddr);
    }
  }

  /**
   * LAHF (load register AH from flags) copies SF, ZF, AF, PF and CF (the
   * 8080/8085 flags) into bits 7, 6, 4, 2 and 0, respectively, of register
   * AH (see figure 2-32). The content of bits 5, 3 and 1 is undefined; the
   * flags themselves are not affected. LAHF is provided primarily for
   * converting 8080/8085 assembly language programs to run on an 8086 or 8088.
   *   - [1] p.2-32
   *
   * AH ← EFLAGS(SF:ZF:0:AF:0:PF:1:CF);
   *   - [4] 3-518
   *
   * Modifies flags: ?
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  lahf (dst, src) {
    this.cpu.reg8[regAH] = this.cpu.reg16[regFlags] & 0b11010111;
  }

  /**
   * LDS (load pointer using DS) transfers a 32-bit pointer variable from the
   * source operand, which must be a memory operand, to the destination operand
   * and register DS. The offset word of the pointer is transferred to the
   * destination operand, which may be any 16-bit general register. The segment
   * word of the pointer is transferred to register DS. Specifying SI as the
   * destination operand is a convenient way to prepare to process a source
   * string that is not in the current data segment (string instructions assume
   * that the source string is located in the current data segment and that SI
   * contains the offset of the string).
   *   - [1] p.2-32
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  lds (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let srcVal = src(segment, srcAddr);

    dst(segment, dstAddr, srcVal[1]);
    this.cpu.reg16[regDS] = srcVal[0];
  }

  /**
   * LEA (load effective address) transfers the offset of the source operand
   * (rather than its value) to the destination operand. The source operand
   * must be a memory operand, and the destination operand must be a 16-bit
   * general register. LEA does not affect any flags. The XLA T and string
   * instructions assume that certain registers point to operands; LEA can
   * be used to load these registers (e.g., 10'lding BX with the address of
   * the translate table used by the XLA T instruction).
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  lea (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let srcVal = src(segment, srcAddr);

    dst(segment, dstAddr, srcVal);
  }

  /**
   * LES (load pointer using ES) transfers a 32-bit pointer variable from the
   * source operand, which must be a memory operand, to the destination operand
   * and register ES. The offset word of the pointer is transferred to the
   * destination operand, which may be any 16-bit general register. The segment
   * word of the pointer is transferred to register ES. Specifying DI as the
   * destination operand is a convenient way to prepare to process a
   * destination string that is not in the current extra segment. (The
   * destination string must be located in the extra segment, and DI must
   * contain the offset of the string.)
   *   - [1] p.2-32
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  les (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let srcVal = src(segment, srcAddr);

    dst(segment, dstAddr, srcVal[1]);
    this.cpu.reg16[regES] = srcVal[0];
  }

  lock (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * LODS (Load String) transfers the byte or word string element addressed by
   * SI to register AL or AX, and updates SI to point to the next element in
   * the string. This instruction is not ordinarily repeated since the
   * accumulator would be over- written by each repetition, and only the last
   * element would be retained. However, LODS is very useful in software loops
   * as part of a more complex string function built up from string
   * primitives and other instructions.
   *   - [1] p.2-43
   *
   * Load byte at address DS:(E)SI into AL
   *   - [3] p.3-369
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  lodsb (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);
    this.cpu.reg8[regAL] = this.cpu.mem8[addr];

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regSI] -= 1;
    }
    else {
      this.cpu.reg16[regSI] += 1;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * LODS (Load String) transfers the byte or word string element addressed by
   * SI to register AL or AX, and updates SI to point to the next element in
   * the string. This instruction is not ordinarily repeated since the
   * accumulator would be over- written by each repetition, and only the last
   * element would be retained. However, LODS is very useful in software loops
   * as part of a more complex string function built up from string
   * primitives and other instructions.
   *   - [1] p.2-43
   *
   * Load byte at address DS:(E)SI into AL
   *   - [3] p.3-369
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  lodsw (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);
    this.cpu.reg16[regAX] = this.cpu.mem8[addr + 1] << 8 | this.cpu.mem8[addr];

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regSI] -= 2;
    }
    else {
      this.cpu.reg16[regSI] += 2;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * LOOPNE and LOOPNZ (Loop While Not Equal and Loop While Not Zero) are also
   * synonyms for the same instruction. CX is decremented by 1, and control is
   * transferred to the target operand if CX is not 0 and if ZF is clear;
   * otherwise the next sequential instruction is executed.
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  loopnz (dst, src) {
    this.cpu.reg16[regCX] -= 1;

    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    if (this.cpu.reg16[regCX] !== 0 &&
      ((this.cpu.reg16[regFlags] & FLAG_ZF_MASK) === 0))
    {
      this.cpu.reg16[regIP] = dstVal;
    }
  }

  /**
   * LOOPE and LOOPZ (Loop While Equal and Loop While Zero) are different
   * mnemonics for the same instruction (similar to the REPE and REPZ repeat
   * prefixes). CX is decremented by 1, and control is transferred to the
   * target operand if CX is not 0 and if ZF is set; otherwise the instruction
   * following LOOPE/LOOPZ is executed.
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  loopz (dst, src) {
    this.cpu.reg16[regCX] -= 1;

    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    if (this.cpu.reg16[regCX] !== 0 &&
      ((this.cpu.reg16[regFlags] & FLAG_ZF_MASK) > 0))
    {
      this.cpu.reg16[regIP] = dstVal;
    }
  }

  /**
   * LOOP decrements CX by 1 and transfers control to the target operand if CX
   * is not 0; otherwise the instruction following LOOP is executed.
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  loop (dst, src) {
    this.cpu.reg16[regCX] -= 1;

    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    if (this.cpu.reg16[regCX] !== 0) {
      this.cpu.reg16[regIP] = dstVal;
    }
  }

  /**
   * MOV transfers a byte or a word from the source operand to the destination
   * operand.
   *  - [1] p.2-31
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  mov (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let srcVal = src(segment, srcAddr);
    dst(segment, dstAddr, srcVal);
  }

  /**
   * MOVS (Move String) transfers a byte or a word from the source string
   * (addressed by SI) to the destination string (addressed by DI) and updates
   * SI and DI to point to the next string element. When used in conjunction
   * with REP, MOYS performs a memory-to-memory block transfer.
   *    - [1] p.2-42
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  movsb (dst, src) {
    let dstAddr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let srcAddr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);

    this.cpu.mem8[dstAddr] = this.cpu.mem8[srcAddr];

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 1;
      this.cpu.reg16[regSI] -= 1;
    }
    else {
      this.cpu.reg16[regDI] += 1;
      this.cpu.reg16[regSI] += 1;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * MOVS (Move String) transfers a byte or a word from the source string
   * (addressed by SI) to the destination string (addressed by DI) and updates
   * SI and DI to point to the next string element. When used in conjunction
   * with REP, MOYS performs a memory-to-memory block transfer.
   *    - [1] p.2-42
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  movsw (dst, src) {
    let dstAddr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let srcAddr = seg2abs(this.cpu.reg16[regDS], this.cpu.reg16[regSI]);

    this.cpu.mem8[dstAddr] = this.cpu.mem8[srcAddr];
    this.cpu.mem8[dstAddr + 1] = this.cpu.mem8[srcAddr + 1];

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 2;
      this.cpu.reg16[regSI] -= 2;
    }
    else {
      this.cpu.reg16[regDI] += 2;
      this.cpu.reg16[regSI] += 2;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * MUL (Multiply) performs an unsigned multiplication of the source operand
   * and the accumulator. If the source is a byte, then it is multiplied by
   * register AL, and the double-length result is returned in AH and AL. If the
   * source operand is a word, then it is multiplied by register AX, and the
   * double-length result is returned in registers DX and AX. The operands are
   * treated as unsigned binary numbers (see AAM). If the upper half of the
   * result (AH for byte source, DX for word source) is nonzero, CF and OF are
   * set; otherwise they are cleared. When CF and OF are set, they indicate
   * that AH or DX contains significant digits of the result. The content of
   * AF, PF, SF and ZF is undefined following execution of MUL.
   *   - [1] p.2-36
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  mul (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
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
   */
  neg (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    let result = 0 - dstVal;
    result = this.correctSubtraction(result);

    this.flagSub(0, dstVal, result);

    if (this.cpu.opcode.addrSize === b && dstVal === 0x80) {
      result = 0x80;
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else if (dstVal === 0x8000) {
      result = 0x8000;
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }

    dst(segment, dstAddr, result);
  }

  /**
   * NOP (No Operation) causes the CPU to do nothing. Nap does not affect any
   * flags.
   *   - [1] p.2-48
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  nop (dst, src) {
    // Do nothing
  }

  /**
   * NOT inverts the bits (forms the one's complement) of the byte or word
   * operand.
   *   - [1] p.2-38
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  not (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);
    let size = this.cpu.opcode.addrSize;

    let value = dstVal ^ (size === b ? 0xFF : 0xFFFF);

    dst(segment, dstAddr, value);
  }

  /**
   * OR performs the logical "inclusive or" of the two operands (byte or word)
   * and returns the result to the destination operand. A bit in the result is
   * set if either or both corresponding bits in the original operands are set;
   * otherwise the result bit is cleared.
   *   - [1] p.2-38
   *
   * Modifies flags: PF, SF, ZF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  or (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal | srcVal;

    this.setPF_FLAG(result);
    this.setSF_FLAG(result);
    this.setZF_FLAG(result);
    dst(segment, dstAddr, result);
  }

  /**
   * OUT transfers a byte or a word from the AL register or the AX register,
   * respectively, to an output port. The port number may be specified either
   * with an immediate byte constant; allowing access to ports numbered 0
   * through 255, or with a number previously placed in register DX, allowing
   * variable access (by changing the value in DX) to ports numbered from 0
   * through 65,535.
   *   - [1] p.2-31
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  out (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * POP transfers the word at the current top of stack (pointed to by SP) to
   * the destination operand, and then increments SP by two to point to the new
   * top of stack. POP can be used to move temporary variables from the stack
   * to registers or memory.
   *   - [1] p.2-31
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  pop (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);

    dst(segment, dstAddr, this.pop16());
  }

  /**
   * POPF transfers specific bits from the word at the current top of stack
   * (pointed to by register SP) into the 8086/8088 flags, replacing whatever
   * values the flags previously contained (see figure 2-32). SP is then
   * incremented by two to point to the new top of stack. PUSHF and POPF allow
   * a procedure to save and restore a calling program's flags. They also
   * allow a program to change the setting of TF (there is no instruction for
   * updating this flag directly). The change is accomplished by pushing the
   * flags, altering bit 8 of the memory-image and then popping the flags.
   *   - [1] p.2-31
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  popf (dst, src) {
    this.cpu.reg16[regFlags] = this.pop16();
  }

  /**
   * PUSH decrements SP (the stack pointer) by two and then transfers a word
   * from the source operand to the top of stack now pointed to by SP. PUSH
   * often is used to place parameters on the stack before calling a procedure;
   * more generally, it is the basic means of storing temporary data on the
   * stack.
   *   - [1] p.2-31
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  push (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let dstVal = dst(segment, dstAddr);

    this.push16(dstVal);
  }

  /**
   * PUSHF decrements SP (the stack pointer) by two and then transfers all
   * flags to the word at the top of stack pointed to by SP (see figure 2-32).
   * The flags themselves are not affected.
   *    - [1] p.2-33
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  pushf (dst, src) {
    this.push16(this.cpu.reg16[regFlags]);
  }

  /**
   * RCL (Rotate through Carry Left) rotates the bits in the byte or word
   * destination operand to the left by the number of bits specified in the
   * count operand. The carry flag (CF) is treated as "part of" the destination
   * operand; that is, its value is rotated into the low-order bit of the
   * destination, and itself is replaced by the high-order bit of the
   * destination.
   *    - [1] p.2-40
   *
   * The OF flag is defined only for the 1-bit rotates; it is undefined in all
   * other cases (except RCL and RCR instructions only: a zero-bit rotate does
   * nothing, that is affects no flags). For left rotates, the OF flag is set
   * to the exclusive OR of the CF bit (after the rotate) and the
   * most-significant bit of the result. For right rotates, the OF flag is set
   * to the exclusive OR of the two most-significant bits of the result.
   *   - [4] p.4-519
   *
   * Modifies flags: CF, OF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  rcl (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;

    let oldcf, of, cf = this.cpu.reg16[regFlags] & 0x01;

    for (let shift = 1; shift <= srcVal; shift++) {
      oldcf = cf;
      if (dstVal & 0x80) cf = 1;
      else cf = 0;

      dstVal = dstVal << 1;
      dstVal = dstVal | oldcf;
    }

    if (srcVal === 1) {
      of = cf ^ ( (dstVal >> (size === b ? 7 : 15)) & 1);
    }

    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    if ( of === 1 ) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }

    dstVal = dstVal & (size === b ? 0xFF : 0xFFFF);
    dst(segment, dstAddr, dstVal);
  }

  /**
   * RCR (Rotate through Carry Right) operates exactly like RCL except that the
   * bits are rotated right instead of left.
   *    - [1] p.2-40
   *
   * The OF flag is defined only for the 1-bit rotates; it is undefined in all
   * other cases (except RCL and RCR instructions only: a zero-bit rotate does
   * nothing, that is affects no flags). For left rotates, the OF flag is set
   * to the exclusive OR of the CF bit (after the rotate) and the
   * most-significant bit of the result. For right rotates, the OF flag is set
   * to the exclusive OR of the two most-significant bits of the result.
   *   - [4] p.4-519
   *
   * Modifies flags: CF, OF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  rcr (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;

    let oldcf, of, cf = this.cpu.reg16[regFlags] & 0x01;

    for (let shift = 1; shift <= srcVal; shift++) {
      oldcf = cf;
      cf = dstVal & 1;
      dstVal = (dstVal >> 1) | (oldcf << (size === b ? 7 : 15));
    }

    if (srcVal === 1) {
      of = (dstVal >> (size === b ? 7 : 15)) ^ ( (dstVal >> (size === b ? 6 : 14)) & 1);
    }

    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    if ( of === 1 ) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }

    dstVal = dstVal & (size === b ? 0xFF : 0xFFFF);
    dst(segment, dstAddr, dstVal);
  }

  /**
   * Repeat, Repeat While Equal, Repeat While Zero, Repeat While Not Equal and
   * Repeat While Not Zero are five mnemonics for two forms of the prefix byte
   * that controls repetition of a subsequent string instruction. The different
   * mnemonics are provided to improve program clarity. The repeat prefixes do
   * not affect the flags.
   *
   * REP is used in conjunction with the MOVS (Move String) and STOS (Store
   * String) instructions and is interpreted as "repeat while not
   * end-of-string" (CX not 0). REPE and REPZ operate identically and are
   * physically the same prefix byte as REP. These instructions are used with
   * the CMPS (Compare String) and SCAS (Scan String) instructions and require
   * ZF (posted by these instructions) to be set before initiating the next
   * repetition. REPNE and REPNZ are two mnemonics for the same prefix byte.
   * These instructions function the same as REPE and REPZ except that the zero
   * flag must be cleared or the repetition is terminated. Note that ZF does
   * not need to be initialized before executing the repeated string
   * instruction.
   *
   * Repeated string sequences are interruptable; the processor will recognize
   * the interrupt before pro- cessing the next string element. System
   * interrupt processing is not affected in any way. Upon return from the
   * interrupt, the repeated operation is resumed from the point of
   * interruption. Note, however, that execution does not resume properly if a
   * second or third prefix (i.e., segment override or LOCK) has been
   * specified in addition to any of the repeat prefixes. The processor
   * "remembers" only one prefix in effect at the time of the interrupt, the
   * prefix that immediately precedes the string instruction. After returning
   * from the interrupt, processing resumes at this point, but any additional
   * prefixes specified are not in effect. If more than one prefix must be used
   * with a string instruction, interrupts may be disabled for the duration of
   * the repeated execution. However, this will not prevent a non-maskable
   * interrupt from being recognized. Also, the time that the system is unable
   * to respond to interrupts may be unacceptable if long strings are being
   * processed.
   *   - [1] p.2-42
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  repnz (dst, src) {
    this.cpu.prefixRepeatState = STATE_REP_NZ;
  }

  /**
   * Repeat, Repeat While Equal, Repeat While Zero, Repeat While Not Equal and
   * Repeat While Not Zero are five mnemonics for two forms of the prefix byte
   * that controls repetition of a subsequent string instruction. The different
   * mnemonics are provided to improve program clarity. The repeat prefixes do
   * not affect the flags.
   *
   * REP is used in conjunction with the MOVS (Move String) and STOS (Store
   * String) instructions and is interpreted as "repeat while not
   * end-of-string" (CX not 0). REPE and REPZ operate identically and are
   * physically the same prefix byte as REP. These instructions are used with
   * the CMPS (Compare String) and SCAS (Scan String) instructions and require
   * ZF (posted by these instructions) to be set before initiating the next
   * repetition. REPNE and REPNZ are two mnemonics for the same prefix byte.
   * These instructions function the same as REPE and REPZ except that the zero
   * flag must be cleared or the repetition is terminated. Note that ZF does
   * not need to be initialized before executing the repeated string
   * instruction.
   *
   * Repeated string sequences are interruptable; the processor will recognize
   * the interrupt before pro- cessing the next string element. System
   * interrupt processing is not affected in any way. Upon return from the
   * interrupt, the repeated operation is resumed from the point of
   * interruption. Note, however, that execution does not resume properly if a
   * second or third prefix (i.e., segment override or LOCK) has been
   * specified in addition to any of the repeat prefixes. The processor
   * "remembers" only one prefix in effect at the time of the interrupt, the
   * prefix that immediately precedes the string instruction. After returning
   * from the interrupt, processing resumes at this point, but any additional
   * prefixes specified are not in effect. If more than one prefix must be used
   * with a string instruction, interrupts may be disabled for the duration of
   * the repeated execution. However, this will not prevent a non-maskable
   * interrupt from being recognized. Also, the time that the system is unable
   * to respond to interrupts may be unacceptable if long strings are being
   * processed.
   *   - [1] p.2-42
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  repz (dst, src) {
    // Get the next opcode
    let nextOpCode = this.cpu.mem8[segIP(this.cpu) + 1];
    if (REP_INSTS.includes(nextOpCode)) {
      this.cpu.prefixRepeatState = STATE_REP;
    }
    else {
      this.cpu.prefixRepeatState = STATE_REP_Z;
    }
  }

  /**
   * RET (Return) transfers control from a procedure back to the instruction
   * following the CALL that activated the procedure. RET pops the word at the
   * top of the stack (pointed to by register SP) into the instruction pointer
   * and increments SP by two. If an optional pop value has been specified, RET
   * adds that value to SP. This feature may be used to discard parameters
   * pushed onto the stack before the execution of the CALL instruction.
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  ret (dst, src) {
    switch (this.cpu.opcode.opcode_byte) {
      case 0xC2:
        // RET Iw
        let segment = this.cpu.reg16[this.cpu.addrSeg];
        let dstAddr = dst(segment);
        this.cpu.reg16[regIP] = this.pop16() + dst(segment, dstAddr);
        break;
      case 0xC3:
        // RET
        this.cpu.reg16[regIP] = this.pop16();
        break;
    }

    // HACK! ... or is it?
    // The way the cycle code is structured we will end up with the IP being
    // incremented by the instruction base size if we don't reset it.
    this.cpu.instIPInc = 0;
  }

  /**
   * RET (Return) transfers control from a procedure back to the instruction
   * following the CALL that activated the procedure. RETF pops the word at the
   * top of the stack (pointed to by register SP) into the instruction pointer
   * and increments SP by two. Then the word at the new top of stack is popped
   * into the CS register, and SP is again incremented by two. If an optional
   * pop value has been specified, RET adds that value to SP. This feature may
   * be used to discard parameters pushed onto the stack before the execution
   * of the CALL instruction.
   *   - [1] p.2-45
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  retf (dst, src) {
    switch (this.cpu.opcode.opcode_byte) {
      case 0xCA:
        // RETF Iw
        let segment = this.cpu.reg16[this.cpu.addrSeg];
        let dstAddr = dst(segment);

        this.cpu.reg16[regIP] = this.pop16() + dst(segment, dstAddr);
        this.cpu.reg16[regCS] = this.pop16();
        break;
      case 0xCB:
        // RETF
        this.cpu.reg16[regIP] = this.pop16();
        this.cpu.reg16[regCS] = this.pop16();
        break;
    }
  }

  /**
   * ROL (Rotate Left) rotates the destination byte or word left by the number
   * of bits specified in the count operand.
   *   - [1] p.2-39
   *
   * The OF flag is defined only for the 1-bit rotates; it is undefined in all
   * other cases (except RCL and RCR instructions only: a zero-bit rotate does
   * nothing, that is affects no flags). For left rotates, the OF flag is set
   * to the exclusive OR of the CF bit (after the rotate) and the
   * most-significant bit of the result. For right rotates, the OF flag is set
   * to the exclusive OR of the two most-significant bits of the result.
   *   - [4] p.4-519
   *
   * Modifies flags: CF, OF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  rol (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;
    let cf, of;

    for (let shift = 1; shift <= srcVal; shift++) {
      if (dstVal & (size === b ? 0x80 : 0x8000)) cf = 1;
      else cf = 0;

      dstVal = dstVal << 1;
      dstVal = dstVal | cf;
    }

    if (srcVal === 1) {
      of = cf ^ ( (dstVal >> (size === b ? 7 : 15)) & 1);
    } else of = 0;

    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    if ( of === 1 ) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }

    dstVal = dstVal & (size === b ? 0xFF : 0xFFFF);
    dst(segment, dstAddr, dstVal);
  }

  /**
   * ROR (Rotate Right) operates similar to ROL except that the bits in the
   * destination byte or word are rotated right instead of left.
   *   - [1] p.2-40
   *
   * The OF flag is defined only for the 1-bit rotates; it is undefined in all
   * other cases (except RCL and RCR instructions only: a zero-bit rotate does
   * nothing, that is affects no flags). For left rotates, the OF flag is set
   * to the exclusive OR of the CF bit (after the rotate) and the
   * most-significant bit of the result. For right rotates, the OF flag is set
   * to the exclusive OR of the two most-significant bits of the result.
   *   - [4] p.4-519
   *
   * Modifies flags: CF, OF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  ror (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;
    let cf, of;

    for (let shift = 1; shift <= srcVal; shift++) {
      cf = dstVal & 1;
      dstVal = (dstVal >> 1) | (cf << (size === b ? 7 : 15));
    }

    if (srcVal === 1) {
      of = (dstVal >> (size === b ? 7 : 15)) ^ ( (dstVal >> (size === b ? 6 : 14)) & 1);
    }

    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    if ( of === 1 ) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }

    dstVal = dstVal & (size === b ? 0xFF : 0xFFFF);
    dst(segment, dstAddr, dstVal);
  }

  /**
   * SAHF (store register AH into flags) transfers bits 7,6,4,2 and 0 from
   * register AH into SF, ZF, AF, PF and CF, respectively, replacing whatever
   * values these flags previously had. OF, DF, IF and TF are not affected.
   * This instruction is provided for 8080/8085 compatibility.
   *   - [1] p.2-33
   *
   * Modifies flags: ?
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  sahf (dst, src) {
    this.cpu.reg16[regFlags] |= (this.cpu.reg8[regAH] & 0b11010111);
  }

  /**
   * SAR (Shift Arithmetic Right) shifts the bits in the destination operand
   * (byte or word) to the right by the number of bits specified in the count
   * operand. Bits equal to the original high-order (sign) bit are shifted in
   * on the left, preserving the sign of the original value. Note that SAR does
   * not produce the same result as the dividend of an "equivalent" IDIV
   * instruction if the destination operand is negative and I-bits are shifted
   * out. For example, shifting -5 right by one bit yields -3, while integer
   * division of -5 by 2 yields -2. The difference in the instructions is that
   * IDIV truncates all numbers toward zero, while SAR truncates positive
   * numbers toward zero and negative numbers toward negative infinity.
   *   - [1] p.2-39
   *
   * Modifies flags: CF, OF, PF, ZF, SF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  sar (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;
    let cf = 0, msb;

    for (let shift = 1; shift <= srcVal; shift++) {
      msb = dstVal & (size === b ? 0x80 : 0x8000);
      cf = dstVal & 1;
      dstVal = (dstVal >> 1) | msb;
    }

    // Operand always keeps sign so clear OF
    this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;

    // Set CF if a '1' shifted out
    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    this.setPF_FLAG(dstVal);
    this.setZF_FLAG(dstVal);
    this.setSF_FLAG(dstVal);

    dstVal = dstVal & (size === b ? 0xFF : 0xFFFF);
    dst(segment, dstAddr, dstVal);
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
   */
  sbb (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal - srcVal - (this.cpu.reg16[regFlags] & FLAG_CF_MASK);
    result = this.correctSubtraction(result);

    this.flagSub(dstVal, srcVal, result);

    dst(segment, dstAddr, result);
  }

  /**
   * SCAS (Scan String) subtracts the destination string element (byte or word)
   * addressed by DI from the content of AL (byte string) or AX (word string)
   * and updates the flags, but does not alter the destination string or the
   * accumulator. SCAS also updates DI to point to the next string element and
   * AF, CF, OF, PF, SF and ZF to reflect the relationship of the scan value in
   * AL/AX to the string element. If SCAS is prefixed with REPE or REPZ, the
   * operation is interpreted as "scan while not end-of-string (CX not 0) and
   * string-element = scan-value (ZF = 1)." This form may be used to scan for
   * departure from a given value. If SCAS is prefixed with REPNE or REPNZ,
   * the operation is interpreted as "scan while not end-of-string (CX not 0)
   * and string-element is not equal to scan-value (ZF = 0)." This form may be
   * used to locate a value in a string.
   *   - [1] p.2-43
   *
   * Modifies flags: AF, CF, OF, PF, SF, ZF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  scasb (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let dstVal = this.cpu.mem8[addr];
    let srcVal = this.cpu.reg8[regAL];
    let result = srcVal - dstVal;

    result = this.correctSubtraction(result);

    this.flagSub(srcVal, dstVal, result);

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 1;
    }
    else {
      this.cpu.reg16[regDI] += 1;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * SCAS (Scan String) subtracts the destination string element (byte or word)
   * addressed by DI from the content of AL (byte string) or AX (word string)
   * and updates the flags, but does not alter the destination string or the
   * accumulator. SCAS also updates DI to point to the next string element and
   * AF, CF, OF, PF, SF and ZF to reflect the relationship of the scan value in
   * AL/AX to the string element. If SCAS is prefixed with REPE or REPZ, the
   * operation is interpreted as "scan while not end-of-string (CX not 0) and
   * string-element = scan-value (ZF = 1)." This form may be used to scan for
   * departure from a given value. If SCAS is prefixed with REPNE or REPNZ,
   * the operation is interpreted as "scan while not end-of-string (CX not 0)
   * and string-element is not equal to scan-value (ZF = 0)." This form may be
   * used to locate a value in a string.
   *   - [1] p.2-43
   *
   * Modifies flags: AF, CF, OF, PF, SF, ZF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  scasw (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    let dstVal = this.cpu.mem8[addr + 1] << 8 | this.cpu.mem8[addr];
    let srcVal = this.cpu.reg16[regAX];
    let result = srcVal - dstVal;

    result = this.correctSubtraction(result);

    this.flagSub(srcVal, dstVal, result);

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 2;
    }
    else {
      this.cpu.reg16[regDI] += 2;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * SHL and SAL (Shift Logical Left and Shift Arithmetic Left) perform the
   * same operation and are physically the same instruction. The destination
   * byte or word is shifted left by the number of bits specified in the count
   * operand. Zeros are shifted in on the right. If the sign bit retains its
   * original value, then OF is cleared.
   *   - [1] p.2-39
   *
   * Modifies flags: CF, OF, PF, ZF, SF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  shl (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;
    let cf = 0;

    for (let shift = 1; shift <= srcVal; shift++) {
      if (dstVal & (size === b ? 0x80 : 0x8000)) cf = 1;
      else cf = 0;
      dstVal = (dstVal << 1) & 0xFF;
    }

    // Set CF if a '1' shifted out
    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    // Clamp the shifted value
    dstVal &= (size === b ? 0xFF : 0xFFFF);

    // Set OF if the first operand changes sign
    if ( (srcVal === 1) && (cf === (dstVal >> 7) ) ) {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }
    else {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    }

    this.setPF_FLAG(dstVal);
    this.setZF_FLAG(dstVal);
    this.setSF_FLAG(dstVal);

    dst(segment, dstAddr, dstVal);
  }

  /**
   * SHR (Shift Logical Right) shifts the bits in the destination operand (byte
   * or word) to the right by the number of bits specified in the count
   * operand. Zeros are shifted in on the left. If the sign bit retains its
   * original value, then OF is cleared.
   *   - [1] p.2-39
   *
   * Modifies flags: CF, OF, PF, ZF, SF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  shr (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);
    let size = this.cpu.opcode.addrSize;
    let cf = 0;

    // Set OF if the first operand changes sign
    if ( (srcVal === 1) && (dstVal & (size === b ? 0x80 : 0x8000)) ) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK
    }
    else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK
    }

    for (let shift = 1; shift <= srcVal; shift++) {
      cf = dstVal & 1;
      dstVal = dstVal >> 1;
    }

    // Set CF if a '1' shifted out
    if (cf === 1) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }

    this.setPF_FLAG(dstVal);
    this.setZF_FLAG(dstVal);
    this.setSF_FLAG(dstVal);

    dst(segment, dstAddr, dstVal);
  }

  ss (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * STC (Set Carry flag) sets CF to 1 and affects no other flags.
   *   - [1] p.2-47
   *
   * Modifies flags: CF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  stc (dst, src) {
    this.cpu.reg16[regFlags] |= FLAG_CF_MASK
  }

  /**
   * STD (Set Direction flag) sets DF to 1 causing the string instructions to
   * auto-decrement the SI and/or DI index registers. STD does not affect any
   * other flags.
   *   - [1] p.2-47
   *
   * Modifies flags: DF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  std (dst, src) {
    this.cpu.reg16[regFlags] |= FLAG_DF_MASK
  }

  /**
   * STI (Set Interrupt-enable flag) sets IF to 1, enabling processor
   * recognition of maskable interrupt requests appearing on the INTR line.
   * Note however, that a pending interrupt will not actually be recognized
   * until the instruction following STI has executed. STI does not affect any
   * other flags.
   *   - [1] p.2-48
   *
   * Modifies flags: IF
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  sti (dst, src) {
    this.cpu.reg16[regFlags] |= FLAG_IF_MASK
  }

  /**
   * STOS (Store String) transfers a byte or word from register AL or AX to the
   * string element addressed by DI and updates DI to point to the next
   * location in the string. As a repeated operation, STOS provides a
   * convenient way to initialize a string to a constant value (e.g., to blank
   * out a print line).
   *   - [1] p.2-43
   *
   * Store AL at address ES:(E)DI
   *   - [3] p.3-668
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  stosb (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    this.cpu.mem8[addr] = this.cpu.reg8[regAL];

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 1;
    }
    else {
      this.cpu.reg16[regDI] += 1;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
  }

  /**
   * STOS (Store String) transfers a byte or word from register AL or AX to the
   * string element addressed by DI and updates DI to point to the next
   * location in the string. As a repeated operation, STOS provides a
   * convenient way to initialize a string to a constant value (e.g., to blank
   * out a print line).
   *   - [1] p.2-43
   *
   * Store AX at address ES:(E)DI
   *   - [3] p.3-668
   *
   * Modifies flags: NONE
   *
   * @param {Function} dst NOT USED
   * @param {Function} src NOT USED
   */
  stosw (dst, src) {
    let addr = seg2abs(this.cpu.reg16[regES], this.cpu.reg16[regDI]);
    this.cpu.mem8[addr] = (this.cpu.reg16[regAX] & 0x00FF);
    this.cpu.mem8[addr + 1] = (this.cpu.reg16[regAX] >> 8);

    if ((this.cpu.reg16[regFlags] & FLAG_DF_MASK) > 0) {
      this.cpu.reg16[regDI] -= 2;
    }
    else {
      this.cpu.reg16[regDI] += 2;
    }

    if (this.cpu.prefixRepeatState !== STATE_REP_NONE) {
      this.cpu.reg16[regCX] -= 1;
    }
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
   */
  sub (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal - srcVal;
    result = this.correctSubtraction(result);

    this.flagSub(dstVal, srcVal, result);

    dst(segment, dstAddr, result);
  }

  /**
   * TEST performs the logical "and" of the two operands (byte or word),
   * updates the flags, but does not return the result, i.e., neither operand
   * is changed. If a TEST instruction is followed by a JNZ (jump if not zero)
   * instruction, the jump will be taken if there are any corresponding I-bits
   * in both operands.
   *   - [1] p.2-39
   *
   * Modifies flags: PF, SF, ZF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  test (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal & srcVal;
    this.setPF_FLAG(result);
    this.setSF_FLAG(result);
    this.setZF_FLAG(result);
  }

  wait (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * XCHG (exchange) switches the contents of the source and destination (byte
   * or word) operands. When used in conjunction with the LOCK prefix, XCHG
   * can test and set a semaphore that controls access to a resource shared by
   * multiple processors (see section 2.5).
   *   - [1] p.2-36
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  xchg (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    src(segment, srcAddr, dstVal);
    dst(segment, dstAddr, srcVal);
  }

  /**
   * XLAT (translate) replaces a byte in the AL register with a byte from a
   * 256-byte, user-coded translation table. Register BX is assumed to point to
   * the beginning of the table. The byte in AL is used as an index into the
   * table and is replaced by the byte at the offset in the table corresponding
   * to AL's binary value. The first byte in the table has an offset of O. For
   * example, if AL contains 5H, and the sixth element of the translation table
   * contains 33H, then AL will contain 33H following the instruction. XLAT is
   * useful for translating characters from one code to another, the classic
   * example being ASCII to EBCDIC or the reverse.
   *   - [1] p.2-32
   *
   * Modifies flags: ?
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  xlat (dst, src) {
    throw new FeatureNotImplementedException("Operation not implemented");
  }

  /**
   * XOR (Exclusive Or) performs the logical "exclusive or" of the two operands
   * and returns the result to the destination operand. A bit in the result is
   * set if the corresponding bits of the original operands contain opposite
   * values (one is set, the other is cleared); otherwise the result bit is
   * cleared.
   *   - [1] p.2-38
   *
   * Modifies flags: PF, SF, ZF
   *
   * @param {Function} dst Destination addressing function
   * @param {Function} src Source addressing function
   */
  xor (dst, src) {
    let segment = this.cpu.reg16[this.cpu.addrSeg];
    let dstAddr = dst(segment);
    let srcAddr = src(segment);
    let dstVal = dst(segment, dstAddr);
    let srcVal = src(segment, srcAddr);

    let result = dstVal ^ srcVal;
    this.setPF_FLAG(result);
    this.setSF_FLAG(result);
    this.setZF_FLAG(result);
    dst(segment, dstAddr, result);
  }

  notimp () {
    console.log("Operations - Instruction not implemented")
  };

  /**
   * Push a value onto the stack. SP is decremented by two and the value is
   * stored at regSS:regSP
   *
   * SP is decremented first
   *   - [4] 4-508
   *
   * @param {number} value Word value to push onto the stack
   */
  push16 (value) {
    this.cpu.reg16[regSP] -= 2;

    this.cpu.mem8[seg2abs(this.cpu.reg16[regSS], this.cpu.reg16[regSP]    )] = (value & 0x00FF);
    this.cpu.mem8[seg2abs(this.cpu.reg16[regSS], this.cpu.reg16[regSP] + 1)] = (value >> 8);
  }

  /**
   * Pop a value off the stack. SP is incremented by two and the value at
   * regSS:regSP is returned.
   *
   * @return {number} Word value popped off the stack
   */
  pop16 () {
    let value = this.cpu.mem8[seg2abs(this.cpu.reg16[regSS], this.cpu.reg16[regSP] + 1)] << 8 |
                this.cpu.mem8[seg2abs(this.cpu.reg16[regSS], this.cpu.reg16[regSP]    )];

    this.cpu.reg16[regSP] += 2;

    return value;
  }

  /**
   * Correct for non-binary subtraction. To make things simple we subtract
   * regular integers using the built-in javascript "-" opererator. This does
   * not result in a twos-complement result. This method converts a negative
   * number to twos-complement and clamps any over/underflow.
   *
   * @param {number} result The result to correct
   * @return {number} Corrected result
   */
  correctSubtraction (result) {
    let size = this.cpu.opcode.addrSize;
    if (result < 0) {
      result = result + 1 + (size === b ? 0xFF : 0xFFFF);
    }
    return result & (size === b ? 0xFF : 0xFFFF);
  }

  /**
   * Correct for addition overflow.
   *
   * @param {number} result The result to correct
   * @return {number} Corrected result
   */
  correctAddition (result) {
    let size = this.cpu.opcode.addrSize;
    return result & (size === b ? 0xFF : 0xFFFF);
  }

  /**
   * PF (parity flag): If the low-order eight bits of an arithmetic or logical
   * result contain an even number of 1-bits, then the parity flag is set;
   * otherwise it is cleared. PF is provided for 8080/8085 compatibility; it
   * also can be used to check ASCII characters for correct parity.
   *   - [1] p.2-35
   *
   * @param {number} result Result of the operation to set the flag for
   */
  setPF_FLAG (result) {
    if (PARITY[(result & 0x00FF)] === 1) this.cpu.reg16[regFlags] |= FLAG_PF_MASK;
    else this.cpu.reg16[regFlags] &= ~FLAG_PF_MASK;
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
   * CF (carry flag): If an addition results in a carry out of the high-order
   * bit of the result, then CF is set; otherwise CF is cleared. If a
   * subtraction results in a borrow into the highorder bit of the result, then
   * CF is set; otherwise CF is cleared. Note that a signed carry is indicated
   * by CF *" OF. CF can be used to detect an unsigned overflow. Two
   * instructions, ADC (add with carry) and SBB (subtract with borrow),
   * incorporate the carry flag in their operations and can be used to perform
   * multibyte (e.g., 32-bit, 64-bit) addition and subtraction.
   *   - [1] p.2-35
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Result of the operation to set the flag for
   * @param {boolean} sub Is the operation subtraction? Otherwise it's addition.
   */
  setCF_FLAG (v1, v2, result, sub=false) {
    let size = this.cpu.opcode.addrSize;

    if ((sub && v1 < v2) || (result & (size === b ? 0xFF00 : 0xFFFF0000))) {
      this.cpu.reg16[regFlags] |= FLAG_CF_MASK
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_CF_MASK
    }
  }

  /**
   * AF (auxiliary carry flag): If an addition results in a carry out of the
   * low-order halfbyte of the result, then AF is set; otherwise AF is cleared.
   * If a subtraction results in a borrow into the low-order half-byte of the
   * result, then AF is set; otherwise AF is cleared. The auxiliary carry flag
   * is provided for the decimal adjust instructions and ordinarily is not used
   * for any other purpose.
   *   - [1] p.2-35
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Addition result
   */
  setAF_Flag (v1, v2, result) {
    if ( (v1 ^ v2 ^ result) & 0x10) {
      this.cpu.reg16[regFlags] |= FLAG_AF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_AF_MASK;
    }
  }

  /**
   * OF (overflow flag): If the result of an operation is too large a
   * positive number, or too small a negative number to fit in the
   * destination operand (excluding the sign bit), then OF is set; otherwise
   * OF is cleared. OF thus indicates signed arithmetic overflow; it can be
   * tested with a conditional jump or the INTO (interrupt on overflow)
   * instruction. OF may be ignored when performing unsigned arithmetic.
   *   - [1] p.2-35
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Addition result
   */
  setOF_FLAG_sub (v1, v2, result) {
    let size = this.cpu.opcode.addrSize;
    if ( (result ^ v1) & (v1 ^ v2) & (size === b ? 0x80 : 0x8000)) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }
  }

  /**
   * OF (overflow flag): If the result of an operation is too large a
   * positive number, or too small a negative number to fit in the
   * destination operand (excluding the sign bit), then OF is set; otherwise
   * OF is cleared. OF thus indicates signed arithmetic overflow; it can be
   * tested with a conditional jump or the INTO (interrupt on overflow)
   * instruction. OF may be ignored when performing unsigned arithmetic.
   *   - [1] p.2-35
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Addition result
   */
  setOF_FLAG_add (v1, v2, result) {
    let size = this.cpu.opcode.addrSize;
    if ( (result ^ v1) & (result ^ v2) & (size === b ? 0x80 : 0x8000)) {
      this.cpu.reg16[regFlags] |= FLAG_OF_MASK;
    } else {
      this.cpu.reg16[regFlags] &= ~FLAG_OF_MASK;
    }
  }

  /**
   * Set flags for addition operations such as ADD, INC, ADC, and so forth.
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Addition result
   */
  flagAdd (v1, v2, result) {
    let size = this.cpu.opcode.addrSize;
    let clampedResult = result & (size === b ? 0xFF : 0xFFFF);
    this.setCF_FLAG(v1, v2, result);
    this.setPF_FLAG(clampedResult);
    this.setAF_Flag(v1, v2, result);
    this.setZF_FLAG(clampedResult);
    this.setSF_FLAG(clampedResult);
    this.setOF_FLAG_add(v1, v2, result);
  }

  /**
   * Set flags for subtraction operations such as SUB, DEC, SBB, and so forth.
   *
   * @param {number} v1 Destination operand
   * @param {number} v2 Source operand
   * @param {number} result Subtraction result
   */
  flagSub (v1, v2, result) {
    this.setCF_FLAG(v1, v2, result, true);
    this.setPF_FLAG(result);
    this.setAF_Flag(v1, v2, result);
    this.setZF_FLAG(result);
    this.setSF_FLAG(result);
    this.setOF_FLAG_sub(v1, v2, result);
  }
}
