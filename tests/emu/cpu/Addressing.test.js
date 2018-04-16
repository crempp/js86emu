import CPU8086 from '../../../src/emu/cpu/8086';
import Addressing from '../../../src/emu/cpu/Addressing';
import CPUConfig from '../../../src/emu/cpu/CPUConfig';
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../../src/emu/Constants';
import {InvalidAddressModeException, ValueOverflowException} from "../../../src/emu/utils/Exceptions";
import {
  formatOpcode, hexString8, hexString16, hexString32, formatFlags,
  formatMemory, formatRegisters
} from "../../../src/emu/utils/Debug";
import {segIP} from "../../../src/emu/utils/Utils";

// TODO: writeMem8 and readMem8 - should be the same
// TODO: writeMem16 and readMem16 - should be the same

test('Addressing object constructs', () => {
  let cpu = new CPU8086(new CPUConfig({
    memorySize: 1048576
  }));
  let addr = new Addressing(cpu);
  expect(addr).toBeInstanceOf(Addressing);
});

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
  let addr, cpu, segment;

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
    segment = cpu.reg16[regCS];
  });

  describe('calcRMAddr', () => {
    // I don't think there's a difference between the functionality for a byte
    // or a word for calcRMAddr. If I'm wrong come back to this.

    test('[BX + SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();

      // (  BX   +   SI  ) =
      // (0x2345 + 0x5678) = 0x79BD
      expect(addr.calcRMAddr(segment)).toBe(0x79BD);
    });
    test('[BX + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000001; // addr mode
      cpu.decode();

      // (  BX   +   DI  ) =
      // (0x2345 + 0x6789) = 0x8ACE
      expect(addr.calcRMAddr(segment)).toBe(0x8ACE);
    });
    test('[BP + SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000010; // addr mode
      cpu.decode();

      // (  BP   +   SI  ) =
      // (0x789A + 0x5678) = 0xCF12
      expect(addr.calcRMAddr(segment)).toBe(0xCF12);
    });
    test('[BP + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000011; // addr mode
      cpu.decode();

      // (  BP   +   DI  ) =
      // (0x789A + 0x6789) = 0xE023
      expect(addr.calcRMAddr(segment)).toBe(0xE023);
    });
    test('[SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000100; // addr mode
      cpu.decode();

      // (  SI  ) =
      // (0x5678) = 0x5678
      expect(addr.calcRMAddr(segment)).toBe(0x5678);
    });
    test('[DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000101; // addr mode
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
      cpu.decode();

      // ( d1:d0) =
      // (0x1256) = 0x1256
      expect(addr.calcRMAddr(segment)).toBe(0x1256);
    });
    test('[BX]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
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
      cpu.decode();

      // (  BX  ) + disp   =
      // (0x2345) + 0x1256 = 0x359B
      expect(addr.calcRMDispAddr(segment)).toBe(0x359B);
    });
  });
});

describe('rm/reg access methods', () => {
  let addr, cpu, segment;

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

    segment = cpu.reg16[regCS];
  });

  describe('readRMReg8()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +         0x79BD      = 0xB368D
      cpu.mem8[0xB368D] = 0x42;

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

      cpu.decode();
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

      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x42);
    });
    test('two register instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      expect(addr.readRMReg8(segment)).toBe(0x67);
    });
  });

  describe('readRMReg16()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +         0x79BD      = 0xB368D
      cpu.mem8[0xB368D] = 0x42;
      cpu.mem8[0xB368E] = 0x21;

      cpu.decode();
      expect(addr.readRMReg16(segment)).toBe(0x2142);
    });
    test('use R/M Table 2 with 8-bit displacement', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x56 =
      //    0xABCD0    +         0x79BD      + 0x56 = 0xB36E3
      cpu.mem8[0xB36E3] = 0x42;
      cpu.mem8[0xB36E4] = 0x21;

      cpu.decode();
      expect(addr.readRMReg16(segment)).toBe(0x2142);
    });
    test('use R/M Table 2 with 16-bit displacement (word disp)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      cpu.mem8[0xB48E3] = 0x42;
      cpu.mem8[0xB48E4] = 0x21;

      cpu.decode();
      expect(addr.readRMReg16(segment)).toBe(0x2142);
    });
    test('two register instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      expect(addr.readRMReg16(segment)).toBe(0x5678);
    });
  });

  describe('writeRMReg8()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      addr.writeRMReg8(segment, 0x42);

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +         0x79BD      = 0xB368D
      expect(cpu.mem8[0xB368D]).toBe(0x42);
    });
    test('use R/M Table 2 with 8-bit displacement', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      addr.writeRMReg8(segment, 0x42);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x56 =
      //    0xABCD0    +         0x79BD      + 0x56 = 0xB36E3
      expect(cpu.mem8[0xB36E3]).toBe(0x42);
    });
    test('use R/M Table 2 with 16-bit displacement (word disp)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      addr.writeRMReg8(segment, 0x42);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      expect(cpu.mem8[0xB48E3]).toBe(0x42);
    });
    test('two register instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      addr.writeRMReg8(segment, 0x67);
      expect(cpu.reg8[regDH]).toBe(0x67);
    });
  });

  describe('writeRMReg16()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      addr.writeRMReg16(segment, 0x2142);

      // (CS     * 0x10) + (  BX   +   SI  ) =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) =
      //    0xABCD0    +         0x79BD      = 0xB368D
      expect(cpu.mem8[0xB368D]).toBe(0x42);
      expect(cpu.mem8[0xB368E]).toBe(0x21)
    });
    test('use R/M Table 2 with 8-bit displacement', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      addr.writeRMReg16(segment, 0x2142);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x56 =
      //    0xABCD0    +         0x79BD      + 0x56 = 0xB36E3
      expect(cpu.mem8[0xB36E3]).toBe(0x42);
      expect(cpu.mem8[0xB36E4]).toBe(0x21);
    });
    test('use R/M Table 2 with 16-bit displacement (word disp)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      addr.writeRMReg16(segment, 0x2142);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      expect(cpu.mem8[0xB48E3]).toBe(0x42);
      expect(cpu.mem8[0xB48E4]).toBe(0x21);
    });
    test('two register instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      addr.writeRMReg16(segment, 0x5678);
      expect(cpu.reg16[regSI]).toBe(0x5678);
    });
  });
});

describe('Addressing Modes', () => {
  let addr, cpu, segment;

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

    segment = cpu.reg16[regCS];
    cpu.cycleIP = 0;
    cpu.decode();
  });

  describe('_1', () => {
    test('read', () => {
      expect(addr._1(null, null)).toBe(0x01);
      expect(cpu.cycleIP).toBe(0);
    });
    // TODO: Do we need a write test?
  });

  describe('_3', () => {
    test('read', () => {
      expect(addr._3(null, null)).toBe(0x03);
      expect(cpu.cycleIP).toBe(0);
    });
    // TODO: Do we need a write test?
  });

  describe('AX', () => {
    test('read', () => {
      expect(addr.AX(null, null)).toBe(0x1234);
    });
    test('read cycles', () => {
      addr.AX(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.AX(null, 0xFFFF);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.AX(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('AH', () => {
    test('read', () => {
      addr.AH(null, null);
      expect(addr.AH()).toBe(0x34);
    });
    test('read cycles', () => {
      addr.AH(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.AH(null, 0xFF);
      expect(cpu.reg8[regAH]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.AH(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('AL', () => {
    test('read', () => {
      expect(addr.AL(null, null)).toBe(0x12);
    });
    test('read cycles', () => {
      addr.AL(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.AL(null, 0xFF);
      expect(cpu.reg8[regAL]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.AL(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('BX', () => {
    test('read', () => {
      expect(addr.BX(null, null)).toBe(0x2345);
    });
    test('read cycles', () => {
      addr.BX(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.BX(null, 0xFFFF);
      expect(cpu.reg16[regBX]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.BX(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('BH', () => {
    test('read', () => {
      expect(addr.BH(null, null)).toBe(0x45);
    });
    test('read cycles', () => {
      addr.BH(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.BH(null, 0xFF);
      expect(cpu.reg8[regBH]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.BH(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('BL', () => {
    test('read', () => {
      expect(addr.BL(null, null)).toBe(0x23);
    });
    test('read cycles', () => {
      addr.BL(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.BL(null, 0xFF);
      expect(cpu.reg8[regBL]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.BL(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('CX', () => {
    test('read', () => {
      expect(addr.CX(null, null)).toBe(0x3456);
    });
    test('read cycles', () => {
      addr.CX(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.CX(null, 0xFFFF);
      expect(cpu.reg16[regCX]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.CX(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('CH', () => {
    test('read', () => {
      expect(addr.CH(null, null)).toBe(0x56);
    });
    test('read cycles', () => {
      addr.CH(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.CH(null, 0xFF);
      expect(cpu.reg8[regCH]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.CH(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('CL', () => {
    test('read', () => {
      expect(addr.CL(null, null)).toBe(0x34);
    });
    test('read cycles', () => {
      addr.CL(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.CL(null, 0xFF);
      expect(cpu.reg8[regCL]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.CL(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('DX', () => {
    test('read', () => {
      expect(addr.DX(null, null)).toBe(0x4567);
    });
    test('read cycles', () => {
      addr.DX(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.DX(null, 0xFFFF);
      expect(cpu.reg16[regDX]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.DX(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('DH', () => {
    test('read', () => {
      expect(addr.DH(null, null)).toBe(0x67);
    });
    test('read cycles', () => {
      addr.DH(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.DH(null, 0xFF);
      expect(cpu.reg8[regDH]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.DH(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('DL', () => {
    test('read', () => {
      expect(addr.DL(null, null)).toBe(0x45);
    });
    test('read cycles', () => {
      addr.DL(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.DL(null, 0xFF);
      expect(cpu.reg8[regDL]).toBe(0xFF);
      expect(result).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.DL(null, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('SI', () => {
    test('read', () => {
      expect(addr.SI(null, null)).toBe(0x5678);
    });
    test('read cycles', () => {
      addr.SI(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.SI(null, 0xFFFF);
      expect(cpu.reg16[regSI]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.SI(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('DI', () => {
    test('read', () => {
      expect(addr.DI(null, null)).toBe(0x6789);
    });
    test('read cycles', () => {
      addr.DI(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.DI(null, 0xFFFF);
      expect(cpu.reg16[regDI]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.DI(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('BP', () => {
    test('read', () => {
      expect(addr.BP(null, null)).toBe(0x789A);
    });
    test('read cycles', () => {
      addr.BP(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.BP(null, 0xFFFF);
      expect(cpu.reg16[regBP]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.BP(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('SP', () => {
    test('read', () => {
      expect(addr.SP(null, null)).toBe(0x89AB);
    });
    test('read cycles', () => {
      addr.SP(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.SP(null, 0xFFFF);
      expect(cpu.reg16[regSP]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.SP(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('CS', () => {
    test('read', () => {
      expect(addr.CS(null, null)).toBe(0xABCD);
    });
    test('read cycles', () => {
      addr.CS(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.CS(null, 0xFFFF);
      expect(cpu.reg16[regCS]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.CS(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('DS', () => {
    test('read', () => {
      expect(addr.DS(null, null)).toBe(0xBCD0);
    });
    test('read cycles', () => {
      addr.DS(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.DS(null, 0xFFFF);
      expect(cpu.reg16[regDS]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.DS(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('ES', () => {
    test('read', () => {
      expect(addr.ES(null, null)).toBe(0xCD01);
    });
    test('read cycles', () => {
      addr.ES(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.ES(null, 0xFFFF);
      expect(cpu.reg16[regES]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.ES(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('SS', () => {
    test('read', () => {
      expect(addr.SS(null, null)).toBe(0xD012);
    });
    test('read cycles', () => {
      addr.SS(null, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      let result = addr.SS(null, 0xFFFF);
      expect(cpu.reg16[regSS]).toBe(0xFFFF);
      expect(result).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.SS(null, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('Ap', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0x34; // segment byte high
      cpu.mem8[0xABCD2] = 0x12; // segment byte low
      cpu.mem8[0xABCD3] = 0x78; // offset byte high
      cpu.mem8[0xABCD4] = 0x56; // offset byte low

      // (CS     * 0x10) + ( offs ) =
      // (0x1234 * 0x10) + (0x5678) =
      //    0x12340      +  0x5678  = 0x179B8
      cpu.mem8[0x179B8] = 0x90;
    });

    test('read', () => {
      // expect(addr.Ap(segment, null)).toBe(0x90);
      expect(addr.Ap(segment, null)).toEqual([0x1234, 0x5678]);
    });
    test('read cycles', () => {
      addr.Ap(segment, null);
      expect(cpu.cycleIP).toBe(4);
    });
    test('write throws', () => {
      expect(() => {
        addr.Ap(segment, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Eb', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
    });
    test('read', () => {
      expect(addr.Eb(segment, null)).toBe(0x90);
    });
    test('read cycles', () => {
      addr.Eb(segment, null);
      expect(cpu.cycleIP).toBe(1);
    });
    test('write', () => {
      addr.Eb(segment, 0xFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.Eb(segment, 0xFF);
      expect(cpu.cycleIP).toBe(1);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Eb(segment, null)).toBe(0x90);
    });
  });

  describe.skip('Ep', () => {

  });

  describe('Ev', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
      cpu.mem8[0xB36E4] = 0x90;
    });
    test('read', () => {
      expect(addr.Ev(segment, null)).toBe(0x9090);
    });
    test('read cycles', () => {
      addr.Ev(segment, null);
      expect(cpu.cycleIP).toBe(1);
    });
    test('write', () => {
      addr.Ev(segment, 0xFFFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
      expect(cpu.mem8[0xB36E4]).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.Ev(segment, 0xFFFF);
      expect(cpu.cycleIP).toBe(1);
    });
  });

  describe('Ew', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
      cpu.mem8[0xB36E4] = 0x90;

      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
    });
    test('read', () => {
      expect(addr.Ew(segment, null)).toBe(0x9090);
    });
    test('read cycles', () => {
      addr.Ew(segment, null);
      expect(cpu.cycleIP).toBe(1);
    });
    test('write', () => {
      addr.Ew(segment, 0xFFFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
      expect(cpu.mem8[0xB36E4]).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.Ew(segment, 0xFFFF);
      expect(cpu.cycleIP).toBe(1);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.decode();
      expect(addr.Ew(segment, null)).toBe(0x9090);
    });
  });

  describe('Gb', () => {
    test('read', () => {
      expect(addr.Gb(segment, null)).toBe(0x12);
    });
    test('read cycles', () => {
      addr.Gb(segment, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      addr.Gb(segment, 0xFF);
      expect(cpu.reg8[regAL]).toBe(0xFF);
    });
    test('write cycles', () => {
      addr.Gb(segment, 0xFF);
      expect(cpu.cycleIP).toBe(0);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      let r = addr.Gb(segment, null);
      expect(r).toBe(0x12);
    });
  });

  describe('Gv', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
    });
    test('read', () => {
      expect(addr.Gv(segment, null)).toBe(0x1234);
    });
    test('read cycles', () => {
      addr.Gv(segment, null);
      expect(cpu.cycleIP).toBe(0);
    });
    test('write', () => {
      addr.Gv(segment, 0xFFFF);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
    });
    test('write cycles', () => {
      addr.Gv(segment, 0xFFFF);
      expect(cpu.cycleIP).toBe(0);
    });
  });

  describe('Ib', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.cycleIP = 1; // usually the operation will do this
    });
    test('read', () => {
      expect(addr.Ib(segment, null)).toBe(0x34);
    });
    test('read cycles', () => {
      addr.Ib(segment, null);
      expect(cpu.cycleIP).toBe(2);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Ib(segment, null)).toBe(0x34);
    });
  });

  describe('Iv', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.mem8[0xABCD0] = 0x01; // inst (byte)

      cpu.cycleIP = 1; // usually the operation will do this
    });
    test('read', () => {
      expect(addr.Iv(segment, null)).toBe(0x1234);
    });
    test('read cycles', () => {
      addr.Iv(segment, null);
      expect(cpu.cycleIP).toBe(3);
    });
  });

  describe('Iw', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.cycleIP = 1; // usually the operation will do this
    });
    test('read', () => {
      expect(addr.Iw(segment, null)).toBe(0x1234);
    });
    test('read cycles', () => {
      addr.Iw(segment, null);
      expect(cpu.cycleIP).toBe(3);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.decode();
      expect(addr.Iw(segment, null)).toBe(0x1234);
    });
  });

  describe('Jb', () => {
    beforeEach(() => {
      cpu.mem8[0xABCE2] = 0x34; // arg1 byte low
      cpu.mem8[0xABCE3] = 0x12; // arg1 byte high
      cpu.mem8[0xABCE4] = 0x78; // arg2 byte low
      cpu.mem8[0xABCE5] = 0x56; // arg2 byte high

      cpu.reg16[regIP] = 0x0011;

      cpu.cycleIP = 1; // usually the operation will do this
    });
    test('read', () => {
      expect(addr.Jb(segment, null)).toBe(0x34 + 0x0011);
    });
    test('read cycles', () => {
      addr.Jb(segment, null);
      expect(cpu.cycleIP).toBe(2);
    });
    test.skip('write throws', () => {
      expect(() => {
        addr.Jb(segment, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Jb(segment, null)).toBe(0x34 + 0x0011);
    });
  });

  describe('Jv', () => {
    beforeEach(() => {
      cpu.mem8[0xABCE2] = 0x34; // arg1 byte low
      cpu.mem8[0xABCE3] = 0x12; // arg1 byte high
      cpu.mem8[0xABCE4] = 0x78; // arg2 byte low
      cpu.mem8[0xABCE5] = 0x56; // arg2 byte high

      cpu.mem8[0xABCE1] = 0x01; // inst (byte)

      cpu.reg16[regIP] = 0x0011;

      cpu.cycleIP = 1; // usually the operation will do this
    });
    test('read', () => {
      expect(addr.Jv(segment, null)).toBe(0x1234 + 0x0011);
    });
    test('read cycles', () => {
      addr.Jv(segment, null);
      expect(cpu.cycleIP).toBe(3);
    });
    test.skip('write', () => {
      expect(() => {
        addr.Jv(segment, 0xFFFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('M', () => {
    beforeEach(() => {
      cpu.reg16[regDI] = 0x9ABC;
      cpu.mem8[0xABCD0] = 0x8D; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000101; // addr mode
      cpu.mem8[0xABCD2] = 0x34; // segment byte high
      cpu.mem8[0xABCD3] = 0x12; // segment byte low

      cpu.decode();
    });

    test('read', () => {
      expect(addr.M(segment, null)).toEqual(0x9ABC + 0x1234);
    });
    test('read cycles', () => {
      addr.M(segment, null);
      expect(cpu.cycleIP).toBe(2);
    });
    test('write throws', () => {
      expect(() => {
        addr.M(segment, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Mp', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0xC4; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000110; // addr mode
      cpu.mem8[0xABCD2] = 0x34; // segment byte high
      cpu.mem8[0xABCD3] = 0x12; // segment byte low

      cpu.mem8[0xACF04] = 0x78; // v1 high
      cpu.mem8[0xACF05] = 0x56; // v1 low
      cpu.mem8[0xACF06] = 0xBC; // v2 high
      cpu.mem8[0xACF07] = 0x9A; // v2 low

      cpu.decode();
    });

    test('read', () => {
      expect(addr.Mp(segment, null)).toEqual([0x9ABC, 0x5678]);
    });
    test('read cycles', () => {
      addr.Mp(segment, null);
      expect(cpu.cycleIP).toBe(2);
    });
    test('write throws', () => {
      expect(() => {
        addr.Mp(segment, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe.skip('Ob', () => {

  });

  describe.skip('Ov', () => {

  });

  describe.skip('Sw', () => {

  });
});










