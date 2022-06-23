import { PNG } from "pngjs";
import fs from "fs";
import {regIP, regCS, regSP, regSS} from "../Constants";

/**
 * Push a value onto the stack. SP is decremented by two and the value is
 * stored at regSS:regSP
 *
 * SP is decremented first
 *   - [4] 4-508
 *
 * @param {CPU} cpu CPU instance to use for pushing
 * @param {number} value Word value to push onto the stack
 *
 */
export function push16 (cpu, value) {
  cpu.reg16[regSP] -= 2;

  cpu.mem8[seg2abs(cpu.reg16[regSS], cpu.reg16[regSP]    )] = (value & 0x00FF);
  cpu.mem8[seg2abs(cpu.reg16[regSS], cpu.reg16[regSP] + 1)] = (value >> 8);
}

/**
 * Pop a value off the stack. SP is incremented by two and the value at
 * regSS:regSP is returned.
 *
 * @param {CPU} cpu CPU instance to use for popping
 * @return {number} Word value popped off the stack
 */
export function pop16 (cpu) {
  let value = cpu.mem8[seg2abs(cpu.reg16[regSS], cpu.reg16[regSP] + 1)] << 8 |
      cpu.mem8[seg2abs(cpu.reg16[regSS], cpu.reg16[regSP]    )];

  cpu.reg16[regSP] += 2;

  return value;
}

/**
 * Convert a segmented (seg:offset) memory address into an absolute address.
 *
 * https://en.wikibooks.org/wiki/X86_Assembly/16_32_and_64_Bits#Example
 *
 * @param {number} segment Segment registerPort
 * @param {number} offset Offset amount from segment
 * @return {number} Absolute memory address
 */
export function seg2abs (segment, offset) {
  return (segment * 0x10) + offset;
}

/**
 * Calculate the absolute memory address of the instruction pointer.
 *
 * Note: The IP always uses the CS registerPort for the segment (verify and
 * source this).
 *
 * @param {CPU} cpu Cpu instance to perform conversion for
 * @returns {number} Absolute memory address
 */
export function segIP(cpu) {
  return (cpu.reg16[regCS] * 0x10) + cpu.reg16[regIP];
}

/**
 * Check if the byte value provided is a signed value.
 *
 * @param value Byte to check for sign bit
 * @returns {boolean} True if value is signed, else false
 */
export function isByteSigned(value) {
  return (value >> 7 === 1);
}

/**
 * Check if the word value provided is a signed value.
 *
 * @param value Word to check for sign bit
 * @returns {boolean} True if value is signed, else false
 */
export function isWordSigned(value) {
  return (value >> 15 === 1);
}


/**
 * Convert a one-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} value 8-bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2IntByte (value) {
  let negative = ((value >>> 7) === 1);
  return negative ? (-1 * (value >>> 7)) * ((value ^ 0xFF) + 1) : value;
}

/**
 * Convert a two-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} value 16-bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2IntWord (value) {
  let negative = ((value >>> 15) === 1);
  return negative ? (-1 * (value >>> 15)) * ((value ^ 0xFFFF) + 1) : value;
}

/**
 * Convert a four-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} value 32-bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2IntDouble (value) {
  // Since this is a 32-bit number we can use a trick.
  return (value & 0xFFFFFFFF) >> 0;
}

/**
 * Convert an 8-bit byte negative value into it's two's complement representation.
 * Positive numbers are returned unchanged (but will be clamped to 0xFF).
 *
 * @param {number} value 8-bit value to convert to two's compliment
 * @returns {number} The two's complement representation of the negative value.
 */
export function intByte2TwosComplement (value) {
  if (value < 0) value = value + 1 + 0xFF;
  return value & 0xFF;
}

/**
 * Convert an 16-bit word negative value into it's two's complement representation.
 * Positive numbers are returned unchanged (but will be clamped to 0xFFFF).
 *
 * @param {number} value 16-bit value to convert to two's compliment
 * @returns {number} The two's complement representation of the negative value.
 */
export function intWord2TwosComplement (value) {
  if (value < 0) value = value + 1 + 0xFFFF;
  return value & 0xFFFF;
}

/**
 * Convert an 32-bit double word negative value into it's two's complement representation.
 * Positive numbers are returned unchanged (but will be clamped to 0xFFFFFFFF).
 *
 * @param {number} value 32-bit value to convert to two's compliment
 * @returns {number} The two's complement representation of the negative value.
 */
export function intDouble2TwosComplement (value) {
  // Since this is a 32-bit number we can use a trick
  return value >>> 0;
}

/**
 * Extends a twos complement byte value to a 16 bit twos complement word value
 *
 * @param {number} value The twos complement byte value to sign extend
 * @return {number} Extended twos complement word value
 */
export function signExtend16(value) {
  if ( value <= 0xFF && 1 === ((value & 0x80) >> 7)) {
    return 0xFF00 | value;
  }
  else {
    return value;
  }
}

/**
 * Extends a twos complement word value to a 32 bit twos complement double word value
 *
 * @param {number} value The twos complement byte value to sign extend
 * @return {number} Extended twos complement word value
 */
export function signExtend32(value) {
  if ( value <= 0xFFFF && 1 === ((value & 0x8000) >>> 15)) {
    return (0xFFFF0000 | value) >>> 0;
  }
  else {
    return value;
  }
}

/**
 * Load a PNG file in a way that supports async and both node and browser.
 *
 * @param {string} path Path to the file.
 * @return {Promise<any>} Promise to be fulfilled when the file is loaded.
 */
export function loadPNGAsync (path) {
  return new Promise(resolve => {
    fs.readFile(path, (fileError, data) => {
      if (fileError) {
        throw fileError;
      }
      new PNG({ filterType: -1 }).parse( data, (pngError, png) => {
        if (pngError) throw pngError;
        resolve(png);
      });
    });
  });
}

/**
 * Load a binary file in a way that supports async/await and both node and the
 * browser
 *
 * @param {string} path Path to the file.
 * @return {Promise<any>} Promise to be fulfilled when the file is loaded.
 */
export function loadBINAsync (path) {
  return new Promise(resolve => {
    fs.readFile(path, (fileError, data) => {
      if (fileError){
        throw fileError;
      }
      resolve(new Uint8Array(data));
    });
  });
}

/**
 * Promise support wrapper for BrowserFS.configure
 *
 * @param {Object} config BrowserFS config object
 * @return {Promise<any>}
 */
export function BrowserFSAsync (config) {
  return new Promise(resolve => {
    // eslint-disable-next-line no-undef
    BrowserFS.configure(config, (e) => {
      if (e) throw e;
      resolve();
    });
  });
}


/**
 * Assign any defined elements of sources to the target, overriding existing
 * values and adding missing values. The sources are processed in the order
 * provided.
 *
 * @param target
 * @param sources
 * @returns {*}
 */
export function assign (target, ...sources) {
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      const s_val = source[key];
      const t_val = target[key];
      target[key] = t_val && s_val && typeof t_val === "object" && typeof s_val === "object"
        ? assign(t_val, s_val)
        : s_val;
    });
  });
  return target;
}