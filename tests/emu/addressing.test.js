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

describe('Addressing Modes', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memory: 1024
    }));
    addr = new Addressing(cpu);
  });

  test('Eb retrieve', () => {
    // expect(addr.Eb()).toBe(0);
  });

  test.skip('Eb set', () => {
    addr.Eb(0);
    // expect(0).toBe(0);
  });
});

describe('seg2abs', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new CPUConfig({
      memory: 1024
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regCS] = 0x00;
    cpu.reg16[regDS] = 0x00;
    cpu.reg16[regES] = 0x00;
    cpu.reg16[regSS] = 0x00;
  });

  test('No segmentation returns same value as input', () => {
    expect(addr.seg2abs(regCS, 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(regDS, 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(regES, 0x0100)).toBe(0x0100);
    expect(addr.seg2abs(regSS, 0x0100)).toBe(0x0100);
  });

  test('CS segmentation returns correct absolute address',  () => {
    cpu.reg16[regCS] = 0x0004;
    expect(addr.seg2abs(regCS, 0x0100)).toBe(0x000140);
    cpu.reg16[regCS] = 0x258C;
    expect(addr.seg2abs(regCS, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regCS] = 0xFFF0;
    expect(addr.seg2abs(regCS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(regCS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(regCS, 0xFFFF)).toBe(0x10FFEF);
  });

  test('DS segmentation returns correct absolute address',  () => {
    cpu.reg16[regDS] = 0x0004;
    expect(addr.seg2abs(regDS, 0x0100)).toBe(0x000140);
    cpu.reg16[regDS] = 0x258C;
    expect(addr.seg2abs(regDS, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regDS] = 0xFFF0;
    expect(addr.seg2abs(regDS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(regDS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(regDS, 0xFFFF)).toBe(0x10FFEF);
  });

  test('ES segmentation returns correct absolute address',  () => {
    cpu.reg16[regES] = 0x0004;
    expect(addr.seg2abs(regES, 0x0100)).toBe(0x000140);
    cpu.reg16[regES] = 0x258C;
    expect(addr.seg2abs(regES, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regES] = 0xFFF0;
    expect(addr.seg2abs(regES, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(regES, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(regES, 0xFFFF)).toBe(0x10FFEF);
  });

  test('SS segmentation returns correct absolute address',  () => {
    cpu.reg16[regSS] = 0x0004;
    expect(addr.seg2abs(regSS, 0x0100)).toBe(0x000140);
    cpu.reg16[regSS] = 0x258C;
    expect(addr.seg2abs(regSS, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regSS] = 0xFFF0;
    expect(addr.seg2abs(regSS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(regSS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(regSS, 0xFFFF)).toBe(0x10FFEF);
  });

  test('CS override returns correct absolute address',  () => {
    cpu.CS_OVERRIDE = true;
    cpu.reg16[regCS] = 0x0004;
    expect(addr.seg2abs(regDS, 0x0100)).toBe(0x000140);
    cpu.reg16[regCS] = 0x258C;
    expect(addr.seg2abs(regES, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regCS] = 0xFFF0;
    expect(addr.seg2abs(regSS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(regDS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regCS] = 0xFFFF;
    expect(addr.seg2abs(regES, 0xFFFF)).toBe(0x10FFEF);
  });

  test('DS override returns correct absolute address',  () => {
    cpu.DS_OVERRIDE = true;
    cpu.reg16[regDS] = 0x0004;
    expect(addr.seg2abs(regCS, 0x0100)).toBe(0x000140);
    cpu.reg16[regDS] = 0x258C;
    expect(addr.seg2abs(regES, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regDS] = 0xFFF0;
    expect(addr.seg2abs(regSS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(regCS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regDS] = 0xFFFF;
    expect(addr.seg2abs(regES, 0xFFFF)).toBe(0x10FFEF);
  });

  test('ES override returns correct absolute address',  () => {
    cpu.ES_OVERRIDE = true;
    cpu.reg16[regES] = 0x0004;
    expect(addr.seg2abs(regCS, 0x0100)).toBe(0x000140);
    cpu.reg16[regES] = 0x258C;
    expect(addr.seg2abs(regDS, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regES] = 0xFFF0;
    expect(addr.seg2abs(regSS, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(regCS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regES] = 0xFFFF;
    expect(addr.seg2abs(regDS, 0xFFFF)).toBe(0x10FFEF);
  });

  test('SS override returns correct absolute address',  () => {
    cpu.SS_OVERRIDE = true;
    cpu.reg16[regSS] = 0x0004;
    expect(addr.seg2abs(regCS, 0x0100)).toBe(0x000140);
    cpu.reg16[regSS] = 0x258C;
    expect(addr.seg2abs(regDS, 0x0012)).toBe(0x0258D2);
    cpu.reg16[regSS] = 0xFFF0;
    expect(addr.seg2abs(regES, 0x00FF)).toBe(0x0FFFFF);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(regCS, 0x0000)).toBe(0x0FFFF0);
    cpu.reg16[regSS] = 0xFFFF;
    expect(addr.seg2abs(regDS, 0xFFFF)).toBe(0x10FFEF);
  });
});
