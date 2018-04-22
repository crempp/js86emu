import { PNG } from 'pngjs';
// import fs from 'fs';

import {
  regIP, regCS, regDS, regES, regSS,
} from '../Constants';

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
 * Load a PNG file in a wat that supports async and both node and browser.
 * NOTE: This is no longer asynchronous. Could easily make so again.
 *
 * @param {string} path Path to the file.
 * @return {Promise<any>} Promise to be fulfilled when the file is loaded.
 */
export function loadPNGAwait (path) {
  // return new Promise(resolve => {
  //   let data = fs.readFileSync(path);
  //   let png = PNG.sync.read(data, {
  //     filterType: -1
  //   });
  //   resolve(png);
  // });
  return new Promise(resolve => {
    fetch(path).then(function(response) {
      response.arrayBuffer().then((buffer) => {

        new PNG({ filterType:-1 })
          .parse( buffer, function(error, data)
          {
            // console.log(error, data)
            resolve(data);
          });

        // let png = PNG.sync.read(buffer, {
        //   filterType: -1
        // });
        // resolve(png);
      });
    });
  });
}
