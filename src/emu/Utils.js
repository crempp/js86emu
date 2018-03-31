import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from './Constants';
import { hexString16, hexString32 } from "./Debug";

/**
 * Convert a segmented (seg:offset) memory address into an absolute address.
 *
 * https://en.wikibooks.org/wiki/X86_Assembly/16_32_and_64_Bits#Example
 *
 * @param {number} segment Segment register
 * @param {number} offset Offset amount from segment
 * @param {Cpu} cpu Cpu instance to perform conversion for
 * @return {number} Absolute memory address
 */
export function seg2abs (segment, offset, cpu) {
  // Handle segment overrides
  if      (cpu.CS_OVERRIDE) segment = cpu.reg16[regCS];
  else if (cpu.DS_OVERRIDE) segment = cpu.reg16[regDS];
  else if (cpu.ES_OVERRIDE) segment = cpu.reg16[regES];
  else if (cpu.SS_OVERRIDE) segment = cpu.reg16[regSS];

  return (segment * 0x10) + offset;
}

/**
 * Calculate the absolute memory address of the instruction pointer.
 *
 * Note: The IP always uses the CS register for the segment (verify and
 * source this).
 *
 * @param {Cpu} cpu Cpu instance to perform conversion for
 * @returns {number} Absolute memory address
 */
export function segIP(cpu) {
  return (cpu.reg16[regCS] * 0x10) + cpu.reg16[regIP];
}

/**
 * Convert a one-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} number 8bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2Int8 (number) {
  let negative = ((number >> 7) === 1);
  return negative ? (-1 * (number >> 7)) * ((number ^ 0xFF) + 1) : number;
}

/**
 * Convert a two-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} number 16bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2Int16 (number) {
  let negative = ((number >> 15) === 1);
  return negative ? (-1 * (number >> 15)) * ((number ^ 0xFFFF) + 1) : number;
}
