import winston from 'winston';

import CPU8086 from '../../src/emu/8086';
import Addressing from '../../src/emu/addressing'
import CPUConfig from '../../src/emu/CPUConfig'
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
  formatOpcode, hexString8, hexString16
} from "../../src/emu/Debug";

winston.level = 'warn';

describe('seg2abs() Segment to absolute memory address conversion', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memory: 1024
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0000;
    cpu.reg16[regES] = 0x0000;
    cpu.reg16[regSS] = 0x0000;
  });

  test('No segmentation returns same value as input', () => {
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(cpu.reg16[regES], 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(cpu.reg16[regSS], 0x0100)).toBe(0x0100);
  });

  test('CS segmentation returns correct absolute address',  () => {
    cpu.reg16[regCS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x000140);
    cpu.reg16[regCS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regCS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regCS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('DS segmentation returns correct absolute address',  () => {
    cpu.reg16[regDS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0100)).toBe(0x000140);
    cpu.reg16[regDS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regDS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regDS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('ES segmentation returns correct absolute address',  () => {
    cpu.reg16[regES] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regES], 0x0100)).toBe(0x000140);
    cpu.reg16[regES] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regES], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regES] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regES], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regES], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regES], 0xFFFF)).toBe(0x10FFEF);
  });

  test('SS segmentation returns correct absolute address',  () => {
    cpu.reg16[regSS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x0100)).toBe(0x000140);
    cpu.reg16[regSS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regSS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regSS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('CS override returns correct absolute address',  () => {
    cpu.CS_OVERRIDE = true;
    cpu.reg16[regCS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0100)).toBe(0x000140);
    cpu.reg16[regCS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regES], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regCS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regES], 0xFFFF)).toBe(0x10FFEF);
  });

  test('DS override returns correct absolute address',  () => {
    cpu.DS_OVERRIDE = true;
    cpu.reg16[regDS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x000140);
    cpu.reg16[regDS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regES], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regDS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regES], 0xFFFF)).toBe(0x10FFEF);
  });

  test('ES override returns correct absolute address',  () => {
    cpu.ES_OVERRIDE = true;
    cpu.reg16[regES] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x000140);
    cpu.reg16[regES] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regES] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regSS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regDS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('SS override returns correct absolute address',  () => {
    cpu.SS_OVERRIDE = true;
    cpu.reg16[regSS] = 0x0004;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x000140);
    cpu.reg16[regSS] = 0x258C;
    expect(addr.seg2abs(cpu.reg16[regDS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regSS] = 0xFFF0;
    expect(addr.seg2abs(cpu.reg16[regES], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regCS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(cpu.reg16[regDS], 0xFFFF)).toBe(0x10FFEF);
  });
});

describe('Memory access methods', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memory: 262399
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regCS] = 0x0001;
    cpu.reg16[regDS] = 0x0020;
    cpu.reg16[regES] = 0x0300;
    cpu.reg16[regSS] = 0x0400;
  });

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
        memory: 262399
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

  //   7                           0
  // +---+---+---+---+---+---+---+---+
  // |          opcode       | d | w |
  // +---+---+---+---+---+---+---+---+
  //   0   0   0   0   0   0   0   1
  //
  //   7                           0
  // +---+---+---+---+---+---+---+---+
  // |  mod  |    reg    |     rm    |
  // +---+---+---+---+---+---+---+---+
  //   0   0   0   0   0   0   0   0
  //
  //
  // mod = 00 register indirect
  // mod = 11 register direct
  //
  // cpu.mem8[0x0000] = 0x00; // inst (byte)
  // cpu.mem8[0x0000] = 0x01; // inst (word)
  //
  // console.log(formatOpcode(cpu.opcode));
  // console.log(hexString8(addr.readRegVal()));
  //
  // let str = "";
  // cpu.reg8.forEach((val) => {
  //   str += hexString8(val) + "\n";
  // });
  // console.log(str);
  // str = "";
  // cpu.reg16.forEach((val) => {
  //   str += hexString16(val) + "\n";
  // });
  // console.log(str);

  describe('readRegVal()', () => {
    test('read byte from AL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00000000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x12);
    });

    test('read byte from CL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00001000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from DL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00010000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read byte from BL', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00011000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x23);
    });

    test('read byte from AH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00100000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x34);
    });

    test('read byte from CH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00101000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x56);
    });

    test('read byte from DH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00110000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x67);
    });

    test('read byte from BH', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x45);
    });

    test('read word from AX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x1234);
    });

    test('read word from CX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00001000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x3456);
    });

    test('read word from DX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00010000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x4567);
    });

    test('read word from BX', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00011000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x2345);
    });

    test('read word from SP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00100000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x89AB);
    });

    test('read word from BP', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00101000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x789A);
    });

    test('read word from SI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00110000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x5678);
    });

    test('read word from DI', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal()).toBe(0x6789);
    });

    test('read byte from AL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x12);
    });

    test('read byte from CL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111001; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from DL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111010; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read byte from BL using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111011; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x23);
    });

    test('read byte from AH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111100; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x34);
    });

    test('read byte from CH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111101; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x56);
    });

    test('read byte from DH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00111110; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x67);
    });

    test('read byte from BH using RM', () => {
      cpu.mem8[0x0000] = 0x00; // inst (byte)
      cpu.mem8[0x0001] = 0b00000111; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x45);
    });

    test('read word from AX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111000; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x1234);
    });

    test('read word from CX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111001; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x3456);
    });

    test('read word from DX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111010; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x4567);
    });

    test('read word from BX using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111011; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x2345);
    });

    test('read word from SP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111100; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x89AB);
    });

    test('read word from BP using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111101; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x789A);
    });

    test('read word from SI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00111110; // addr
      cpu.decode();
      expect(addr.readRegVal(true)).toBe(0x5678);
    });

    test('read word from DI using RM', () => {
      cpu.mem8[0x0000] = 0x01; // inst (word)
      cpu.mem8[0x0001] = 0b00000111; // addr
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

describe('RMReg access methods', () => {
  describe('readRMReg8()', () => {

  });

  describe('readRMReg16()', () => {

  });

  describe('writeRMReg8()', () => {

  });

  describe('writeRMReg16()', () => {

  });
});

describe('Memory addressing mode methods', () => {
  describe('calcRMAddr', () => {

  });

  describe('calcRMDispAddr', () => {

  });

  describe('calcImmAddr', () => {

  });
});

describe('Addressing Modes', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memory: 1024
    }));
    addr = new Addressing(cpu);
  });

  describe('AX', () => {

  });

  describe('AH', () => {

  });

  describe('AL', () => {

  });

  describe('BX', () => {

  });

  describe('BH', () => {

  });

  describe('BL', () => {

  });

  describe('CX', () => {

  });

  describe('CH', () => {

  });

  describe('CL', () => {

  });

  describe('DX', () => {

  });

  describe('DH', () => {

  });

  describe('DL', () => {

  });

  describe('SI', () => {

  });

  describe('DI', () => {

  });

  describe('BP', () => {

  });

  describe('SP', () => {

  });

  describe('CS', () => {

  });

  describe('DS', () => {

  });

  describe('ES', () => {

  });

  describe('SS', () => {

  });

  describe('Ap', () => {

  });

  describe('Eb', () => {

  });

  describe('Ev', () => {

  });

  describe('Ew', () => {

  });

  describe('Gb', () => {

  });

  describe('Gv', () => {

  });

  describe('I0', () => {

  });

  describe('Ib', () => {

  });

  describe('Iv', () => {

  });

  describe('Iw', () => {

  });

  describe('Jb', () => {

  });

  describe('Jv', () => {

  });

  describe('M', () => {

  });

  describe('Mp', () => {

  });

  describe('Ob', () => {

  });

  describe('Ov', () => {

  });

  describe('Sw', () => {

  });
});










