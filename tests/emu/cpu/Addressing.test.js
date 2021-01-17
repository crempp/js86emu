import CPU8086 from '../../../src/emu/cpu/8086';
import Addressing from '../../../src/emu/cpu/Addressing';
import SystemConfig from '../../../src/emu/config/SystemConfig';
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
} from '../../../src/emu/Constants';
import {InvalidAddressModeException, ValueOverflowException} from "../../../src/emu/utils/Exceptions";
// import {
//   formatOpcode, hexString8, hexString16, hexString32, formatFlags,
//   formatMemory, formatRegisters
// } from "../../../src/emu/utils/Debug";

test('Addressing object constructs', () => {
  let cpu = new CPU8086(new SystemConfig({
    memorySize: 1048576,
    debug: false,
  }));
  let addr = new Addressing(cpu);
  expect(addr).toBeInstanceOf(Addressing);
});

describe('Memory access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 262400,
      debug: false,
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
  });
});

describe('Register access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
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
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from CL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00001000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x56);
    });

    test('read byte from DL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00010000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x67);
    });

    test('read byte from BL', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00011000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read byte from AH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00100000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x12);
    });

    test('read byte from CH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00101000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from DH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00110000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read byte from BH', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111000; // addr mode
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x23);
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
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from CL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111001; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x56);
    });

    test('read byte from DL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111010; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x67);
    });

    test('read byte from BL using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111011; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read byte from AH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111100; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x12);
    });

    test('read byte from CH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111101; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from DH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00111110; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read byte from BH using RM', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x23);
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
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   SI  ) =
      // (0x2345 + 0x5678) = 0x79BD
      expect(addr.calcRMAddr(segment)).toBe(0x79BD);
    });
    test('[BX + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000001; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   DI  ) =
      // (0x2345 + 0x6789) = 0x8ACE
      expect(addr.calcRMAddr(segment)).toBe(0x8ACE);
    });
    test('[BP + SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000010; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   SI  ) =
      // (0x789A + 0x5678) = 0xCF12
      expect(addr.calcRMAddr(segment)).toBe(0xCF12);
    });
    test('[BP + DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000011; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   DI  ) =
      // (0x789A + 0x6789) = 0xE023
      expect(addr.calcRMAddr(segment)).toBe(0xE023);
    });
    test('[SI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000100; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  SI  ) =
      // (0x5678) = 0x5678
      expect(addr.calcRMAddr(segment)).toBe(0x5678);
    });
    test('[DI]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000101; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // ( d1:d0) =
      // (0x1256) = 0x1256
      let r = addr.calcRMAddr(segment);
      expect(r).toBe(0x1256);
    });
    test('[BX]', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000111; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX  ) =
      // (0x2345) = 0x2345
      expect(addr.calcRMAddr(segment)).toBe(0x2345);
    });
  });

  describe('calcRMAddrDisp', () => {
    test('[BX + SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   SI  ) + disp =
      // (0x2345 + 0x5678) + 0x56 =
      //       0x79BD      + 0x56 = 0x7A13
      expect(addr.calcRMAddrDisp(segment)).toBe(0x7A13);
    });
    test('[BX + DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000001; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   DI  ) + disp =
      // (0x2345 + 0x6789) + 0x56 =
      //       0x8ACE      + 0x56 = 0x8B24
      expect(addr.calcRMAddrDisp(segment)).toBe(0x8B24);
    });
    test('[BP + SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000010; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   SI  ) + disp =
      // (0x789A + 0x5678) + 0x56 =
      //       0xCF12      + 0x56 = 0xCF68
      expect(addr.calcRMAddrDisp(segment)).toBe(0xCF68);
    });
    test('[BP + DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000011; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   DI  ) + disp =
      // (0x789A + 0x6789) + 0x56 =
      //      0xE023       + 0x56 = 0xE079
      expect(addr.calcRMAddrDisp(segment)).toBe(0xE079);
    });
    test('[SI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000100; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  SI  ) + disp =
      // (0x5678) + 0x56 = 0x56CE
      expect(addr.calcRMAddrDisp(segment)).toBe(0x56CE);
    });
    test('[DI] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000101; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  DI  ) + disp =
      // (0x6789) + 0x56 = 0x67DF
      expect(addr.calcRMAddrDisp(segment)).toBe(0x67DF);
    });
    test('[BP] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000110; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP  ) + disp =
      // (0x789A) + 0x56 = 0x78F0
      expect(addr.calcRMAddrDisp(segment)).toBe(0x78F0);
    });
    test('[BX] + disp (byte)', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b01000111; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX  ) + disp =
      // (0x2345) + 0x56 = 0x239B
      expect(addr.calcRMAddrDisp(segment)).toBe(0x239B);
    });

    test('[BX + SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000000; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   SI  ) + disp   =
      // (0x2345 + 0x5678) + 0x1256 =
      //       0x79BD      + 0x1256 = 0x8C13
      expect(addr.calcRMAddrDisp(segment)).toBe(0x8C13);
    });
    test('[BX + DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000001; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX   +   DI  ) + disp   =
      // (0x2345 + 0x6789) + 0x1256 =
      //       0x8ACE      + 0x1256 = 0x9D24
      expect(addr.calcRMAddrDisp(segment)).toBe(0x9D24);
    });
    test('[BP + SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000010; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   SI  ) + disp   =
      // (0x789A + 0x5678) + 0x1256 =
      //       0xCF12      + 0x1256 = 0xE168
      expect(addr.calcRMAddrDisp(segment)).toBe(0xE168);
    });
    test('[BP + DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000011; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP   +   DI  ) + disp   =
      // (0x789A + 0x6789) + 0x1256 =
      //      0xE023       + 0x1256 = 0xF279
      expect(addr.calcRMAddrDisp(segment)).toBe(0xF279);
    });
    test('[SI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000100; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  SI  ) + disp   =
      // (0x5678) + 0x1256 = 0x68CE
      expect(addr.calcRMAddrDisp(segment)).toBe(0x68CE);
    });
    test('[DI] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000101; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  DI  ) + disp   =
      // (0x6789) + 0x1256 = 0x79DF
      expect(addr.calcRMAddrDisp(segment)).toBe(0x79DF);
    });
    test('[BP] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000110; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BP  ) + disp   =
      // (0x789A) + 0x1256 = 0x8AF0
      expect(addr.calcRMAddrDisp(segment)).toBe(0x8AF0);
    });
    test('[BX] + disp (word)', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b10000111; // addr mode
      cpu.mem8[0xABCD2] = 0b01010110; // d1 (0x56)
      cpu.mem8[0xABCD3] = 0b00010010; // d2 (0x12)
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;

      // (  BX  ) + disp   =
      // (0x2345) + 0x1256 = 0x359B
      expect(addr.calcRMAddrDisp(segment)).toBe(0x359B);
    });
  });
});

describe('rm/reg access methods', () => {
  let addr, cpu, segment;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg8(segment, offset)).toBe(0x42);
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg8(segment, offset)).toBe(0x42);
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg8(segment, offset)).toBe(0x42);
    });
    test('two registerPort instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg8(segment, offset)).toBe(0x45);
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg16(segment, offset)).toBe(0x2142);
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg16(segment, offset)).toBe(0x2142);
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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg16(segment, offset)).toBe(0x2142);
    });
    test('two registerPort instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      expect(addr.readRMReg16(segment, offset)).toBe(0x5678);
    });
  });

  describe('writeRMReg8()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg8(segment, offset, 0x42);

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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg8(segment, offset, 0x42);

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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg8(segment, offset, 0x42);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      expect(cpu.mem8[0xB48E3]).toBe(0x42);
    });
    test('two registerPort instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg8(segment, offset, 0x67);
      expect(cpu.reg8[regDH]).toBe(0x67);
    });
  });

  describe('writeRMReg16()', () => {
    test('use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00000000; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg16(segment, offset, 0x2142);

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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg16(segment, offset, 0x2142);

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
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg16(segment, offset, 0x2142);

      // (CS     * 0x10) + (  BX   +   SI  ) + disp  =
      // (0xABCD * 0x10) + (0x2345 + 0x5678) + 0x1256 =
      //    0xABCD0    +         0x79BD      + 0x1256 = 0xB48E3
      expect(cpu.mem8[0xB48E3]).toBe(0x42);
      expect(cpu.mem8[0xB48E4]).toBe(0x21);
    });
    test('two registerPort instruction; use R/M bits with REG table', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.mem8[0xABCD1] = 0b11111110; // addr mode
      cpu.decode();
      cpu.instIPInc = 2;
      cpu.addrIPInc = 0;
      let offset = addr.calcRMAddr(segment);

      addr.writeRMReg16(segment, offset, 0x5678);
      expect(cpu.reg16[regSI]).toBe(0x5678);
    });
  });
});

describe('Addressing Modes', () => {
  let addr, cpu, segment;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 1048576,
      debug: false,
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
    cpu.instIPInc = 2;
    cpu.addrIPInc = 0;
    cpu.decode();
  });

  describe('_1', () => {
    test('address', () => {
      expect(addr._1(segment)).toBe(null);
    });
    test('read', () => {
      expect(addr._1(segment, null)).toBe(0x01);
      expect(cpu.instIPInc).toBe(2);
    });
    test('write throws', () => {
      expect(() => {
        addr._1(segment, 0xFF, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('_3', () => {
    test('address', () => {
      expect(addr._3(segment)).toBe(null);
    });
    test('read', () => {
      expect(addr._3(segment, null)).toBe(0x03);
      expect(cpu.instIPInc).toBe(2);
    });
    test('write throws', () => {
      expect(() => {
        addr._3(segment, 0xFF, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('AX', () => {
    test('address', () => {
      expect(addr.AX(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.AX(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.AX(segment, null)).toBe(0x1234);
    });
    test('write', () => {
      addr.AX(segment, null, 0xFFFF);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.AX(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('AH', () => {
    test('address', () => {
      expect(addr.AH(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.AH(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.AH(segment, null)).toBe(0x12);
    });
    test('write', () => {
      addr.AH(segment, null, 0xFF);
      expect(cpu.reg8[regAH]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.AH(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('AL', () => {
    test('address', () => {
      expect(addr.AL(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.AL(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.AL(segment, null)).toBe(0x34);
    });
    test('write', () => {
      addr.AL(segment, null, 0xFF);
      expect(cpu.reg8[regAL]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.AL(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('BX', () => {
    test('address', () => {
      expect(addr.BX(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.BX(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.BX(segment, null)).toBe(0x2345);
    });
    test('write', () => {
      addr.BX(segment, null, 0xFFFF);
      expect(cpu.reg16[regBX]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.BX(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('BH', () => {
    test('address', () => {
      expect(addr.BH(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.BH(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.BH(segment, null)).toBe(0x23);
    });
    test('write', () => {
      addr.BH(segment, null, 0xFF);
      expect(cpu.reg8[regBH]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.BH(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('BL', () => {
    test('address', () => {
      expect(addr.BL(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.AL(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.BL(segment, null)).toBe(0x45);
    });
    test('write', () => {
      addr.BL(segment, null, 0xFF);
      expect(cpu.reg8[regBL]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.BL(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('CX', () => {
    test('address', () => {
      expect(addr.CX(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.CX(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.CX(segment, null)).toBe(0x3456);
    });
    test('write', () => {
      addr.CX(segment, null, 0xFFFF);
      expect(cpu.reg16[regCX]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.CX(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('CH', () => {
    test('address', () => {
      expect(addr.CH(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.CH(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.CH(segment, null)).toBe(0x34);
    });
    test('write', () => {
      addr.CH(segment, null, 0xFF);
      expect(cpu.reg8[regCH]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.CH(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('CL', () => {
    test('address', () => {
      expect(addr.CL(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.CL(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.CL(segment, null)).toBe(0x56);
    });
    test('write', () => {
      addr.CL(segment, null, 0xFF);
      expect(cpu.reg8[regCL]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.CL(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('DX', () => {
    test('address', () => {
      expect(addr.DX(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.DX(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read cycles', () => {
      addr.DX(segment, null);
      expect(cpu.instIPInc).toBe(2);
    });
    test('write', () => {
      addr.DX(segment, null, 0xFFFF);
      expect(cpu.reg16[regDX]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.DX(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('DH', () => {
    test('address', () => {
      expect(addr.DH(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.DL(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.DH(segment, null)).toBe(0x45);
    });
    test('write', () => {
      addr.DH(segment, null, 0xFF);
      expect(cpu.reg8[regDH]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.DH(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('DL', () => {
    test('address', () => {
      expect(addr.DL(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.DL(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.DL(segment, null)).toBe(0x67);
    });
    test('write', () => {
      addr.DL(segment, null, 0xFF);
      expect(cpu.reg8[regDL]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.DL(segment, 0xFF, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('SI', () => {
    test('address', () => {
      expect(addr.SI(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.SI(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.SI(segment, null)).toBe(0x5678);
    });
    test('write', () => {
      addr.SI(segment, null, 0xFFFF);
      expect(cpu.reg16[regSI]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.SI(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('DI', () => {
    test('address', () => {
      expect(addr.DI(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.DI(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.DI(segment, null)).toBe(0x6789);
    });
    test('write', () => {
      addr.DI(segment, null, 0xFFFF);
      expect(cpu.reg16[regDI]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.DI(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('BP', () => {
    test('address', () => {
      expect(addr.BP(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.BP(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.BP(segment, null)).toBe(0x789A);
    });
    test('write', () => {
      addr.BP(segment, null, 0xFFFF);
      expect(cpu.reg16[regBP]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.BP(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('SP', () => {
    test('address', () => {
      expect(addr.SP(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.SP(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.SP(segment, null)).toBe(0x89AB);
    });
    test('write', () => {
      addr.SP(segment, null, 0xFFFF);
      expect(cpu.reg16[regSP]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.SP(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('CS', () => {
    test('address', () => {
      expect(addr.CS(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.CS(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.CS(segment, null)).toBe(0xABCD);
    });
    test('write', () => {
      addr.CS(segment, null, 0xFFFF);
      expect(cpu.reg16[regCS]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.CS(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('DS', () => {
    test('address', () => {
      expect(addr.DS(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.DS(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.DS(segment, null)).toBe(0xBCD0);
    });
    test('write', () => {
      addr.DS(segment, null, 0xFFFF);
      expect(cpu.reg16[regDS]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.DS(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('ES', () => {
    test('address', () => {
      expect(addr.ES(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.ES(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.ES(segment, null)).toBe(0xCD01);
    });
    test('write', () => {
      addr.ES(segment, null, 0xFFFF);
      expect(cpu.reg16[regES]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.ES(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('SS', () => {
    test('address', () => {
      expect(addr.SS(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.SS(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.SS(segment, null)).toBe(0xD012);
    });
    test('write', () => {
      addr.SS(segment, null, 0xFFFF);
      expect(cpu.reg16[regSS]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.SS(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
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
      cpu.instIPInc = 1;
    });

    test('address', () => {
      expect(addr.Ap(segment)).toEqual(0x0001);
    });
    test('addr cycles', () => {
      addr.Ap(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(4);
    });
    test('read', () => {
      expect(addr.Ap(segment, 0x0001)).toEqual([0x5678, 0x1234]);
    });
    test('write throws', () => {
      expect(() => {
        addr.Ap(segment, 0x0001, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Eb', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
    });
    test('address', () => {
      expect(addr.Eb(segment)).toBe(0x7A13);
    });
    test('addr cycles', () => {
      addr.Eb(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Eb(segment, 0x7A13)).toBe(0x90);
    });
    test('write', () => {
      addr.Eb(segment, 0x7A13, 0xFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Eb(segment, 0x7A13)).toBe(0x90);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.Eb(segment, 0xFF, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe.skip('Ep', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
      cpu.mem8[0xB36E4] = 0x90;
      cpu.mem8[0xB36E5] = 0x80;
      cpu.mem8[0xB36E6] = 0x80;

      cpu.decode();
    });

    test('address', () => {
      expect(addr.Ep(segment)).toBe(0x7A13);
    });
    test('address cycles', () => {
      addr.Ep(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Ep(segment, 0x7A13)).toBe([0x8080, 0x9090]);
    });
    test('write throws', () => {
      expect(() => {
        addr.Ep(segment, 0x01, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Ev', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
      cpu.mem8[0xB36E4] = 0x90;
    });
    test('address', () => {
      expect(addr.Ev(segment)).toBe(0x7A13);
    });
    test('addr cycles', () => {
      addr.Ev(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Ev(segment, 0x7A13)).toBe(0x9090);
    });
    test('write', () => {
      addr.Ev(segment, 0x7A13, 0xFFFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
      expect(cpu.mem8[0xB36E4]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.Ev(segment, 0x7A13, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('Ew', () => {
    beforeEach(() => {
      cpu.mem8[0xB36E3] = 0x90;
      cpu.mem8[0xB36E4] = 0x90;
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
    });
    test('address', () => {
      let r = addr.Ew(segment);
      expect(r).toBe(0x7A13);
    });
    test('addr cycles', () => {
      addr.Ew(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Ew(segment, 0x7A13)).toBe(0x9090);
    });
    test('write', () => {
      addr.Ew(segment, 0x7A13, 0xFFFF);
      expect(cpu.mem8[0xB36E3]).toBe(0xFF);
      expect(cpu.mem8[0xB36E4]).toBe(0xFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.Ew(segment, 0x7A13, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('Gb', () => {
    test('address', () => {
      expect(addr.Gb(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.Gb(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.Gb(segment, null)).toBe(0x34);
    });
    test('write', () => {
      addr.Gb(segment, null, 0xFF);
      expect(cpu.reg8[regAL]).toBe(0xFF);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      let r = addr.Gb(segment, null);
      expect(r).toBe(0x34);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.Gb(segment, 0x7A13, 0xFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('Gv', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
    });

    test('address', () => {
      expect(addr.Gv(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.Gv(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read', () => {
      expect(addr.Gv(segment, null)).toBe(0x1234);
    });
    test('write', () => {
      addr.Gv(segment, null, 0xFFFF);
      expect(cpu.reg16[regAX]).toBe(0xFFFF);
    });
    test('write overflow throws', () => {
      expect(() => {
        addr.Gv(segment, 0x7A13, 0xFFFFF);
      }).toThrowError(ValueOverflowException);
    });
  });

  describe('Ib', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.mem8[0xABCD0] = 0x01; // inst (byte)

      cpu.instIPInc = 1; // usually the operation will do this
    });
    test('address', () => {
      expect(addr.Ib(segment)).toBe(0x01);
    });
    test('addr cycles', () => {
      addr.Ib(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Ib(segment, 0x01)).toBe(0x34);
    });
    test('write throws', () => {
      expect(() => {
        addr.Ib(segment, 0x01, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Ib(segment, 0x01)).toBe(0x34);
    });
  });

  describe('Iv', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.mem8[0xABCD0] = 0x01; // inst (byte)

      cpu.instIPInc = 1; // usually the operation will do this
    });
    test('address', () => {
      expect(addr.Iv(segment)).toBe(0x01);
    });
    test('addr cycles', () => {
      addr.Iv(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Iv(segment, 0x01)).toBe(0x1234);
    });
    test('write throws', () => {
      expect(() => {
        addr.Iv(segment, 0x01, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Iw', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x12; // arg1 byte high
      cpu.mem8[0xABCD3] = 0x78; // arg2 byte low
      cpu.mem8[0xABCD4] = 0x56; // arg2 byte high

      cpu.mem8[0xABCD0] = 0x01; // inst (byte)

      cpu.instIPInc = 1; // usually the operation will do this
    });
    test('address', () => {
      expect(addr.Iw(segment)).toBe(0x01);
    });
    test('addr cycles', () => {
      addr.Iw(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Iw(segment, 0x01)).toBe(0x1234);
    });
    test('write throws', () => {
      expect(() => {
        addr.Iw(segment, 0x01, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x00; // inst (byte)
      cpu.decode();
      expect(addr.Iw(segment, 0x01)).toBe(0x1234);
    });
  });

  describe('Jb', () => {
    beforeEach(() => {
      cpu.mem8[0xABCE2] = 0x34; // arg1 byte low
      cpu.mem8[0xABCE3] = 0x12; // arg1 byte high
      cpu.mem8[0xABCE4] = 0x78; // arg2 byte low
      cpu.mem8[0xABCE5] = 0x56; // arg2 byte high

      cpu.reg16[regIP] = 0x0011;

      cpu.instIPInc = 1; // usually the operation will do this
    });

    test('address', () => {
      expect(addr.Jb(segment)).toBe(0x12);
    });
    test('address cycles', () => {
      addr.Jb(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(1);
    });
    test('read', () => {
      expect(addr.Jb(segment, 0x12)).toBe(0x34 + 0x0011);
    });
    test('write throws', () => {
      expect(() => {
        addr.Jb(segment, 0x12, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Jb(segment, 0x12)).toBe(0x34 + 0x0011);
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

      cpu.instIPInc = 1; // usually the operation will do this
    });

    test('address', () => {
      expect(addr.Jv(segment)).toBe(0x12);
    });
    test('address cycles', () => {
      addr.Jv(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Jv(segment, 0x12)).toBe(0x1234 + 0x0011);
    });
    test('write throws', () => {
      expect(() => {
        addr.Jv(segment, 0x12, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
    test('addressing mode overrides operand-size bit', () => {
      cpu.mem8[0xABCD0] = 0x01; // inst (byte)
      cpu.decode();
      expect(addr.Jv(segment, 0x12)).toBe(0x1234 + 0x0011);
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

    test('address - Use R/M Table 1 for R/M operand', () => {
      cpu.mem8[0xABCD1] = 0b00000101; // addr mode
      cpu.decode();
      expect(addr.M(segment)).toEqual(0x9ABC);
    });
    test('address - Use R/M Table 2 with 8-bit displacement', () => {
      cpu.mem8[0xABCD1] = 0b01000101; // addr mode
      cpu.decode();
      expect(addr.M(segment)).toEqual(0x9ABC + 0x34);
    });
    test('address - Use R/M Table 2 with 16-bit displacement', () => {
      expect(addr.M(segment)).toEqual(0x9ABC + 0x1234);
    });
    test('address cycles', () => {
      addr.M(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.M(segment, 0xFF)).toBe(0xFF);
    });
    test('write throws', () => {
      expect(() => {
        addr.M(segment, 0x01, 0xFF);
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
    test('address - Use R/M Table 1 for R/M operand', () => {
      expect(addr.Mp(segment)).toEqual(0x1234);
    });
    test('address - Use R/M Table 2 with 8-bit displacement', () => {
      // 0x789A + 0x34 = 0x78CE
      // (0xABCD * 0x10) + 0x78CE = 0xB359E
      cpu.mem8[0xABCD1] = 0b01000110; // addr mode
      cpu.mem8[0xB359E] = 0x78; // v1 high
      cpu.mem8[0xB359F] = 0x56; // v1 low
      cpu.mem8[0xB35A0] = 0xBC; // v2 high
      cpu.mem8[0xB35A1] = 0x9A; // v2 low
      cpu.decode();
      expect(addr.Mp(segment)).toEqual(0x78CE);
    });
    test('address - Use R/M Table 2 with 16-bit displacement', () => {
      // 0x789A + 0x1234 = 0x8ACE
      // (0xABCD * 0x10) + 0x8ACE = 0xB479E
      cpu.mem8[0xABCD1] = 0b10000110; // addr mode
      cpu.mem8[0xB479E] = 0x78; // v1 high
      cpu.mem8[0xB479F] = 0x56; // v1 low
      cpu.mem8[0xB47A0] = 0xBC; // v2 high
      cpu.mem8[0xB47A1] = 0x9A; // v2 low
      cpu.decode();
      expect(addr.Mp(segment)).toEqual(0x8ACE);
    });
    test('address cycles', () => {
      addr.Mp(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Mp(segment, 0x1234)).toEqual([0x9ABC, 0x5678]);
    });
    test('write throws', () => {
      expect(() => {
        addr.Mp(segment, 0x01, 0xFF);
      }).toThrowError(InvalidAddressModeException);
    });
  });

  describe('Ob', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0xA2; // inst (byte)
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x56; // arg1 byte high
      cpu.instIPInc = 1; // usually the operation will do this

      // 0xABCD * 10 + 0x5634 = 0xB1304
      cpu.mem8[0xB1304] = 0xDD;
      // 0xCD01 * 10 + 0x5634 = 0xD2644
      cpu.mem8[0xD2644] = 0xEE;
    });
    test('address', () => {
      expect(addr.Ob(segment)).toBe(0x5634);
    });
    test('address with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      expect(addr.Ob(segment)).toBe(0x5634);
    });
    test('addr cycles', () => {
      addr.Ob(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Ob(segment, 0x5634)).toBe(0xDD);
    });
    test('read with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      expect(addr.Ob(segment, 0x5634)).toBe(0xEE);
    });
    test('write', () => {
      addr.Ob(segment, 0x5634, 0xAA);

      expect(cpu.mem8[0xB1304]).toBe(0xAA);
    });
    test('write with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      addr.Ob(segment, 0x5634, 0xBB);

      expect(cpu.mem8[0xD2644]).toBe(0xBB);
    });
  });

  describe('Ov', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0xA2; // inst (byte)
      cpu.mem8[0xABCD1] = 0x34; // arg1 byte low
      cpu.mem8[0xABCD2] = 0x56; // arg1 byte high
      cpu.instIPInc = 1; // usually the operation will do this

      // 0xABCD * 10 + 0x5634 = 0xB1304
      cpu.mem8[0xB1304] = 0xCC;
      cpu.mem8[0xB1305] = 0xDD;
      // 0xCD01 * 10 + 0x5634 = 0xD2644
      cpu.mem8[0xD2644] = 0xEE;
      cpu.mem8[0xD2645] = 0xFF;
    });
    test('address', () => {
      expect(addr.Ov(segment)).toBe(0x5634);
    });
    test('address with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      expect(addr.Ov(segment)).toBe(0x5634);
    });
    test('addr cycles', () => {
      addr.Ov(segment);
      expect(cpu.instIPInc).toBe(1);
      expect(cpu.addrIPInc).toBe(2);
    });
    test('read', () => {
      expect(addr.Ov(segment, 0x5634)).toBe(0xDDCC);
    });
    test('read with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      expect(addr.Ov(segment, 0x5634)).toBe(0xFFEE);
    });
    test('write', () => {
      addr.Ov(segment, 0x5634, 0xAABB);

      expect(cpu.mem8[0xB1304]).toBe(0xBB);
      expect(cpu.mem8[0xB1305]).toBe(0xAA);
    });
    test('write with segment prefix ES', () => {
      segment = cpu.reg16[regES];
      addr.Ov(segment, 0x5634, 0xBBCC);

      expect(cpu.mem8[0xD2644]).toBe(0xCC);
      expect(cpu.mem8[0xD2645]).toBe(0xBB);
    });
  });

  describe('Sw', () => {
    beforeEach(() => {
      cpu.mem8[0xABCD0] = 0x8E; // inst (byte)
      cpu.mem8[0xABCD1] = 0b00011000; // addr
      cpu.reg16[regES] = 0x1234;
      cpu.reg16[regCS] = 0xABCD;
      cpu.reg16[regSS] = 0x3456;
      cpu.reg16[regDS] = 0x4576;
      cpu.decode();
    });

    test('address', () => {
      expect(addr.Sw(segment)).toBe(null);
    });
    test('addr cycles', () => {
      addr.Sw(segment);
      expect(cpu.instIPInc).toBe(2);
      expect(cpu.addrIPInc).toBe(0);
    });
    test('read ES', () => {
      cpu.mem8[0xABCD1] = 0b00000000; // addr
      cpu.decode();
      expect(addr.Sw(segment, null)).toBe(0x1234);
    });
    test('read CS', () => {
      cpu.mem8[0xABCD1] = 0b00001000; // addr
      cpu.decode();
      expect(addr.Sw(segment, null)).toBe(0xABCD);
    });
    test('read SS', () => {
      cpu.mem8[0xABCD1] = 0b00010000; // addr
      cpu.decode();
      expect(addr.Sw(segment, null)).toBe(0x3456);
    });
    test('read DS', () => {
      cpu.mem8[0xABCD1] = 0b00011000; // addr
      cpu.decode();
      expect(addr.Sw(segment, null)).toBe(0x4576);
    });
    test('write ES', () => {
      cpu.mem8[0xABCD1] = 0b00000000; // addr
      cpu.decode();
      addr.Sw(segment, null, 0xFFFF);
      expect(cpu.reg16[regES]).toBe(0xFFFF);
    });
    test('write CS', () => {
      cpu.mem8[0xABCD1] = 0b00001000; // addr
      cpu.decode();
      addr.Sw(segment, null, 0xFFFF);
      expect(cpu.reg16[regCS]).toBe(0xFFFF);
    });
    test('write SS', () => {
      cpu.mem8[0xABCD1] = 0b00010000; // addr
      cpu.decode();
      addr.Sw(segment, null, 0xFFFF);
      expect(cpu.reg16[regSS]).toBe(0xFFFF);
    });
    test('write DS', () => {
      cpu.mem8[0xABCD1] = 0b00011000; // addr
      cpu.decode();
      addr.Sw(segment, null, 0xFFFF);
      expect(cpu.reg16[regDS]).toBe(0xFFFF);
    });
  });
});










