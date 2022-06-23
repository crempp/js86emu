import CPU8086 from '../../src/emu/cpu/8086';
import Addressing from '../../src/emu/cpu/Addressing';
import SystemConfig from '../../src/emu/config/SystemConfig';
import {
  assign,
  intByte2TwosComplement, intDouble2TwosComplement, intWord2TwosComplement,
  isByteSigned,
  isWordSigned, pop16, push16,
  seg2abs,
  segIP, signExtend16, signExtend32,
  twosComplement2IntByte, twosComplement2IntDouble,
  twosComplement2IntWord
} from "../../src/emu/utils/Utils";
import {
  regAH, regAL, regBH, regBL, regCH, regCL, regDH, regDL,
  regAX, regBX, regCX, regDX,
  regSI, regDI, regBP, regSP, regIP,
  regCS, regDS, regES, regSS,
  regFlags,
  FLAG_CF_MASK, FLAG_PF_MASK, FLAG_AF_MASK, FLAG_ZF_MASK, FLAG_SF_MASK,
  FLAG_TF_MASK, FLAG_IF_MASK, FLAG_DF_MASK, FLAG_OF_MASK,
} from '../../src/emu/Constants';
import Operations from "../../src/emu/cpu/Operations";

function setMemory(cpu, value) {
  for (let i = 0; i < cpu.mem8.length; i++) {
    cpu.mem8[i] = value;
  }
}

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

describe('segIP()', () => {
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

  test('segment calculation is correct', () => {
    cpu.reg16[regCS] = 0x1234;
    cpu.reg16[regIP] = 0x5678;

    let result = segIP(cpu);

    expect(result).toBe(0x179B8);
  });
  test('segment calculation zero', () => {
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regIP] = 0x0000;

    let result = segIP(cpu);

    expect(result).toBe(0x00000);
  });
  test('segment calculation top of range', () => {
    cpu.reg16[regCS] = 0xFFFF;
    cpu.reg16[regIP] = 0xFFFF;

    let result = segIP(cpu);

    expect(result).toBe(0x10FFEF);
  });

});

describe('is signed functions', () => {
  test('signed byte is is signed', () => {
    expect(isByteSigned(0xFF)).toBe(true);
  });
  test('unsigned byte is is not signed', () => {
    expect(isByteSigned(0x01)).toBe(false);
  });
  test('signed word is is signed', () => {
    expect(isWordSigned(0xFFFF)).toBe(true);
  });
  test('unsigned word is is not signed', () => {
    expect(isWordSigned(0x0001)).toBe(false);
  });
});

describe('twosComplement2Int', () => {
  test('positive byte converts (twosComplement2IntByte)', () => {
    expect(twosComplement2IntByte(0x79)).toBe(121);
  });
  test('negative byte converts (twosComplement2IntByte)', () => {
    expect(twosComplement2IntByte(0xF9)).toBe(-7);
  });
  test('positive word converts (twosComplement2IntWord)', () => {
    expect(twosComplement2IntWord(0x7979)).toBe(31097);
  });
  test('negative word converts (twosComplement2IntWord)', () => {
    expect(twosComplement2IntWord(0xF979)).toBe(-1671);
  });
  test('positive double converts (twosComplement2IntDouble)', () => {
    expect(twosComplement2IntDouble(0x79797979)).toBe(2038004089);
  });
  test('negative double converts (twosComplement2IntDouble)', () => {
    expect(twosComplement2IntDouble(0xF9797979)).toBe(-109479559);
  });
});

describe('int2TwosComplement', () => {
  test('positive 2s compliment byte converts', () => {
    expect(intByte2TwosComplement(121)).toBe(0x79);
  });
  test('negative 2s compliment byte converts', () => {
    expect(intByte2TwosComplement(-7)).toBe(0xF9);
  });
  test('positive 2s compliment word converts', () => {
    expect(intWord2TwosComplement(31097)).toBe(0x7979);
  });
  test('negative 2s compliment word converts', () => {
    expect(intWord2TwosComplement(-1671)).toBe(0xF979);
  });
  test('positive 2s compliment double converts', () => {
    expect(intDouble2TwosComplement(2038004089)).toBe(0x79797979);
  });
  test('negative 2s compliment double converts', () => {
    expect(intDouble2TwosComplement(-109479559)).toBe(0xF9797979);
  });
});

describe('signExtend', () => {
  test('extends a negative byte to a word', () => {
    expect(signExtend16(0x90)).toBe(0xFF90);
  });
  test('extends a positive byte to a word', () => {
    expect(signExtend16(0x50)).toBe(0x0050);
  });
  test('extends a negative word to a double', () => {
    expect(signExtend32(0x9000)).toBe(0xFFFF9000);
  });
  test('extends a positive word to a double', () => {
    expect(signExtend32(0x5000)).toBe(0x00005000);
  });
});

describe('assign', () => {
  test('object assignment deeply overrides and creates keys from multiple sources', () => {
    const target = {
      a: { x: 0 },
      b: { y: { m: 0, n: 1      } },
      c: { z: { i: 0, j: 1      } },
      d: null,
    }
    const source1 = {
      a: {},
      b: { y: {       n: 0      } },
      e: null,
    }
    const source2 = {
      c: { z: {            k: 2 } },
      d: {},
    }
    const expected = {
      a: { x: 0 },
      b: { y: { m: 0, n: 0      } },
      c: { z: { i: 0, j: 1, k: 2 } },
      d: {},
      e: null,
    }

    expect(assign(Object.create(target), source1, source2)).toStrictEqual(expected);
  });
});

describe("push/pop", () => {
  let cpu;
  let oper;

  beforeEach(() => {
    cpu = new CPU8086(new SystemConfig({
      memorySize: 2 ** 16,
      debug: false,
    }));
    oper = new Operations(cpu);
    cpu.reg16[regIP] = 0x00FF;
    cpu.reg16[regCS] = 0x0000;
    cpu.reg16[regSS] = 0x0400;
    cpu.reg16[regSP] = 0x0020;

    setMemory(cpu, 0xAA);
  });

  test('push16()', () => {
    push16(cpu, 0x1234);

    expect(cpu.mem8[0x0401E]).toBe(0x34);
    expect(cpu.mem8[0x0401F]).toBe(0x12);
    expect(cpu.reg16[regSP]).toBe(0x001E);
  });

  test('pop16()', () => {
    cpu.mem8[0x0401E] = 0x34;
    cpu.mem8[0x0401F] = 0x12;
    cpu.reg16[regSP] = 0x001E;

    expect(pop16(cpu)).toBe(0x1234);
    expect(cpu.reg16[regSP]).toBe(0x0020);
  });
})
