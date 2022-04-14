import CPU8086 from '../../src/emu/cpu/8086';
import Addressing from '../../src/emu/cpu/Addressing';
import SystemConfig from '../../src/emu/config/SystemConfig';
import { seg2abs } from "../../src/emu/utils/Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../src/emu/Constants';

describe('seg2abs() Segment to absolute memory address conversion', () => {
  let addr, cpu;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memory: 1024
    }));
    addr = new Addressing(cpu);
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regDS] = 0x0000;
    cpu.reg16[regES] = 0x0000;
    cpu.reg16[regSS] = 0x0000;
  });

  test('No segmentation returns same value as input', () => {
    expect(seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x0100);
    expect(seg2abs(cpu.reg16[regDS], 0x0100)).toBe(0x0100);
    expect(seg2abs(cpu.reg16[regES], 0x0100)).toBe(0x0100);
    expect(seg2abs(cpu.reg16[regSS], 0x0100)).toBe(0x0100);
  });

  test('CS segmentation returns correct absolute address',  () => {
    cpu.reg16[regCS] = 0x0004;
    expect(seg2abs(cpu.reg16[regCS], 0x0100)).toBe(0x000140);
    cpu.reg16[regCS] = 0x258C;
    expect(seg2abs(cpu.reg16[regCS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regCS] = 0xFFF0;
    expect(seg2abs(cpu.reg16[regCS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regCS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regCS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regCS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regCS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('DS segmentation returns correct absolute address',  () => {
    cpu.reg16[regDS] = 0x0004;
    expect(seg2abs(cpu.reg16[regDS], 0x0100)).toBe(0x000140);
    cpu.reg16[regDS] = 0x258C;
    expect(seg2abs(cpu.reg16[regDS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regDS] = 0xFFF0;
    expect(seg2abs(cpu.reg16[regDS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regDS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regDS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regDS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regDS], 0xFFFF)).toBe(0x10FFEF);
  });

  test('ES segmentation returns correct absolute address',  () => {
    cpu.reg16[regES] = 0x0004;
    expect(seg2abs(cpu.reg16[regES], 0x0100)).toBe(0x000140);
    cpu.reg16[regES] = 0x258C;
    expect(seg2abs(cpu.reg16[regES], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regES] = 0xFFF0;
    expect(seg2abs(cpu.reg16[regES], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regES] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regES], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regES] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regES], 0xFFFF)).toBe(0x10FFEF);
  });

  test('SS segmentation returns correct absolute address',  () => {
    cpu.reg16[regSS] = 0x0004;
    expect(seg2abs(cpu.reg16[regSS], 0x0100)).toBe(0x000140);
    cpu.reg16[regSS] = 0x258C;
    expect(seg2abs(cpu.reg16[regSS], 0x0012)).toBe(0x0258D2);
    cpu.reg16[regSS] = 0xFFF0;
    expect(seg2abs(cpu.reg16[regSS], 0x00FF)).toBe(0x00FFFFF);
    cpu.reg16[regSS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regSS], 0x0000)).toBe(0x00FFFF0);
    cpu.reg16[regSS] = 0xFFFF;
    expect(seg2abs(cpu.reg16[regSS], 0xFFFF)).toBe(0x10FFEF);
  });
});

describe.skip('segIP()', () => {});

describe.skip('twosComplement2IntByte()', () => {});

describe.skip('twosComplement2IntWord()', () => {});

describe('signExtend16()', () => {
  test('[regression] sign extend 0x90', () => {

  });
});
