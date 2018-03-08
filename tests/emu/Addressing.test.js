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


  // console.log("opcode_byte: " + hexString16(cpu.mem8[segIP(cpu)]));
  // console.log("CS:IP: " + hexString16(cpu.reg16[regCS]) + ":" + hexString16(cpu.reg16[regIP]) +  " -> " + hexString32(segIP(cpu)) + "\n" +
  //   "MEMORY:\n" + formatMemory(cpu.mem8, segIP(cpu), segIP(cpu) + 7, 11) + "\n" +
  //   "OPCODE:\n" + formatOpcode(cpu.opcode, 11) + "\n" +
  //   "REGISTERS\n" + formatRegisters(cpu, 11)  + "\n" +
  //   "FLAGS:\n" + formatFlags(cpu.reg16[regFlags], 10) + "\n" +
  //   "INSTRUCTION: " +  cpu.opcode.string);
  // console.log("result: " + hexString16(addr.readRegVal()));

  // TODO: Write mem16 and read mem8 - should be the same

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
      cpu.mem8[0xABCD1] = 0b00000000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x12);
    });

    test('read byte from CL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00001000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from DL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00010000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read byte from BL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00011000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x23);
    });

    test('read byte from AH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00100000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from CH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00101000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x56);
    });

    test('read byte from DH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00110000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x67);
    });

    test('read byte from BH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read word from AX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00000000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x1234);
    });

    test('read word from CX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00001000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x3456);
    });

    test('read word from DX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00010000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x4567);
    });

    test('read word from BX', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00011000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x2345);
    });

    test('read word from SP', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00100000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x89AB);
    });

    test('read word from BP', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00101000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x789A);
    });

    test('read word from SI', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00110000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x5678);
    });

    test('read word from DI', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x6789);
    });

    test('read byte from AL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x12);
    });

    test('read byte from CL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111001; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from DL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111010; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read byte from BL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111011; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x23);
    });

    test('read byte from AH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111100; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from CH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111101; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x56);
    });

    test('read byte from DH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111110; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x67);
    });

    test('read byte from BH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read word from AX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x1234);
    });

    test('read word from CX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111001; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x3456);
    });

    test('read word from DX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111010; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x4567);
    });

    test('read word from BX using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111011; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x2345);
    });

    test('read word from SP using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111100; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x89AB);
    });

    test('read word from BP using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111101; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x789A);
    });

    test('read word from SI using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00111110; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x5678);
    });

    test('read word from DI using RM', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (word)
      cpu.mem8[0xABCD1] = 0b00000111; // addr
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
      cpu.mem8[0x0001] = 0b00000000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regAL]).toBe(0x12);
    });

    test('write byte to CL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00001000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regCL]).toBe(0x12);
    });

    test('write byte to DL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00010000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regDL]).toBe(0x12);
    });

    test('write byte to BL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00011000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regBL]).toBe(0x12);
    });

    test('write byte to AH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00100000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regAH]).toBe(0x12);
    });

    test('write byte to CH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00101000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regCH]).toBe(0x12);
    });

    test('write byte to DH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00110000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regDH]).toBe(0x12);
    });

    test('write byte to BH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      addr.writeRegVal(0x12);
      expect(cpu.reg8[regBH]).toBe(0x12);
    });

    test('write byte to AX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regAX]).toBe(0x1234);
    });

    test('write byte to CX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00001000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regCX]).toBe(0x1234);
    });

    test('write byte to DX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00010000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regDX]).toBe(0x1234);
    });

    test('write byte to BX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00011000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regBX]).toBe(0x1234);
    });

    test('write byte to SP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00100000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regSP]).toBe(0x1234);
    });

    test('write byte to BP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00101000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regBP]).toBe(0x1234);
    });

    test('write byte to SI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00110000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regSI]).toBe(0x1234);
    });

    test('write byte to DI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234);
      expect(cpu.reg16[regDI]).toBe(0x1234);
    });

    test('write byte to AL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regAL]).toBe(0x12);
    });

    test('write byte to CL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111001; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regCL]).toBe(0x12);
    });

    test('write byte to DL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111010; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regDL]).toBe(0x12);
    });

    test('write byte to BL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111011; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regBL]).toBe(0x12);
    });

    test('write byte to AH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111100; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regAH]).toBe(0x12);
    });

    test('write byte to CH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111101; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regCH]).toBe(0x12);
    });

    test('write byte to DH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111110; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regDH]).toBe(0x12);
    });

    test('write byte to BH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00000111; // addr
      cpu.decode();
      addr.writeRegVal(0x12, true);
      expect(cpu.reg8[regBH]).toBe(0x12);
    });

    test('write byte to AX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regAX]).toBe(0x1234);
    });

    test('write byte to CX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111001; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regCX]).toBe(0x1234);
    });

    test('write byte to DX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111010; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regDX]).toBe(0x1234);
    });

    test('write byte to BX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111011; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regBX]).toBe(0x1234);
    });

    test('write byte to SP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111100; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regSP]).toBe(0x1234);
    });

    test('write byte to BP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111101; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regBP]).toBe(0x1234);
    });

    test('write byte to SI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111110; // addr
      cpu.decode();
      addr.writeRegVal(0x1234, true);
      expect(cpu.reg16[regSI]).toBe(0x1234);
    });

    test('write byte to DI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000111; // addr
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
    //   7   6   5   4   3   2   1   0
    // +---+---+---+---+---+---+---+---+
    // |     opcode            | d | w |
    // +---+---+---+---+---+---+---+---+
    // +---+---+---+---+---+---+---+---+
    // |  mod  |    reg    |    r/m    |
    // +---+---+---+---+---+---+---+---+

    test('[BX + SI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +      0x79BD       = 0xB368D
      expect(addr.calcRMAddr(segment)).toBe(0xB368D);
    });
    test('[BX + DI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000001; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  BX   +   DI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x6789) =
      //    0xABCD0    +      0x8ACE       = 0xB479E
      expect(addr.calcRMAddr(segment)).toBe(0xB479E);
    });
    test('[BP + SI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000010; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  BP   +   SI  ) =
      // (0xABCD * 0x10) + (0x789A + 0x5678) =
      //    0xABCD0    +      0xCF12       = 0xB8BE2
      expect(addr.calcRMAddr(segment)).toBe(0xB8BE2);
    });
    test('[BP + DI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000011; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  BP   +   DI  ) =
      // (0xABCD * 0x10) + (0x789A + 0x6789) =
      //    0xABCD0    +      0xE023       = 0xB9CF3
      expect(addr.calcRMAddr(segment)).toBe(0xB9CF3);
    });
    test('[SI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000100; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  SI  ) =
      // (0xABCD * 0x10) + (0x5678) =
      //    0xABCD0    +    0x5678  = 0xB368D
      expect(addr.calcRMAddr(segment)).toBe(0xB1348);
    });
    test('[DI] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000101; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  DI  ) =
      // (0xABCD * 0x10) + (0x6789) =
      //    0xABCD0    +    0x6789  = 0xB2459
      expect(addr.calcRMAddr(segment)).toBe(0xB2459);
    });
    test('Direct Address byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000110; // addr
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + ( d1:d0) =
      // (0xABCD * 0x10) + (0x1256) =
      //    0xABCD0    +    0x1256  = 0xACF26
      expect(addr.calcRMAddr(segment)).toBe(0xACF26);
    });
    test('[BX] byte', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr
      let segment = cpu.reg16[regCS];
      cpu.decode();

      // (CS     * 0x10) + (  BX  ) =
      // (0xABCD * 0x10) + (0x2345) =
      //    0xABCD0    +    0x2345  = 0xAE015
      expect(addr.calcRMAddr(segment)).toBe(0xAE015);
    });
  });

  // describe('calcRMDispAddr', () => {
  //   test('', () => {
  //
  //   })
  // });
  //
  // describe('calcImmAddr', () => {
  //   test('', () => {
  //
  //   })
  // });
});

// describe('RMReg access methods', () => {
//   let addr, cpu;
//
//   beforeEach(() => {
//     cpu = new CPU8086(new CPUConfig({
//       memorySize: 262400
//     }));
//     addr = new Addressing(cpu);
//     cpu.reg16[regCS] = 0x0000;
//     cpu.reg16[regIP] = 0x0000;
//   });
//
//   //   7   6   5   4   3   2   1   0
//   // +---+---+---+---+---+---+---+---+
//   // |     opcode            | d | w |
//   // +---+---+---+---+---+---+---+---+
//   // +---+---+---+---+---+---+---+---+
//   // |  mod  |    reg    |    r/m    |
//   // +---+---+---+---+---+---+---+---+
//
//   describe('readRMReg8()', () => {
//     test('read rm byte addr', () => {
//       cpu.mem8[0x0000] = 0x00; // inst (byte)
//       cpu.mem8[0x0001] = 0b00000000; // addr
//
//       // cpu.mem8[]
//       cpu.decode();
//
//       console.log(formatOpcode(cpu.opcode));
//
//       let result = addr.readRMReg8(0x01);
//       console.log(hexString16(result));
//     });
//
//
//     // Use R/M Table 2 with 8-bit displacement
//
//     // Use R/M Table 2 with 16-bit displacement
//
//     // Two register instruction; use REG table
//       // Ensure that tests with reg value set and it uses rm
//
//   });
//
//   describe('readRMReg16()', () => {
//
//   });
//
//   describe('writeRMReg8()', () => {
//
//   });
//
//   describe('writeRMReg16()', () => {
//
//   });
// });

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










