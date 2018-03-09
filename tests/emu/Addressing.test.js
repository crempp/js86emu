import winston from 'winston';

import CPU8086 from '../../src/emu/8086';
import Addressing from '../../src/emu/addressing';
import CPUConfig from '../../src/emu/CPUConfig';
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../src/emu/Constants';
import {
  formatOpcode, hexString8, hexString16, hexString32, formatFlags, formatMemory, formatRegisters
} from "../../src/emu/Debug";
import {segIP} from "../../src/emu/Utils";

winston.level = 'warn';

// TODO: writeMem8 and readMem8 - should be the same
// TODO: writeMem16 and readMem16 - should be the same

//   7   6   5   4   3   2   1   0
// +---+---+---+---+---+---+---+---+
// |     opcode            | d | w |
// +---+---+---+---+---+---+---+---+
// +---+---+---+---+---+---+---+---+
// |  mod  |    reg    |    r/m    |
// +---+---+---+---+---+---+---+---+
// console.log("opcode_byte: " + hexString16(cpu.mem8[segIP(cpu)]));
// console.log("CS:IP: " + hexString16(cpu.reg16[regCS]) + ":" + hexString16(cpu.reg16[regIP]) +  " -> " + hexString32(segIP(cpu)) + "\n" +
//   "MEMORY:\n" + formatMemory(cpu.mem8, segIP(cpu), segIP(cpu) + 7, 11) + "\n" +
//   "OPCODE:\n" + formatOpcode(cpu.opcode, 11) + "\n" +
//   "REGISTERS\n" + formatRegisters(cpu, 11)  + "\n" +
//   "FLAGS:\n" + formatFlags(cpu.reg16[regFlags], 10) + "\n" +
//   "INSTRUCTION: " +  cpu.opcode.string);
// console.log("result: " + hexString32(addr.calcRMDispAddr(segment)));
// console.log("CS:        " + hexString16(cpu.reg16[regCS]) + "\n" +
//   "CS * 0x10: " + hexString32(cpu.reg16[regCS]*0x10) + "\n" +
//   "BP:        " + hexString16(cpu.reg16[regBP]) + "\n" +
//   "DI:        " + hexString16(cpu.reg16[regDI]) + "\n" +
//   "BP + DI:   " + hexString32(cpu.reg16[regBP]+cpu.reg16[regDI]));


describe('Memory access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 262400
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regCS] = 0x0001;
    cpu.reg16[regDS] = 0x0020;
    cpu.reg16[regES] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
  });

  describe('readMem8()', () => {
    test('Memory reads correctly memory', () => {
      cpu.mem8[0x00011] = 0x12;
      expect(addr.readMem8(cpu.reg16[regCS], 0x001)).toBe(0x12);
    });

    test('Memory reads from segments are correct', () => {
      cpu.mem8[0x0010F] = 0x12;
      expect(addr.readMem8(cpu.reg16[regCS], 0x00FF)).toBe(0x12);
      cpu.mem8[0x002FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regDS], 0x00FF)).toBe(0x12);
      cpu.mem8[0x030FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regES], 0x00FF)).toBe(0x12);
      cpu.mem8[0x040FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regSS], 0x00FF)).toBe(0x12);
    });

    test('Memory read with CS segment override is correct', () => {
      cpu.CS_OVERRIDE = true;
      cpu.mem8[0x0010F] = 0x12;
      expect(addr.readMem8(cpu.reg16[regDS], 0x00FF)).toBe(0x12);
    });

    test('Memory read with DS segment override is correct', () => {
      cpu.DS_OVERRIDE = true;
      cpu.mem8[0x002FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regCS], 0x00FF)).toBe(0x12);
    });

    test('Memory read with ES segment override is correct', () => {
      cpu.ES_OVERRIDE = true;
      cpu.mem8[0x030FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regSS], 0x00FF)).toBe(0x12);
    });

    test('Memory read with SS segment override is correct', () => {
      cpu.SS_OVERRIDE = true;
      cpu.mem8[0x040FF] = 0x12;
      expect(addr.readMem8(cpu.reg16[regES], 0x00FF)).toBe(0x12);
    });
  });

  describe('readMem16()', () => {
    test('Memory reads correctly memory', () => {
      cpu.mem8[0x00011] = 0x34;
      cpu.mem8[0x00012] = 0x12;
      expect(addr.readMem16(cpu.reg16[regCS], 0x001)).toBe(0x1234);
    });

    test('Memory reads from segments are correct', () => {
      cpu.mem8[0x0010F] = 0x34;
      cpu.mem8[0x00110] = 0x12;
      expect(addr.readMem16(cpu.reg16[regCS], 0x00FF)).toBe(0x1234);
      cpu.mem8[0x002FF] = 0x34;
      cpu.mem8[0x00300] = 0x12;
      expect(addr.readMem16(cpu.reg16[regDS], 0x00FF)).toBe(0x1234);
      cpu.mem8[0x030FF] = 0x34;
      cpu.mem8[0x03100] = 0x12;
      expect(addr.readMem16(cpu.reg16[regES], 0x00FF)).toBe(0x1234);
      cpu.mem8[0x040FF] = 0x34;
      cpu.mem8[0x04100] = 0x12;
      expect(addr.readMem16(cpu.reg16[regSS], 0x00FF)).toBe(0x1234);
    });

    test('Memory read with CS segment override is correct', () => {
      cpu.CS_OVERRIDE = true;
      cpu.mem8[0x0010F] = 0x34;
      cpu.mem8[0x00110] = 0x12;
      expect(addr.readMem16(cpu.reg16[regDS], 0x00FF)).toBe(0x1234);
    });

    test('Memory read with DS segment override is correct', () => {
      cpu.DS_OVERRIDE = true;
      cpu.mem8[0x002FF] = 0x34;
      cpu.mem8[0x00300] = 0x12;
      expect(addr.readMem16(cpu.reg16[regCS], 0x00FF)).toBe(0x1234);
    });

    test('Memory read with ES segment override is correct', () => {
      cpu.ES_OVERRIDE = true;
      cpu.mem8[0x030FF] = 0x34;
      cpu.mem8[0x03100] = 0x12;
      expect(addr.readMem16(cpu.reg16[regSS], 0x00FF)).toBe(0x1234);
    });

    test('Memory read with SS segment override is correct', () => {
      cpu.SS_OVERRIDE = true;
      cpu.mem8[0x040FF] = 0x34;
      cpu.mem8[0x04100] = 0x12;
      expect(addr.readMem16(cpu.reg16[regES], 0x00FF)).toBe(0x1234);
    });
  });

  describe('writeMem8()', () => {
    test('Memory writes are reflected in memory', () => {
      addr.writeMem8(cpu.reg16[regCS], 0x001, 0x12);
      expect(cpu.mem8[0x00011]).toBe(0x12);
    });

    test('Memory writes to segments are correct', () => {
      addr.writeMem8(cpu.reg16[regCS], 0x00FF, 0x12);
      expect(cpu.mem8[0x0010F]).toBe(0x12);
      addr.writeMem8(cpu.reg16[regDS], 0x00FF, 0x12);
      expect(cpu.mem8[0x002FF]).toBe(0x12);
      addr.writeMem8(cpu.reg16[regES], 0x00FF, 0x12);
      expect(cpu.mem8[0x030FF]).toBe(0x12);
      addr.writeMem8(cpu.reg16[regSS], 0x00FF, 0x12);
      expect(cpu.mem8[0x040FF]).toBe(0x12);
    });

    test('Memory writes with CS segment override is correct', () => {
      cpu.CS_OVERRIDE = true;
      addr.writeMem8(cpu.reg16[regDS], 0x00FF, 0x12);
      expect(cpu.mem8[0x0010F]).toBe(0x12);
    });

    test('Memory writes with DS segment override is correct', () => {
      cpu.DS_OVERRIDE = true;
      addr.writeMem8(cpu.reg16[regCS], 0x00FF, 0x12);
      expect(cpu.mem8[0x002FF]).toBe(0x12);
    });

    test('Memory writes with ES segment override is correct', () => {
      cpu.ES_OVERRIDE = true;
      addr.writeMem8(cpu.reg16[regSS], 0x00FF, 0x12);
      expect(cpu.mem8[0x030FF]).toBe(0x12);
    });

    test('Memory writes with SS segment override is correct', () => {
      cpu.SS_OVERRIDE = true;
      addr.writeMem8(cpu.reg16[regES], 0x00FF, 0x12);
      expect(cpu.mem8[0x040FF]).toBe(0x12);
    });
  });

  describe('writeMem16()', () => {
    test('Memory writes are reflected in memory', () => {
      addr.writeMem16(cpu.reg16[regCS], 0x001, 0x1234);
      expect(cpu.mem8[0x00011]).toBe(0x34);
      expect(cpu.mem8[0x00012]).toBe(0x12);
    });

    test('Memory writes to segments are correct', () => {
      addr.writeMem16(cpu.reg16[regCS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x0010F]).toBe(0x34);
      expect(cpu.mem8[0x00110]).toBe(0x12);
      addr.writeMem16(cpu.reg16[regDS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x002FF]).toBe(0x34);
      expect(cpu.mem8[0x00300]).toBe(0x12);
      addr.writeMem16(cpu.reg16[regES], 0x00FF, 0x1234);
      expect(cpu.mem8[0x030FF]).toBe(0x34);
      expect(cpu.mem8[0x03100]).toBe(0x12);
      addr.writeMem16(cpu.reg16[regSS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x040FF]).toBe(0x34);
      expect(cpu.mem8[0x04100]).toBe(0x12);
    });

    test('Memory writes with CS segment override is correct', () => {
      cpu.CS_OVERRIDE = true;
      addr.writeMem16(cpu.reg16[regDS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x0010F]).toBe(0x34);
      expect(cpu.mem8[0x00110]).toBe(0x12);
    });

    test('Memory writes with DS segment override is correct', () => {
      cpu.DS_OVERRIDE = true;
      addr.writeMem16(cpu.reg16[regCS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x002FF]).toBe(0x34);
      expect(cpu.mem8[0x00300]).toBe(0x12);
    });

    test('Memory writes with ES segment override is correct', () => {
      cpu.ES_OVERRIDE = true;
      addr.writeMem16(cpu.reg16[regSS], 0x00FF, 0x1234);
      expect(cpu.mem8[0x030FF]).toBe(0x34);
      expect(cpu.mem8[0x03100]).toBe(0x12);
    });

    test('Memory writes with SS segment override is correct', () => {
      cpu.SS_OVERRIDE = true;
      addr.writeMem16(cpu.reg16[regES], 0x00FF, 0x1234);
      expect(cpu.mem8[0x040FF]).toBe(0x34);
      expect(cpu.mem8[0x04100]).toBe(0x12);
    });
  });
});

describe('Register access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
        memorySize: 1048576
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regAX] = 0x1234;
    cpu.reg16[regBX] = 0x2345;
    cpu.reg16[regCX] = 0x3456;
    cpu.reg16[regDX] = 0x4567;

    cpu.reg16[regSP] = 0x89AB;
    cpu.reg16[regBP] = 0x789A;
    cpu.reg16[regSI] = 0x5678;
    cpu.reg16[regDI] = 0x6789;

    cpu.reg16[regCS] = 0xABCD;
    cpu.reg16[regDS] = 0xBCD0;
    cpu.reg16[regES] = 0xCD01;
    cpu.reg16[regSS] = 0xD012;

    cpu.reg16[regIP] = 0x0000;
  });

  describe('readRegVal()', () => {
    test('read byte from AL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x12);
    });

    test('read byte from CL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00001000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from DL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00010000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read byte from BL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00011000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x23);
    });

    test('read byte from AH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00100000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from CH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00101000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x56);
    });

    test('read byte from DH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00110000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x67);
    });

    test('read byte from BH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read word from AX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x1234);
    });

    test('read word from CX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00001000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x3456);
    });

    test('read word from DX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00010000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x4567);
    });

    test('read word from BX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00011000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x2345);
    });

    test('read word from SP', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00100000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x89AB);
    });

    test('read word from BP', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00101000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x789A);
    });

    test('read word from SI', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00110000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x5678);
    });

    test('read word from DI', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x6789);
    });

    test('read byte from AL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111000; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x12);
    });

    test('read byte from CL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111001; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from DL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111010; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read byte from BL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111011; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x23);
    });

    test('read byte from AH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111100; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from CH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111101; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x56);
    });

    test('read byte from DH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111110; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x67);
    });

    test('read byte from BH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read word from AX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111000; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x1234);
    });

    test('read word from CX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111001; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x3456);
    });

    test('read word from DX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111010; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x4567);
    });

    test('read word from BX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111011; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x2345);
    });

    test('read word from SP using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111100; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x89AB);
    });

    test('read word from BP using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111101; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x789A);
    });

    test('read word from SI using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111110; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x5678);
    });

    test('read word from DI using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x6789);
    });
  });

  describe('writeRegVal()', () => {
    beforeEach(() => {
      cpu.reg16[regAX] = 0x0000;
      cpu.reg16[regBX] = 0x0000;
      cpu.reg16[regCX] = 0x0000;
      cpu.reg16[regDX] = 0x0000;

      cpu.reg16[regSP] = 0x0000;
      cpu.reg16[regBP] = 0x0000;
      cpu.reg16[regSI] = 0x0000;
      cpu.reg16[regDI] = 0x0000;

      cpu.reg16[regCS] = 0x0000;
      cpu.reg16[regDS] = 0x0000;
      cpu.reg16[regES] = 0x0000;
      cpu.reg16[regSS] = 0x0000;
    });

    test('write byte to AL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00000000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regAL]).toBe(0x12);
    });

    test('write byte to CL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00001000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regCL]).toBe(0x12);
    });

    test('write byte to DL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00010000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regDL]).toBe(0x12);
    });

    test('write byte to BL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00011000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regBL]).toBe(0x12);
    });

    test('write byte to AH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00100000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regAH]).toBe(0x12);
    });

    test('write byte to CH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00101000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regCH]).toBe(0x12);
    });

    test('write byte to DH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00110000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regDH]).toBe(0x12);
    });

    test('write byte to BH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regBH]).toBe(0x12);
    });

    test('write byte to AX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regAX]).toBe(0x1234);
    });

    test('write byte to CX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00001000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regCX]).toBe(0x1234);
    });

    test('write byte to DX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00010000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regDX]).toBe(0x1234);
    });

    test('write byte to BX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00011000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regBX]).toBe(0x1234);
    });

    test('write byte to SP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00100000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regSP]).toBe(0x1234);
    });

    test('write byte to BP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00101000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regBP]).toBe(0x1234);
    });

    test('write byte to SI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00110000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regSI]).toBe(0x1234);
    });

    test('write byte to DI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regDI]).toBe(0x1234);
    });

    test('write byte to AL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regAL]).toBe(0x12);
    });

    test('write byte to CL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111001; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regCL]).toBe(0x12);
    });

    test('write byte to DL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111010; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regDL]).toBe(0x12);
    });

    test('write byte to BL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111011; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regBL]).toBe(0x12);
    });

    test('write byte to AH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111100; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regAH]).toBe(0x12);
    });

    test('write byte to CH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111101; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regCH]).toBe(0x12);
    });

    test('write byte to DH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111110; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regDH]).toBe(0x12);
    });

    test('write byte to BH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00000111; // addr mode
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regBH]).toBe(0x12);
    });

    test('write byte to AX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regAX]).toBe(0x1234);
    });

    test('write byte to CX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111001; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regCX]).toBe(0x1234);
    });

    test('write byte to DX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111010; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regDX]).toBe(0x1234);
    });

    test('write byte to BX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111011; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regBX]).toBe(0x1234);
    });

    test('write byte to SP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111100; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regSP]).toBe(0x1234);
    });

    test('write byte to BP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111101; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regBP]).toBe(0x1234);
    });

    test('write byte to SI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111110; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regSI]).toBe(0x1234);
    });

    test('write byte to DI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000111; // addr mode
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regDI]).toBe(0x1234);
    });
  });
});

describe('Memory addressing mode methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 1048576
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regAX] = 0x1234;
    cpu.reg16[regBX] = 0x2345;
    cpu.reg16[regCX] = 0x3456;
    cpu.reg16[regDX] = 0x4567;

    cpu.reg16[regSP] = 0x89AB;
    cpu.reg16[regBP] = 0x789A;
    cpu.reg16[regSI] = 0x5678;
    cpu.reg16[regDI] = 0x6789;

    cpu.reg16[regCS] = 0xABCD;
    cpu.reg16[regDS] = 0xBCD0;
    cpu.reg16[regES] = 0xCD01;
    cpu.reg16[regSS] = 0xD012;

    cpu.reg16[regIP] = 0x0000;
  });

  describe('calcRMAddr', () => {
    // I don't think there's a difference between the functionality for a byte
    // or a word for calcRMAddr. If I'm wrong come back to this.

    test('[BX + SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   SI  ) =
      // (0x2345 + 0x5678) = 0x79BD
      expect(addr.calcRMAddr(segment)).toBe(0x79BD);
    });
    test('[BX + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000001; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   DI  ) =
      // (0x2345 + 0x6789) = 0x8ACE
      expect(addr.calcRMAddr(segment)).toBe(0x8ACE);
    });
    test('[BP + SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000010; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   SI  ) =
      // (0x789A + 0x5678) = 0xCF12
      expect(addr.calcRMAddr(segment)).toBe(0xCF12);
    });
    test('[BP + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000011; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   DI  ) =
      // (0x789A + 0x6789) = 0xE023
      expect(addr.calcRMAddr(segment)).toBe(0xE023);
    });
    test('[SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000100; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  SI  ) =
      // (0x5678) = 0x5678
      expect(addr.calcRMAddr(segment)).toBe(0x5678);
    });
    test('[DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000101; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  DI  ) =
      // (0x6789) = 0x6789
      expect(addr.calcRMAddr(segment)).toBe(0x6789);
    });
    test('Direct Address', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000110; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // ( d1:d0) =
      // (0x1256) = 0x1256
      expect(addr.calcRMAddr(segment)).toBe(0x1256);
    });
    test('[BX]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX  ) =
      // (0x2345) = 0x2345
      expect(addr.calcRMAddr(segment)).toBe(0x2345);
    });
  });

  describe('calcRMDispAddr', () => {
    test('[BX + SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   SI  ) + disp =
      // (0x2345 + 0x5678) + 0x56 =
      //       0x79BD      + 0x56 = 0x7A13
      expect(addr.calcRMDispAddr(segment)).toBe(0x7A13);
    });
    test('[BX + DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000001; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   DI  ) + disp =
      // (0x2345 + 0x6789) + 0x56 =
      //       0x8ACE      + 0x56 = 0x8B24
      expect(addr.calcRMDispAddr(segment)).toBe(0x8B24);
    });
    test('[BP + SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000010; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   SI  ) + disp =
      // (0x789A + 0x5678) + 0x56 =
      //       0xCF12      + 0x56 = 0xCF68
      expect(addr.calcRMDispAddr(segment)).toBe(0xCF68);
    });
    test('[BP + DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000011; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   DI  ) + disp =
      // (0x789A + 0x6789) + 0x56 =
      //      0xE023       + 0x56 = 0xE079
      expect(addr.calcRMDispAddr(segment)).toBe(0xE079);
    });
    test('[SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000100; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  SI  ) + disp =
      // (0x5678) + 0x56 = 0x56CE
      expect(addr.calcRMDispAddr(segment)).toBe(0x56CE);
    });
    test('[DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000101; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  DI  ) + disp =
      // (0x6789) + 0x56 = 0x67DF
      expect(addr.calcRMDispAddr(segment)).toBe(0x67DF);
    });
    test('[BP] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000110; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP  ) + disp =
      // (0x789A) + 0x56 = 0x78F0
      expect(addr.calcRMDispAddr(segment)).toBe(0x78F0);
    });
    test('[BX] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000111; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX  ) + disp =
      // (0x2345) + 0x56 = 0x239B
      expect(addr.calcRMDispAddr(segment)).toBe(0x239B);
    });

    test('[BX + SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   SI  ) + disp   =
      // (0x2345 + 0x5678) + 0x1256 =
      //       0x79BD      + 0x1256 = 0x8C13
      expect(addr.calcRMDispAddr(segment)).toBe(0x8C13);
    });
    test('[BX + DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000001; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX   +   DI  ) + disp   =
      // (0x2345 + 0x6789) + 0x1256 =
      //       0x8ACE      + 0x1256 = 0x9D24
      expect(addr.calcRMDispAddr(segment)).toBe(0x9D24);
    });
    test('[BP + SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000010; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   SI  ) + disp   =
      // (0x789A + 0x5678) + 0x1256 =
      //       0xCF12      + 0x1256 = 0xE168
      expect(addr.calcRMDispAddr(segment)).toBe(0xE168);
    });
    test('[BP + DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000011; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP   +   DI  ) + disp   =
      // (0x789A + 0x6789) + 0x1256 =
      //      0xE023       + 0x1256 = 0xF279
      expect(addr.calcRMDispAddr(segment)).toBe(0xF279);
    });
    test('[SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000100; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  SI  ) + disp   =
      // (0x5678) + 0x1256 = 0x68CE
      expect(addr.calcRMDispAddr(segment)).toBe(0x68CE);
    });
    test('[DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000101; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  DI  ) + disp   =
      // (0x6789) + 0x1256 = 0x79DF
      expect(addr.calcRMDispAddr(segment)).toBe(0x79DF);
    });
    test('[BP] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000110; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BP  ) + disp   =
      // (0x789A) + 0x1256 = 0x8AF0
      expect(addr.calcRMDispAddr(segment)).toBe(0x8AF0);
    });
    test('[BX] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000111; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (  BX  ) + disp   =
      // (0x2345) + 0x1256 = 0x359B
      expect(addr.calcRMDispAddr(segment)).toBe(0x359B);
    });
  });
});

describe('rm/reg access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memorySize: 1048576
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regAX] = 0x1234;
    cpu.reg16[regBX] = 0x2345;
    cpu.reg16[regCX] = 0x3456;
    cpu.reg16[regDX] = 0x4567;

    cpu.reg16[regSP] = 0x89AB;
    cpu.reg16[regBP] = 0x789A;
    cpu.reg16[regSI] = 0x5678;
    cpu.reg16[regDI] = 0x6789;

    cpu.reg16[regCS] = 0xABCD;
    cpu.reg16[regDS] = 0xBCD0;
    cpu.reg16[regES] = 0xCD01;
    cpu.reg16[regSS] = 0xD012;

    cpu.reg16[regIP] = 0x0000;

    cpu.mem8[0xABCD0] = 0x00;       // inst (byte)
    cpu.mem8[0xABCD1] = 0b01000000; // addr mode
    cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
    cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
  });

  describe('readRMReg8()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +         0x79BD      = 0xB368D
      cpu.mem8[0xB368D] = 0x42;

      let segment = cpu.reg16[regCS];
      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x42);
    });
    test('use R/M Table 2 with 8-bit displacement', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x56 =
      //    0xABCD0    +         0x79BD      + 0x56 = 0xB36E3
      cpu.mem8[0xB36E3] = 0x42;

      let segment = cpu.reg16[regCS];
      cpu.decode();
      let result = addr.readRMReg8(segment)
      expect(addr.readRMReg8(segment)).toBe(0x42);
    });
    test('use R/M Table 2 with 16-bit displacement (word disp)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      cpu.mem8[0xB48E3] = 0x42;

      let segment = cpu.reg16[regCS];
      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x42);
    });
    test('two register instruction; use R/M bits with REG table (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x67);
    });
    test('two register instruction; use R/M bits with REG table (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      let segment = cpu.reg16[regCS];
      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x5678);
    });
  });

  describe('readRMReg16()', () => {

  });

  describe('writeRMReg8()', () => {

  });

  describe('writeRMReg16()', () => {

  });
});

// describe('Addressing Modes', () => {
//   let addr, cpu;
//
//   beforeEach(() => {
//     cpu = new CPU8086(new CPUConfig({
//       memorySize: 1024
//     }));
//     addr = new Addressing(cpu);
//   });
//
//   describe('AX', () => {
//
//   });
//
//   describe('AH', () => {
//
//   });
//
//   describe('AL', () => {
//
//   });
//
//   describe('BX', () => {
//
//   });
//
//   describe('BH', () => {
//
//   });
//
//   describe('BL', () => {
//
//   });
//
//   describe('CX', () => {
//
//   });
//
//   describe('CH', () => {
//
//   });
//
//   describe('CL', () => {
//
//   });
//
//   describe('DX', () => {
//
//   });
//
//   describe('DH', () => {
//
//   });
//
//   describe('DL', () => {
//
//   });
//
//   describe('SI', () => {
//
//   });
//
//   describe('DI', () => {
//
//   });
//
//   describe('BP', () => {
//
//   });
//
//   describe('SP', () => {
//
//   });
//
//   describe('CS', () => {
//
//   });
//
//   describe('DS', () => {
//
//   });
//
//   describe('ES', () => {
//
//   });
//
//   describe('SS', () => {
//
//   });
//
//   describe('Ap', () => {
//
//   });
//
//   describe('Eb', () => {
//
//   });
//
//   describe('Ev', () => {
//
//   });
//
//   describe('Ew', () => {
//
//   });
//
//   describe('Gb', () => {
//
//   });
//
//   describe('Gv', () => {
//
//   });
//
//   describe('I0', () => {
//
//   });
//
//   describe('Ib', () => {
//
//   });
//
//   describe('Iv', () => {
//
//   });
//
//   describe('Iw', () => {
//
//   });
//
//   describe('Jb', () => {
//
//   });
//
//   describe('Jv', () => {
//
//   });
//
//   describe('M', () => {
//
//   });
//
//   describe('Mp', () => {
//
//   });
//
//   describe('Ob', () => {
//
//   });
//
//   describe('Ov', () => {
//
//   });
//
//   describe('Sw', () => {
//
//   });
// });










