import { PNG } from 'pngjs';
import fs from 'fs';
import { regIP, regCS } from '../Constants';

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
 * @param {number} value 8bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2Int8 (value) {
  let negative = ((value >> 7) === 1);
  return negative ? (-1 * (value >> 7)) * ((value ^ 0xFF) + 1) : value;
}

/**
 * Convert a two-byte twos complement number to a signed integer.
 *
 * Note: It seems Javascript does not do ~ (bitwise not) correctly so we have
 * to hack it together.
 *
 * @param {number} value 16bit twos complement number to convert signed integer
 * @return {number} Signed integer conversion
 */
export function twosComplement2Int16 (value) {
  let negative = ((value >> 15) === 1);
  return negative ? (-1 * (value >> 15)) * ((value ^ 0xFFFF) + 1) : value;
}

/**
 * Extends a twos complement byte value to a twos complement word value
 *
 * @param {number} value The twos complement byte value to sign extend
 * @return {number} Extended twos complement word value
 */
export function signExtend(value) {
  if ( value <= 0xFF && 1 === ((value & 0x80) >> 7)) {
    return 0xFF00 | value;
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
      if (fileError) throw fileError;
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
    fs.readFile(path, (e, data) => {
      if (e) throw e;
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
    BrowserFS.configure(config, (e) => {
      if (e) throw e;
      resolve();
    });
  });
}
