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
  describe('readRegVal()', () => {

  });

  describe('writeRegVal()', () => {

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










