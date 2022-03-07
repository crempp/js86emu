import {seg2abs, twosComplement2Int16, twosComplement2Int8} from "../utils/Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  b, w, v, STATE_SEG_NONE
} from '../Constants';
import {
  ValueOverflowException, InvalidAddressModeException
} from "../utils/Exceptions";

/**
 * Instruction addressing modes
 *
 * Addressing mode methods operate in 3 ways. If only `segment` is provided
 * (address mode) then the offset (not including segment) address of the
 * addressing mode is calculated and returned. If `segment` and `offset` is
 * provided (read mode) then the value at that address is read and returned.
 * If `segment`, `offset` and `value` are provided (write mode) then the
 * given value is written to the address offset with the segmented address
 * calculated by this method.
 */
export default class Addressing {
  constructor(cpu) {
    this.cpu = cpu;
    this.mem8 = cpu.mem8;
    this.mem16 = cpu.mem16;
  }

  /**
   * Return a number value of 1.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] NOT USED
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In read mode returns 0x01, else returns null
   */
  _1 (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // No address calculation for constants
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return 0x01;
    }
    else {
      // No writes for constants
      throw new InvalidAddressModeException("_1 addressing mode can not set values");
    }
  }

  /**
   * Return a number value of 3.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] NOT USED
   * @param {(number|null)} [value] NOT USED
   * @return {number|null} In read mode returns 0x01, else returns null
   */
  _3 (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // No address calculation for constants
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return 0x03;
    }
    else {
      // No writes for constants
      throw new InvalidAddressModeException("_1 addressing mode can not set values");
    }
  }

  /**
   * Read or write a word value from/to the AX registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  AX (segment, offset,  value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regAX];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regAX] = value & 0xFFFF
    }
  }

  /**
   * Read or write a byte value from/to the AH registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  AH (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regAH];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regAH] = value & 0xFF
    }
  }

  /**
   * Read or write a byte value from/to the AL registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  AL (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regAL];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regAL] = value & 0xFF
    }
  }

  /**
   * Read or write a word value from/to the BX registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  BX (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regBX];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regBX] = value & 0xFFFF
    }
  }

  /**
   * Read or write a byte value from/to the BH registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  BH (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regBH];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regBH] = value & 0xFF
    }
  }

  /**
   * Read or write a byte value from/to the BL registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  BL (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regBL];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regBL] = value & 0xFF
    }
  }

  /**
   * Read or write a word value from/to the CX registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  CX (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regCX];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regCX] = value & 0xFFFF
    }
  }

  /**
   * Read or write a byte value from/to the CH registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  CH (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regCH];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regCH] = value & 0xFF
    }
  }

  /**
   * Read or write a byte value from/to the CL registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  CL (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regCL];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regCL] = value & 0xFF
    }
  }

  /**
   * Read or write a word value from/to the DX registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  DX (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regDX];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regDX] = value & 0xFFFF
    }
  }

  /**
   * Read or write a byte value from/to the DH registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  DH (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regDH];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regDH] = value & 0xFF
    }
  }

  /**
   * Read or write a byte value from/to the DL registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  DL (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg8[regDL];
    }
    else {
      // Write value to registerPort
      this.cpu.reg8[regDL] = value & 0xFF
    }
  }

  /**
   * Read or write a word value from/to the SI registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  SI (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regSI];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regSI] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the DI registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  DI (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regDI];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regDI] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the BP registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  BP (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regBP];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regBP] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the SP registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  SP (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regSP];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regSP] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the CS registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  CS (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regCS];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regCS] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the DS registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  DS (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regDS];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regDS] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the ES registerPort.
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  ES (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regES];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regES] = value & 0xFFFF
    }
  }

  /**
   * Read or write a word value from/to the SS registerPort.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment NOT USED
   * @param {(number|null)} [offset] Memory offset NOT USED
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  SS (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.cpu.reg16[regSS];
    }
    else {
      // Write value to registerPort
      this.cpu.reg16[regSS] = value & 0xFFFF
    }
  }

  /**
   * Direct address. The instruction has no ModR/M byte; the address of the
   * operand is encoded in the instruction; and no base registerPort, index
   * registerPort, or scaling factor can be applied (for example, far JMP (EA))
   *
   * The operand is a 32-bit segment:offset pointer.
   *
   * For example:
   * 0x9A 0x12 0x34 0x56 0x78
   *
   * - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {number|number[]} In address mode returns the calculated address
   * of the operand, in read mode returns an array containing the
   * [segment, offset]
   */
  Ap (segment, offset, value) {
    segment = this.cpu.reg16[regCS]; // Direct address values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let ipInc = this.cpu.instIPInc + this.cpu.addrIPInc;
      let result = this.cpu.reg16[regIP] + ipInc;
      this.cpu.addrIPInc += 4;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address by getting the 32bit far address
      // (segment:offset) from the instruction argument
      let o = (this.cpu.mem8[seg2abs(segment, offset + 1)] << 8) |
               this.cpu.mem8[seg2abs(segment, offset    )];
      let s = (this.cpu.mem8[seg2abs(segment, offset + 3)] << 8) |
               this.cpu.mem8[seg2abs(segment, offset + 2)];
      return [s, o];
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Ap addressing mode can not set values");
    }
  }

  /**
   * A ModR/M byte follows the opcode and specifies the operand. The operand
   * is either a general-purpose registerPort or a memory address. If it is a
   * memory address, the address is computed from a segment registerPort and any
   * of the following values: a base registerPort, an index registerPort, a scaling
   * factor, a displacement.
   *
   * The operand is a byte, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] Value to write (byte)
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address, in write mode writes
   *   the given value to the given address
   */
  Eb (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for addressing mode");

    if (offset === undefined && value === undefined) {
      // Calculate address
      return this.calcRMAddr();
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readRMReg8(segment, offset)
    }
    else {
      // Write value to address
      this.writeRMReg8(segment, offset, value);
    }
  }

  /**
   * A ModR/M byte follows the opcode and specifies the operand. The operand
   * is either a general-purpose registerPort or a memory address. If it is a
   * memory address, the address is computed from a segment registerPort and any
   * of the following values: a base registerPort, an index registerPort, a scaling
   * factor, a displacement.
   *
   * 32-bit or 48-bit pointer, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {number|number[]} In address mode returns the calculated address
   *   of the operand, in read mode returns an array containing the
   *   [segment, offset]
   */
  Ep (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // Calculate address
      return this.calcRMAddr();
    }
    else if (value === undefined) {
      // Read value from calculated address
      let result = this.readRMReg32(segment, offset);
      let s = result & 0x0000FFFF;
      let o = (result & 0xFFFF0000) >> 16;
      return [s, o];
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Ap addressing mode can not set values");
    }
  }

  /**
   * A ModR/M byte follows the opcode and specifies the operand. The operand
   * is either a general-purpose registerPort or a memory address. If it is a
   * memory address, the address is computed from a segment registerPort and any
   * of the following values: a base registerPort, an index registerPort, a scaling
   * factor, a displacement.
   *
   * The operand is a word or doubleword, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] Value to write (word|doubleword)
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address, in write mode writes
   *   the given value to the given address
   */
  Ev (segment, offset,  value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for addressing mode");

    if (offset === undefined && value === undefined) {
      // Calculate address
      return this.calcRMAddr();
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readRMReg16(segment, offset)
    }
    else {
      // Write value to address
      this.writeRMReg16(segment, offset, value);
    }
  }

  /**
   * A ModR/M byte follows the opcode and specifies the operand. The operand
   * is either a general-purpose registerPort or a memory address. If it is a
   * memory address, the address is computed from a segment registerPort and any
   * of the following values: a base registerPort, an index registerPort, a scaling
   * factor, a displacement.
   *
   * The operand is a word, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address, in write mode writes
   *   the given value to the given address
   */
  Ew (segment, offset, value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for addressing mode");

    if (offset === undefined && value === undefined) {
      // Calculate address
      return this.calcRMAddr();
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readRMReg16(segment, offset)
    }
    else {
      // Write value to address
      this.writeRMReg16(segment, offset, value);
    }
  }

  /**
   * The reg field of the ModR/M byte selects a general registerPort (for example,
   * AX (000)).
   *
   * The operand is a byte, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment NOT USED
   * @param {(number|null)} [offset] NOT USED
   * @param {(number|null)} [value] Value to write (byte)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  Gb (segment, offset, value) {
    if (value > 0xFF) throw new ValueOverflowException("Value too large for addressing mode");

    // Calculate address
    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readRegVal(false, b);
    }
    else {
      // Write value to address
      this.writeRegVal(value & 0xFF, false, b);
    }
  }

  /**
   * The reg field of the ModR/M byte selects a general registerPort (for example,
   * AX (000)).
   *
   * The operand is a word or doubleword, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment NOT USED
   * @param {(number|null)} [offset] NOT USED
   * @param {(number|null)} [value] Value to write (word|doubleword)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  Gv (segment, offset,  value) {
    if (value > 0xFFFF) throw new ValueOverflowException("Value too large for registerPort");

    // Calculate address
    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readRegVal(false, v);
    }
    else {
      // Write value to address
      this.writeRegVal(value & 0xFFFF, false, v);
    }
  }

  /**
   * Immediate data. The operand value is encoded in subsequent bytes of the
   * instruction.
   *
   * The operand is a byte, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address
   */
  Ib (segment, offset, value) {
    segment = this.cpu.reg16[regCS]; // Imm values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let result = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 1;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readMem8(segment, offset);
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Ib addressing mode can not set values");
    }
  }

  /**
   * Immediate data. The operand value is encoded in subsequent bytes of the
   * instruction.
   *
   * The operand is a word or doubleword, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address
   */
  Iv (segment, offset,  value) {
    segment = this.cpu.reg16[regCS]; // Imm values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let result = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 2;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readMem16(segment, offset);
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Iv addressing mode can not set values");
    }
  }

  /**
   * Immediate data. The operand value is encoded in subsequent bytes of the
   * instruction.
   *
   * The operand is a word, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address
   */
  Iw (segment, offset, value) {
    segment = this.cpu.reg16[regCS]; // Imm values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let result = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 2;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readMem16(segment, offset);
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Iw addressing mode can not set values");
    }
  }

  /**
   * The instruction contains a relative offset to be added to the instruction
   * pointer registerPort (for example, JMP (0E9), LOOP).
   *
   * The operand is a word, regardless of operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment NOT USED
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address
   */
  Jb (segment, offset, value) {
    segment = this.cpu.reg16[regCS]; // Imm values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let result = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 1;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address
      let result = this.readMem8(segment, offset);
      return this.cpu.reg16[regIP] + twosComplement2Int8(result);
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Jb addressing mode can not set values");
    }
  }

  /**
   * The instruction contains a relative offset to be added to the instruction
   * pointer registerPort (for example, JMP (0E9), LOOP).
   *
   * The operand is a word or doubleword, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address
   */
  Jv (segment, offset, value) {
    segment = this.cpu.reg16[regCS]; // Imm values are in the CS segment

    if (offset === undefined && value === undefined) {
      // Calculate address
      let result = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 2;
      return result;
    }
    else if (value === undefined) {
      // Read value from calculated address
      let result = this.readMem16(segment, offset);
      return this.cpu.reg16[regIP] + twosComplement2Int16(result);
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Jv addressing mode can not set values");
    }
  }

  /**
   * The ModR/M byte may refer only to memory (for example, BOUND, LES, LDS,
   * LSS, LFS, LGS, CMPXCHG8B).
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {(number|null)} In address mode returns the calculated address
   */
  M (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // Calculate address
      let addr;
      switch (this.cpu.opcode.mod) {
        case 0b00: // Use R/M Table 1 for R/M operand
          addr = this.calcRMAddr(segment);
          break;
        case 0b01: // Use R/M Table 2 with 8-bit displacement
        case 0b10: // Use R/M Table 2 with 16-bit displacement
          addr = this.calcRMAddrDisp(segment);
          break;
      }
      return addr;
    }
    else if (value === undefined) {
      // Read value from calculated address
      // Since the value *is* the offset return that. We can't do the address
      // calculation here and return null in the address mode because the
      // addrIPInc must be calculated in the address mode of this method.
      return offset
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("M addressing mode can not set values");
    }
  }

  /**
   * The ModR/M byte may refer only to memory (for example, BOUND, LES, LDS,
   * LSS, LFS, LGS, CMPXCHG8B).
   *
   * 32-bit or 48-bit pointer, depending on operand-size attribute.
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] NOT USED
   * @return {number[]|null} In address mode returns the calculated address as
   *   an array containing the [segment, offset]
   */
  Mp (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // Calculate address
      let addr;
      switch (this.cpu.opcode.mod) {
        case 0b00: // Use R/M Table 1 for R/M operand
          addr = this.calcRMAddr(segment);
          break;
        case 0b01: // Use R/M Table 2 with 8-bit displacement
        case 0b10: // Use R/M Table 2 with 16-bit displacement
          addr = this.calcRMAddrDisp(segment);
          break;
      }
      return addr;
    }
    else if (value === undefined) {
      // Read value from calculated address
      let o = this.readMem16(segment, offset);
      let s = this.readMem16(segment, offset + 2);

      return [s, o];
    }
    else {
      // Write value to address
      throw new InvalidAddressModeException("Mp addressing mode can not set values");
    }
  }

  /**
   * The instruction has no ModR/M byte; the offset of the operand is coded as
   * a word or double word (depending on address size attribute) in the
   * instruction. No base registerPort, index registerPort, or scaling factor can be
   * applied (for example, MOV (A0–A3)).
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] Value to write (byte)
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address, in write mode writes
   *   the given value to the given address
   */
  Ob (segment, offset, value) {


    if (offset === undefined && value === undefined) {
      // Calculate address
      let operandSeg = this.cpu.reg16[regCS]; // Imm values are in the CS segment
      let operandAddr = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      this.cpu.addrIPInc += 2;
      return this.readMem16(operandSeg, operandAddr);
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readMem8(segment, offset);
    }
    else {
      // Write value to address
      this.writeMem8(segment, offset, value);
    }
  }

  /**
   * The instruction has no ModR/M byte; the offset of the operand is coded as
   * a word or double word (depending on address size attribute) in the
   * instruction. No base registerPort, index registerPort, or scaling factor can be
   * applied (for example, MOV (A0–A3)).
   *   - [3] p. A-1 to A-3
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {(number|null)} [value] Value to write (word)
   * @return {(number|null)} In address mode returns the calculated address, in
   *   read mode returns the value at the given address, in write mode writes
   *   the given value to the given address
   */
  Ov (segment, offset, value) {
    if (offset === undefined && value === undefined) {
      // Calculate address
      let operandSeg = this.cpu.reg16[regCS]; // Imm values are in the CS segment
      let operandAddr = this.cpu.reg16[regIP] + this.cpu.instIPInc + this.cpu.addrIPInc;
      let operand = this.readMem16(operandSeg, operandAddr);
      this.cpu.addrIPInc += 2;
      return operand;
    }
    else if (value === undefined) {
      // Read value from calculated address
      return this.readMem16(segment, offset);
    }
    else {
      // Write value to address
      this.writeMem16(segment, offset, value);
    }
  }

  /**
   * The reg field of the ModR/M byte selects a segment registerPort (for example,
   * MOV (8C,8E)).
   *   - [3] p. A-1 to A-3
   *
   * When an instruction operates on a segment registerPort, the reg field in the
   * ModR/M byte is called the sreg field and is used to specify the segment
   * registerPort. Table B-6 shows the encoding of the sreg field. This field is
   * sometimes a 2-bit field (sreg2) and other times a 3-bit field (sreg3).
   *   - [3] p. B-4
   *
   * @param {number} segment NOT USED
   * @param {(number|null)} [offset] NOT USED
   * @param {(number|null)} [value] Value to write (word|doubleword)
   * @return {(number|null)} In address mode returns null, in read mode returns
   *   the value from the registerPort, in write mode does not return a value
   */
  Sw (segment, offset, value) {
    // Calculate address
    if (offset === undefined && value === undefined) {
      // No address calculation for registers
      return null;
    }
    else if (value === undefined) {
      // Read value from calculated address
      switch (this.cpu.opcode.reg) {
        case 0b000:
          return this.cpu.reg16[regES];
        case 0b001:
          return this.cpu.reg16[regCS];
        case 0b010:
          return this.cpu.reg16[regSS];
        case 0b011:
          return this.cpu.reg16[regDS];
      }
    }
    else {
      // Write value to address
      switch (this.cpu.opcode.reg) {
        case 0b000:
          this.cpu.reg16[regES] = value;
          break;
        case 0b001:
          this.cpu.reg16[regCS] = value;
          break;
        case 0b010:
          this.cpu.reg16[regSS] = value;
          break;
        case 0b011:
          this.cpu.reg16[regDS] = value;
          break;
      }
    }
  }

  /**
   * Read a byte from memory or a registerPort as specified by the addressing
   * mode determined by the mod, reg and r/m values.
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   */
  readRMReg8 (segment, offset) {
    if (this.cpu.opcode.mod === 0b11) {
      // Two registerPort instruction; use REG table
      return this.readRegVal(true, b);
    }
    else {
      // Use R/M Table 1 or 2 for R/M operand
      // let offset = this.calcRMAddr(segment);
      return this.readMem8(segment, offset);
    }
  }

  /**
   * Read a word from memory or a registerPort as specified by the addressing
   * mode determined by the mod, reg and r/m values.
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   */
  readRMReg16 (segment, offset) {
    if (this.cpu.opcode.mod === 0b11) {
      // Two registerPort instruction; use REG table
      return this.readRegVal(true, w);
    }
    else {
      // Use R/M Table 1 or 2 for R/M operand
      // let offset = this.calcRMAddr(segment);
      return this.readMem16(segment, offset);
    }
  }

  /**
   * Read a double word from memory or a registerPort as specified by the
   * addressing mode determined by the mod, reg and r/m values.
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   */
  readRMReg32 (segment, offset) {
    if (this.cpu.opcode.mod === 0b11) {
      // Two registerPort instruction; use REG table
      // TODO: Is this codepath ever hit? Because I don't think it'll work
      return this.readRegVal(true);
    }
    else {
      // Use R/M Table 1 or 2 for R/M operand
      // let offset = this.calcRMAddr(segment);
      return this.readMem32(segment, offset);
    }
  }

  /**
   * Write a byte to memory or a registerPort as specified by the addressing
   * mode determined by the mod, reg and r/m values.
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {number} value Value to write to memory (byte)
   */
  writeRMReg8(segment, offset, value) {
    if (this.cpu.opcode.mod === 0b11) {
      // Two registerPort instruction; use REG table
      this.writeRegVal(value, true, b);
    }
    else {
      // Use R/M Table 1 or 2 for R/M operand
      // let offset = this.calcRMAddr(segment);
      this.writeMem8(segment, offset, value);
    }
  }

  /**
   * Write a word to memory or a registerPort as specified by the addressing
   * mode determined by the mod, reg and r/m values.
   *
   * @param {number} segment Memory segment
   * @param {(number|null)} [offset] Memory offset
   * @param {number} value Value to write to memory (word)
   */
  writeRMReg16(segment, offset, value) {
    if (this.cpu.opcode.mod === 0b11) {
      // Two registerPort instruction; use REG table
      this.writeRegVal(value, true, w);
    }
    else {
      // Use R/M Table 1 or 2 for R/M operand
      // let offset = this.calcRMAddr(segment);
      this.writeMem16(segment, offset, value);
    }
  }

  /**
   * Calculate an offset address in RM addressing mode
   *
   * @param {number} [segment] Memory segment
   * @return {number|null} Calculated address
   */
  calcRMAddr (segment) {
    let offset;
    switch (this.cpu.opcode.mod) {
      case 0b00: // Use R/M Table 1 for R/M operand
        offset = this.calcRMAddrNoDisp(segment);
        break;
      case 0b01: // Use R/M Table 2 with 8-bit displacement
      case 0b10: // Use R/M Table 2 with 16-bit displacement
        offset = this.calcRMAddrDisp(segment);
        break;
      case 0b11:
        return null;
    }
    return offset;
  }

  /**
   * Calculate an offset address in RM addressing mode with a displacement
   *
   * I don't think there's a difference between the functionality for a byte
   * or a word for calcRMAddr. If I'm wrong come back to this.
   *
   * Note: This returns an offset, this address does not account for segment.
   * Use seg2abs() to get the segmented address.
   *
   * TODO: segment is no longer needed
   *
   * @param {number} segment Memory segment
   * @return {number} Calculated address
   */
  calcRMAddrNoDisp (segment) {
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
        if (this.cpu.prefixSegmentState === STATE_SEG_NONE) this.cpu.addrSeg = regSS;
        break;
      case 0b011 : // [BP + DI]
        addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI];
        if (this.cpu.prefixSegmentState === STATE_SEG_NONE) this.cpu.addrSeg = regSS;
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
        let ipInc = this.cpu.instIPInc + this.cpu.addrIPInc;
        addr = (this.cpu.mem8[seg2abs( this.cpu.reg16[regCS], this.cpu.reg16[regIP] + ipInc + 1)] << 8) |
                this.cpu.mem8[seg2abs( this.cpu.reg16[regCS], this.cpu.reg16[regIP] + ipInc)];
        // if (this.cpu.addrIPInc === 0) this.cpu.addrIPInc += 2;
        this.cpu.addrIPInc += 2;
        break;
      case 0b111 : // [BX]
        addr = this.cpu.reg16[regBX];
        break;
    }
    return addr;
  }

  /**
   * Calculate an offset address in RM addressing mode with a displacement word
   *
   * Note: This returns an offset, this address does not account for segment.
   * Use seg2abs() to get the segmented address.
   *
   * @param {number} segment Memory segment
   * @return {number} Calculated address
   */
  calcRMAddrDisp (segment) {
    let addr, disp;
    let ipInc = this.cpu.instIPInc + this.cpu.addrIPInc;

    switch (this.cpu.opcode.mod) {
      case 0b01: // Use R/M table 2 with 8-bit displacement
        disp = this.cpu.mem8[seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + ipInc)];
        this.cpu.addrIPInc += 1;
        break;
      case 0b10: // Use R/M table 2 with 16-bit displacement
        disp = disp ||
          ((this.cpu.mem8[seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + ipInc + 1)] << 8) |
            this.cpu.mem8[seg2abs(this.cpu.reg16[regCS], this.cpu.reg16[regIP] + ipInc    )] );
        // if (this.cpu.addrIPInc === 0) this.cpu.addrIPInc += 2;
        this.cpu.addrIPInc += 2;
    }

    switch (this.cpu.opcode.rm) {
      case 0b000 : // [BX + SI] + disp
        addr = this.cpu.reg16[regBX] + this.cpu.reg16[regSI] + disp;
        break;
      case 0b001 : // [BX + DI] + disp
        addr = this.cpu.reg16[regBX] + this.cpu.reg16[regDI] + disp;
        break;
      case 0b010 : // [BP + SI] + disp
        addr = this.cpu.reg16[regBP] + this.cpu.reg16[regSI] + disp;
        if (this.cpu.prefixSegmentState === STATE_SEG_NONE) this.cpu.addrSeg = regSS;
        break;
      case 0b011 : // [BP + DI] + disp
        addr = this.cpu.reg16[regBP] + this.cpu.reg16[regDI] + disp;
        if (this.cpu.prefixSegmentState === STATE_SEG_NONE) this.cpu.addrSeg = regSS;
        break;
      case 0b100 : // [SI] + disp
        addr = this.cpu.reg16[regSI] + disp;
        break;
      case 0b101 : // [DI] + disp
        addr = this.cpu.reg16[regDI] + disp;
        break;
      case 0b110 : // [BP] + disp
        addr = this.cpu.reg16[regBP] + disp;
        if (this.cpu.prefixSegmentState === STATE_SEG_NONE) this.cpu.addrSeg = regSS;
        break;
      case 0b111 : // [BX] + disp
        addr = this.cpu.reg16[regBX] + disp;
        break;
    }
    return addr;
  }

  /**
   * Read a byte or a word from a registerPort determined by the rm or reg value
   * and the reg lookup table.
   *
   * @param {boolean} useRM Use the RM value rather than the default REG value
   * @param {(number|null)} sizeOverride If given override the w bit for the operand size
   * @returns {number} The value of the registerPort
   */
  readRegVal (useRM = false, sizeOverride=null) {
    let rmReg = useRM ? this.cpu.opcode.rm : this.cpu.opcode.reg;
    let size;
    if (sizeOverride !== null) {
      if (sizeOverride === b) size = 0;
      else size = 1;
    }
    else {
      size = this.cpu.opcode.w;
    }
    switch (size) {
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
          case 0b010:
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

  /**
   * Write a byte or a word to a registerPort determined by the rm or reg value
   * and the reg lookup table.
   *
   * @param {number} value Value to write to the registerPort
   * @param {boolean} useRM Use the RM value rather than the default REG value
   * @param {(number|null)} sizeOverride If given override the w bit for the operand size
   */
  writeRegVal (value, useRM = false, sizeOverride=null) {
    let rmReg = useRM ? this.cpu.opcode.rm : this.cpu.opcode.reg;
    let size;
    if (sizeOverride !== null) {
      if (sizeOverride === b) size = 0;
      else size = 1;
    }
    else {
      size = this.cpu.opcode.w;
    }
    switch (size) {
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
    return this.cpu.mem8[seg2abs(segment, offset)];
  }

  /**
   * Read a word from a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @return {number} Value from memory as a word
   */
  readMem16(segment, offset) {
    return ((this.cpu.mem8[seg2abs(segment, offset + 1)] << 8) |
             this.cpu.mem8[seg2abs(segment, offset    )]);
  }

  /**
   * Read a double word from a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @return {number} Value from memory as a double word
   */
  readMem32(segment, offset) {
    return ((this.cpu.mem8[seg2abs(segment, offset + 1)] << 24) |
            (this.cpu.mem8[seg2abs(segment, offset    )] << 16) |
            (this.cpu.mem8[seg2abs(segment, offset + 3)] << 8) |
             this.cpu.mem8[seg2abs(segment, offset + 2)]);
  }

  /**
   * Write a byte to a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @param {number} value
   */
  writeMem8(segment, offset, value) {
    this.cpu.mem8[seg2abs(segment, offset)] = (value & 0x00FF);
  }

  /**
   * Write a word to a segment:offset location in memory
   *
   * @param {number} segment
   * @param {number} offset
   * @param {number} value
   */
  writeMem16(segment, offset, value) {
    this.cpu.mem8[seg2abs(segment, offset    )] = (value & 0x00FF);
    this.cpu.mem8[seg2abs(segment, offset + 1)] = (value >> 8 & 0x00FF);
  }
}
